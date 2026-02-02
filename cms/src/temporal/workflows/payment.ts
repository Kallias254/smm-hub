import { proxyActivities, defineSignal, setHandler, sleep, condition } from '@temporalio/workflow';
import type * as activities from '../activities/payments.ts';

const { 
  initiateStkPushActivity, 
  queryTransactionStatusActivity, 
  markPaymentSuccessActivity, 
  markPaymentFailedActivity 
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

// Signal to receive the Webhook Payload
export const paymentCallbackSignal = defineSignal<[any]>('paymentCallback');

export interface PaymentWorkflowInput {
  paymentId: string;
  amount: number;
  phoneNumber: string;
}

export async function PaymentWorkflow(input: PaymentWorkflowInput): Promise<string> {
  let callbackData: any = null;
  let isPaid = false;
  let isFailed = false;

  // 1. Initiate Payment
  const { checkoutRequestId } = await initiateStkPushActivity({
    paymentId: input.paymentId,
    amount: input.amount,
    phoneNumber: input.phoneNumber,
  });

  // 2. Setup Signal Handler
  setHandler(paymentCallbackSignal, (data) => {
    callbackData = data;
    // Inspect the callback data structure (Standard M-Pesa Body)
    const body = data?.Body?.stkCallback;
    if (body?.ResultCode === 0) {
      isPaid = true;
    } else {
      isFailed = true;
    }
  });

  // 3. Wait Loop (Race: Signal vs Timeout)
  // We wait up to 5 minutes for the user to enter PIN
  const userActionTimeout = '5 minutes';
  
  const hasSignal = await condition(() => isPaid || isFailed, userActionTimeout);

  if (hasSignal) {
    if (isPaid) {
      // Success Path via Webhook
      await markPaymentSuccessActivity(input.paymentId, callbackData?.Body?.stkCallback?.CallbackMetadata);
      return 'completed';
    } else {
      // Failure Path via Webhook (User Cancelled, etc)
      await markPaymentFailedActivity(input.paymentId, 'User Cancelled or Failed via Webhook');
      return 'failed';
    }
  }

  // 4. Timeout Fallback (The "Guard")
  // If we reached here, 5 minutes passed and NO webhook came.
  // We must query the API manually.
  const status = await queryTransactionStatusActivity(checkoutRequestId);

  if (status === 'completed') {
    await markPaymentSuccessActivity(input.paymentId, { source: 'manual_query' });
    return 'completed';
  } else {
    await markPaymentFailedActivity(input.paymentId, 'Timeout and Query Confirmed Failure');
    return 'failed';
  }
}

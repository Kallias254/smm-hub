import { getGlobalPayload } from '../payload-client.ts';
import { daraja } from '../../payments/daraja.ts';

export async function initiateStkPushActivity(input: {
  paymentId: string;
  phoneNumber: string;
  amount: number;
}): Promise<{ checkoutRequestId: string }> {
  const payload = getGlobalPayload();

  // 1. Fetch Tenant ID from payment for reference
  const payment = await payload.findByID({
    collection: 'payments',
    id: input.paymentId,
  });

  const tenantId = typeof payment.tenant === 'object' ? payment.tenant.id : payment.tenant;

  // 2. Initiate STK Push
  const response = await daraja.initiateSTKPush({
    phoneNumber: input.phoneNumber,
    amount: input.amount,
    accountReference: `Tenant-${tenantId}`,
  });

  // 3. Update Payment Record with CheckoutRequestID
  await payload.update({
    collection: 'payments',
    id: input.paymentId,
    data: {
      checkoutRequestId: response.CheckoutRequestID,
      status: 'pending',
    },
  });

  return { 
    checkoutRequestId: response.CheckoutRequestID
  };
}

export async function queryTransactionStatusActivity(checkoutRequestId: string): Promise<string> {
  const response = await daraja.queryTransactionStatus(checkoutRequestId);
  
  // Daraja Error Code '1032' means Cancelled
  // ResponseCode '0' means Success
  // But Query API structure is tricky. 
  // If ResultCode exists, check it.
  
  if (response.ResultCode === '0') {
    return 'completed';
  } else if (response.ResultCode && response.ResultCode !== '0') {
    return 'failed'; 
  } else if (response.errorCode) {
     // If error code is '500.001.1001' -> "The transaction is being processed"
     // We should return 'pending' so the workflow waits more.
     return 'pending';
  }

  return 'pending';
}

export async function markPaymentSuccessActivity(paymentId: string, metadata: any): Promise<void> {
  const payload = getGlobalPayload();
  
  // This update will trigger the 'afterChange' hook in Payments collection
  // which handles the Credit addition.
  await payload.update({
    collection: 'payments',
    id: paymentId,
    data: {
      status: 'completed',
      rawCallback: metadata,
      transactionId: metadata?.MpesaReceiptNumber || 'N/A', // Extract from callback metadata if available
    },
  });
}

export async function markPaymentFailedActivity(paymentId: string, reason: string): Promise<void> {
  const payload = getGlobalPayload();
  await payload.update({
    collection: 'payments',
    id: paymentId,
    data: {
      status: 'failed',
      rawCallback: { reason },
    },
  });
}

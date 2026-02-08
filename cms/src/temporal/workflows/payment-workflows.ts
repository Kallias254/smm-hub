import { proxyActivities } from '@temporalio/workflow'
import type * as activities from '../activities/payment-activities'

const { processPaymentActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '2 minutes',
})

export async function ProcessPaymentWorkflow(paymentId: string): Promise<void> {
  await processPaymentActivity(paymentId)
}

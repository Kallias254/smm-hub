import { getGlobalPayload } from '../payload-client'

export async function processPaymentActivity(paymentId: string): Promise<void> {
  const payload = getGlobalPayload()
  
  const payment = await payload.findByID({
    collection: 'payments',
    id: paymentId,
  })

  if (payment.status !== 'completed') return

  const tenantId = typeof payment.tenant === 'object' ? (payment.tenant as any).id : payment.tenant
  
  const tenant = await payload.findByID({ 
    collection: 'tenants', 
    id: tenantId 
  })
  
  const currentCredits = tenant.billing?.credits || 0
  const purchasedCredits = Math.floor(payment.amount / 10)
  
  await payload.update({
    collection: 'tenants',
    id: tenantId,
    data: {
      billing: {
        ...tenant.billing,
        credits: currentCredits + purchasedCredits,
        subscriptionStatus: 'active'
      }
    },
  })
  console.log(`[PaymentActivity] Added ${purchasedCredits} credits to Tenant ${tenant.name}`)
}

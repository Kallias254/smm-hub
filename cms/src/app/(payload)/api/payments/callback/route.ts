import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'

export const POST = async (req: Request) => {
  const payload = await getPayload({ config: configPromise })
  
  try {
    const data = await req.json()
    console.log('🔔 M-PESA Callback Received:', JSON.stringify(data, null, 2))

    const callback = data.Body.stkCallback
    const resultCode = callback.ResultCode
    const checkoutRequestId = callback.CheckoutRequestID

    // 1. Find the Payment Record
    const payments = await payload.find({
      collection: 'payments',
      where: {
        checkoutRequestId: { equals: checkoutRequestId },
      },
    })

    if (payments.docs.length === 0) {
      console.warn(`Payment not found for CheckoutRequestID: ${checkoutRequestId}`)
      return NextResponse.json({ received: true })
    }

    const payment = payments.docs[0]
    
    // 2. Determine Status
    let status: 'completed' | 'failed' = 'failed'
    let transactionId = ''

    if (resultCode === 0) {
      status = 'completed'
      // Extract Receipt Number
      const meta = callback.CallbackMetadata?.Item || []
      const receiptItem = meta.find((item: any) => item.Name === 'MpesaReceiptNumber')
      if (receiptItem) {
        transactionId = receiptItem.Value
      }
    }

    // 3. Update Payment Record
    await payload.update({
      collection: 'payments',
      id: payment.id,
      data: {
        status,
        transactionId: transactionId || undefined,
        rawCallback: data,
      },
    })

    // 4. If Successful, Update Tenant Credits
    if (status === 'completed') {
       const tenantId = typeof payment.tenant === 'object' ? payment.tenant.id : payment.tenant
       
       // Fetch current tenant to get existing credits
       const tenant = await payload.findByID({
         collection: 'tenants',
         id: tenantId,
       })

       const currentCredits = tenant.billing?.credits || 0
       const purchasedCredits = Math.floor(payment.amount / 10) // 500 KES = 50 Credits

       await payload.update({
         collection: 'tenants',
         id: tenantId,
         data: {
           billing: {
             ...tenant.billing,
             credits: currentCredits + purchasedCredits,
             subscriptionStatus: 'active',
           }
         }
       })
       console.log(`✅ Tenant ${tenantId} Top Up Success! Added ${purchasedCredits} credits. New Balance: ${currentCredits + purchasedCredits}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Callback Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

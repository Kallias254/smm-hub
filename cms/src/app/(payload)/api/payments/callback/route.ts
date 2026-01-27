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

    // 4. Update Payment Status (The Collection Hook will handle Credit addition)
    await payload.update({
        collection: 'payments',
        id: payment.id,
        data: {
            status: status,
            transactionId: mpesaReceiptNumber,
            rawCallback: callbackData,
        }
    })

    if (status === 'completed') {
        console.log(`✅ Payment verified: ${mpesaReceiptNumber}`)
    } else {
        console.log(`❌ Payment failed or cancelled.`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Callback Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

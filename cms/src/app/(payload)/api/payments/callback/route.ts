import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getTemporalClient } from '../../../../../temporal/client'

export const POST = async (req: Request) => {
  const payload = await getPayload({ config: configPromise })
  
  try {
    const data = await req.json()
    console.log('🔔 M-PESA Callback Received:', JSON.stringify(data, null, 2))

    const callback = data.Body.stkCallback
    const checkoutRequestId = callback.CheckoutRequestID

    // 1. Find the Payment Record to get the ID (which is part of the Workflow ID)
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
    const workflowId = `payment-${payment.id}`

    // 2. Signal the Temporal Workflow
    try {
        const temporal = await getTemporalClient()
        const handle = temporal.workflow.getHandle(workflowId)
        
        await handle.signal('paymentCallback', data)
        console.log(`✅ Signaled Workflow ${workflowId} with callback data.`)
    } catch (err: any) {
        console.warn(`⚠️ Failed to signal workflow ${workflowId} (might be closed or not found):`, err.message)
        // We do NOT fail the webhook response, as we might have processed it manually via query
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Callback Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

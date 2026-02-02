import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { NextResponse } from 'next/server'
import { getTemporalClient } from '../../../../../temporal/client'

export const POST = async (req: Request) => {
  const payload = await getPayload({ config: configPromise })
  
  try {
    const { tenantId, amount, phoneNumber } = await req.json()

    if (!tenantId || !amount || !phoneNumber) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // 1. Create Payment Record (Placeholder)
    const payment = await payload.create({
      collection: 'payments',
      data: {
        tenant: tenantId,
        amount,
        phoneNumber,
        status: 'pending',
        // checkoutRequestId will be filled by the Workflow
      },
    })

    // 2. Start Temporal Workflow
    try {
        const temporal = await getTemporalClient()
        const workflowId = `payment-${payment.id}`
        
        await temporal.workflow.start('PaymentWorkflow', {
            taskQueue: 'branding-queue',
            workflowId: workflowId,
            args: [{
                paymentId: String(payment.id),
                amount,
                phoneNumber,
            }],
        })
        console.log(`[Temporal] Started Payment Workflow: ${workflowId}`)
    } catch (e: any) {
        console.error('[Temporal] Failed to start payment workflow:', e)
        // Update payment to failed if workflow dispatch fails
        await payload.update({
            collection: 'payments',
            id: payment.id,
            data: { status: 'failed', rawCallback: { error: 'Workflow Dispatch Failed' } }
        })
        throw e
    }

    return NextResponse.json({ 
      success: true, 
      paymentId: payment.id,
      message: 'Payment initiated. Check your phone.' 
    })

  } catch (error: any) {
    console.error('Payment Initiation Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

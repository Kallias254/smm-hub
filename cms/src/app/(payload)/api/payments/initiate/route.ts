import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { daraja } from '../../../../../payments/daraja'
import { NextResponse } from 'next/server'

export const POST = async (req: Request) => {
  const payload = await getPayload({ config: configPromise })
  
  try {
    const { tenantId, amount, phoneNumber } = await req.json()

    if (!tenantId || !amount || !phoneNumber) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // 1. Initiate STK Push
    const darajaResponse = await daraja.initiateSTKPush({
      phoneNumber, // Ensure format 254...
      amount,
      accountReference: `Tenant-${tenantId}`,
    })

    // 2. Create Payment Record
    const payment = await payload.create({
      collection: 'payments',
      data: {
        tenant: tenantId,
        amount,
        phoneNumber,
        checkoutRequestId: darajaResponse.CheckoutRequestID,
        status: 'pending',
      },
    })

    return NextResponse.json({ 
      success: true, 
      paymentId: payment.id,
      checkoutRequestId: darajaResponse.CheckoutRequestID 
    })

  } catch (error: any) {
    console.error('Payment Initiation Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

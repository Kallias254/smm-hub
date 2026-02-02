export class DarajaClient {
  private consumerKey: string
  private consumerSecret: string
  private passkey: string
  private shortcode: string
  private baseUrl: string
  private callbackUrl: string

  constructor() {
    this.consumerKey = process.env.DARAJA_CONSUMER_KEY || ''
    this.consumerSecret = process.env.DARAJA_CONSUMER_SECRET || ''
    this.passkey = process.env.DARAJA_PASSKEY || ''
    this.shortcode = process.env.DARAJA_SHORTCODE || '174379' // Sandbox default
    this.baseUrl = process.env.DARAJA_ENV === 'sandbox' 
      ? 'https://sandbox.safaricom.co.ke' 
      : 'https://api.safaricom.co.ke'
    
    this.callbackUrl = process.env.DARAJA_CALLBACK_URL || 'http://localhost:3000/api/payments/callback'
  }

  private async getAccessToken(): Promise<string> {
    if (!this.consumerKey || !this.consumerSecret) {
      console.warn('⚠️ Missing Daraja Credentials. Using Mock Token.')
      return 'mock-access-token'
    }

    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64')
    
    const response = await fetch(`${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Daraja Auth Failed: ${error}`)
    }

    const data = await response.json()
    return data.access_token
  }

  async initiateSTKPush({ phoneNumber, amount, accountReference }: { phoneNumber: string, amount: number, accountReference: string }) {
    if (!this.consumerKey) {
       console.log('⚠️ Mocking STK Push (No Credentials)')
       return {
         MerchantRequestID: "mock-merchant-id",
         CheckoutRequestID: `ws_CO_MOCK_${Date.now()}`,
         ResponseCode: "0",
         ResponseDescription: "Success. Request accepted for processing",
         CustomerMessage: "Success. Request accepted for processing"
       }
    }

    const token = await this.getAccessToken()
    
    // Timestamp format: YYYYMMDDHHmmss
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    
    // Password: Base64.encode(Shortcode + Passkey + Timestamp)
    const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64')

    const payload = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,
      PartyB: this.shortcode,
      PhoneNumber: phoneNumber,
      CallBackURL: this.callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: `Payment for ${accountReference}`,
    }

    console.log('🚀 Initiating STK Push:', payload)

    const response = await fetch(`${this.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(`STK Push Failed: ${JSON.stringify(data)}`)
    }

    return data
  }

  async queryTransactionStatus(checkoutRequestId: string) {
    if (!this.consumerKey) {
       console.log('⚠️ Mocking STK Query (No Credentials)')
       return {
         ResultCode: "0",
         ResultDesc: "The service request is processed successfully.",
         ResponseDescription: "The service request is processed successfully.",
         ResponseCode: "0",
         MerchantRequestID: "mock-merchant-id",
         CheckoutRequestID: checkoutRequestId,
       }
    }

    const token = await this.getAccessToken()
    
    // Timestamp format: YYYYMMDDHHmmss
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64')

    const payload = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    }

    const response = await fetch(`${this.baseUrl}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()
    
    // Note: Daraja Query returns an error object if the transaction is pending/not found
    // We handle that in the activity
    return data
  }
}

export const daraja = new DarajaClient()
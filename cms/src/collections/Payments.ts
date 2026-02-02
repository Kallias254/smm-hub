import { CollectionConfig } from 'payload'

export const Payments: CollectionConfig = {
  slug: 'payments',
  admin: {
    useAsTitle: 'transactionId',
    group: 'Billing',
    defaultColumns: ['transactionId', 'status', 'amount', 'tenant', 'createdAt'],
  },
  access: {
    create: ({ req: { user } }) => !!user,
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.tenants && user.tenants.length > 0) {
        const tenantIds = user.tenants.map(t => typeof t === 'object' ? t.id : t)
        return {
          tenant: {
            in: tenantIds,
          },
        }
      }
      return false
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.tenants && user.tenants.length > 0) {
        const tenantIds = user.tenants.map(t => typeof t === 'object' ? t.id : t)
        return {
          tenant: {
            in: tenantIds,
          },
        }
      }
      return false
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.tenants && user.tenants.length > 0) {
        const tenantIds = user.tenants.map(t => typeof t === 'object' ? t.id : t)
        return {
          tenant: {
            in: tenantIds,
          },
        }
      }
      return false
    },
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        // Only run if status changed to 'completed' and it wasn't already completed
        if (doc.status === 'completed' && previousDoc?.status !== 'completed') {
             const tenantId = typeof doc.tenant === 'object' ? doc.tenant.id : doc.tenant
             
             // Fetch current tenant to get existing credits
             const tenant = await req.payload.findByID({ 
                collection: 'tenants', 
                id: tenantId 
             })
             
             const currentCredits = tenant.billing?.credits || 0
             const purchasedCredits = Math.floor(doc.amount / 10) // 500 KES = 50 Credits
             
             await req.payload.update({
                 collection: 'tenants',
                 id: tenantId,
                 data: {
                     billing: {
                         ...tenant.billing,
                         credits: currentCredits + purchasedCredits,
                         subscriptionStatus: 'active'
                     }
                 },
                 req // Pass context
             })
             console.log(`[Payment] Added ${purchasedCredits} credits to Tenant ${tenant.name}`)
        }
      }
    ]
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
    },
    {
      name: 'phoneNumber',
      type: 'text',
      required: true,
      admin: {
        description: 'Format: 2547XXXXXXXX',
      },
    },
    {
      name: 'transactionId',
      type: 'text',
      label: 'M-PESA Receipt',
    },
    {
      name: 'checkoutRequestId',
      type: 'text',
      unique: true,
      required: false, 
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'rawCallback',
      type: 'json', // Store the full callback for debugging
      admin: {
        readOnly: true,
      },
    },
  ],
}

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
      if (user.tenant) {
        const tenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }
      return false
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.tenant) {
        const tenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }
      return false
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.tenant) {
        const tenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }
      return false
    },
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
      required: true, 
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

import { CollectionConfig } from 'payload'
import { getTemporalClient } from '../temporal/client'

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
      async ({ doc, previousDoc }) => {
        // Only run if status changed to 'completed' and it wasn't already completed
        if (doc.status === 'completed' && previousDoc?.status !== 'completed') {
          try {
            const temporal = await getTemporalClient()
            await temporal.workflow.start('ProcessPaymentWorkflow', {
              taskQueue: 'branding-queue',
              workflowId: `process-payment-${doc.id}`,
              args: [doc.id],
            })
          } catch (e) {
            console.error('[PaymentHook] Failed to start payment processing workflow:', e)
          }
        }
      },
    ],
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

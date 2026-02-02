import { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'clientName',
    group: 'Reputation',
    defaultColumns: ['clientName', 'rating', 'status', 'tenant', 'createdAt'],
  },
  access: {
    create: () => true, // Public can create (via the gate)
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
      return {
        tenant: {
          in: user.tenants?.map(t => typeof t === 'object' ? t.id : t) || [],
        },
      }
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'clientName',
      type: 'text',
      required: true,
    },
    {
      name: 'clientPhone',
      type: 'text',
      admin: {
        description: 'Used to track who the review came from',
      },
    },
    {
      name: 'rating',
      type: 'select',
      options: [
        { label: 'Positive (Promoter)', value: 'positive' },
        { label: 'Negative (Detractor)', value: 'negative' },
      ],
      required: true,
    },
    {
      name: 'feedback',
      type: 'textarea',
      label: 'Private Feedback',
      admin: {
        condition: (data) => data.rating === 'negative',
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'received',
      options: [
        { label: 'Received', value: 'received' },
        { label: 'Sent to Google', value: 'google_redirect' },
        { label: 'Escalated to Agent', value: 'escalated' },
        { label: 'Resolved', value: 'resolved' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'googleReviewLink',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'The link the user was sent to if they were a promoter',
      },
    },
  ],
  timestamps: true,
}

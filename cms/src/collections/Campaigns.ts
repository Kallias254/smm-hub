import { CollectionConfig } from 'payload'

export const Campaigns: CollectionConfig = {
  slug: 'campaigns',
  admin: {
    useAsTitle: 'title',
    group: 'Marketing',
  },
  access: {
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === "admin") return true
      if (user.tenant) {
        const tenantId = typeof user.tenant === "object" ? user.tenant.id : user.tenant
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
      if (user.role === "admin") return true
      if (user.tenant) {
        const tenantId = typeof user.tenant === "object" ? user.tenant.id : user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }
      return false
    },
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === "admin") return true
      if (user.tenant) {
        const tenantId = typeof user.tenant === "object" ? user.tenant.id : user.tenant
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
      name: 'title',
      type: 'text',
      required: true,
      label: 'Campaign Name',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        condition: (data, siblingData) => siblingData?.role === 'admin', // Only show if admin, otherwise auto-fill? Need hooks for that.
      },
    },
    {
      name: 'budget',
      type: 'number',
      label: 'Budget (KES)',
      defaultValue: 0,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
        },
        {
          name: 'endDate',
          type: 'date',
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
        { label: 'Completed', value: 'completed' },
        { label: 'Paused', value: 'paused' },
      ],
    },
  ],
}

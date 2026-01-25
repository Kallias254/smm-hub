import { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    group: 'Organization',
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      
      // Users can only see their own tenant
      if (user.tenant) {
        const tenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant
        return {
          id: {
            equals: tenantId,
          },
        }
      }
      return false
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      
      // Agency Owners can update their own tenant
      if (user.role === 'tenant_owner' && user.tenant) {
        const tenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant
        return {
          id: {
            equals: tenantId,
          },
        }
      }
      return false
    },
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Agency Name',
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        description: 'URL-friendly ID (e.g., nairobi-west-agency)',
      },
    },
    {
      name: 'branding',
      type: 'group',
      fields: [
        {
          name: 'primaryColor',
          type: 'text', // In a real app, use a color picker custom component
          defaultValue: '#000000',
          required: true,
          admin: {
            description: 'Hex code for branding (e.g., #FF5733)',
          },
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Watermark logo for generated images/videos',
          },
        },
      ],
    },
    {
      name: 'billing',
      type: 'group',
      fields: [
        {
          name: 'mpesaShortcode',
          type: 'text',
          admin: {
            description: 'Paybill or Till Number for this client',
          },
        },
        {
          name: 'subscriptionStatus',
          type: 'select',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Past Due', value: 'past_due' },
            { label: 'Cancelled', value: 'cancelled' },
          ],
          defaultValue: 'active',
        },
      ],
    },
    {
      name: 'integrations',
      type: 'group',
      fields: [
        {
          name: 'postizApiKey',
          type: 'text',
          admin: {
            description: 'API Key for the dedicated Postiz Workspace',
          },
        },
      ],
    },
  ],
}

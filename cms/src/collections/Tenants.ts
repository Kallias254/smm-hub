import { CollectionConfig } from 'payload'
import { createPostizWorkspace } from './Tenants/hooks/createPostizWorkspace.ts'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    group: 'Organization',
  },
  hooks: {
    afterChange: [createPostizWorkspace],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      
      // Users can only see their own tenants
      if (user.tenants && user.tenants.length > 0) {
        const tenantIds = user.tenants.map(t => typeof t === 'object' ? t.id : t)
        return {
          id: {
            in: tenantIds,
          },
        }
      }
      return false
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      
      // Agency Owners can update their own tenants
      if (user.role === 'tenant_owner' && user.tenants && user.tenants.length > 0) {
        const tenantIds = user.tenants.map(t => typeof t === 'object' ? t.id : t)
        return {
          id: {
            in: tenantIds,
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
      name: 'subdomain',
      type: 'text',
      unique: true,
      required: true,
      admin: {
        description: 'The subdomain for this agency (e.g. "nebula" for nebula.smmhub.localhost). Use only lowercase letters, numbers, and hyphens.',
      },
      validate: (val: any) => {
        if (!val) return 'Subdomain is required'
        const pattern = /^[a-z0-9-]+$/
        if (!pattern.test(val)) return 'Subdomain can only contain lowercase letters, numbers, and hyphens'
        
        const protectedSubdomains = ['admin', 'www', 'api', 'dev', 'postiz', 'mail', 'system', 'global']
        if (protectedSubdomains.includes(val.toLowerCase())) {
          return `${val} is a protected subdomain and cannot be used.`
        }
        return true
      }
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
          name: 'plan',
          type: 'select',
          defaultValue: 'starter',
          options: [
            { label: 'Starter', value: 'starter' },
            { label: 'Pro', value: 'pro' },
            { label: 'Agency', value: 'agency' },
          ],
        },
        {
          name: 'credits',
          type: 'number',
          defaultValue: 20,
          label: 'Video Generation Credits',
          admin: {
            description: 'Remaining credits for branded video generation',
          },
        },
        {
          name: 'seatLimit',
          type: 'number',
          defaultValue: 5,
          required: true,
          label: 'User Seat Limit',
          admin: {
            description: 'Maximum number of users/freelancers allowed for this tenant.',
          },
        },
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
        {
          name: 'serviceTier',
          type: 'select',
          defaultValue: 'self_service',
          required: true,
          options: [
            { label: 'Self-Service (1x Cost)', value: 'self_service' },
            { label: 'Managed (2x Cost)', value: 'managed' },
            { label: 'Elite/Agency (5x Cost)', value: 'elite' },
          ],
          admin: {
            description: 'Defines the value level and multiplier for this tenant.',
          },
        },
        {
          name: 'costMultiplier',
          type: 'number',
          defaultValue: 1,
          required: true,
          admin: {
            description: 'Advanced: Manual override for credit burn rate.',
            condition: (data, siblingData, { user }) => user?.role === 'admin',
          },
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
            readOnly: true,
            description: 'Automatically provisioned API Key for the dedicated Postiz Workspace',
          },
        },
        {
          name: 'ingestionKey',
          type: 'text',
          admin: {
            description: 'Secret Key for external apps to push data to SMM Hub',
          },
        },
      ],
    },
  ],
}

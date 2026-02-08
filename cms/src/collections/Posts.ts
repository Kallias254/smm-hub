import { CollectionConfig } from 'payload'
import { RealEstateListing, SportsFixture, RetailProduct, ServicePackage } from '../blocks/CreativeBlocks'
import { getTemporalClient } from '../temporal/client'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    group: 'Marketing',
  },
  access: {
    create: ({ req: { user } }) => !!user,
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
    read: ({ req }) => {
      const { user, headers } = req
      if (!user) return false

      // Get the active tenant from header
      const activeTenantSubdomain = headers.get('x-tenant-subdomain')

      // If header is present, filter by it (Admin impersonation or User context)
      if (activeTenantSubdomain) {
         // Admins can see any tenant they request
         if (user.role === 'admin') {
            return {
                'tenant.subdomain': { equals: activeTenantSubdomain }
            } as any
         }
         
         // Regular users must belong to the tenant
         if (user.tenants && user.tenants.length > 0) {
            const tenantIds = user.tenants.map((t: any) => typeof t === 'object' ? t.id : t)
            return {
                and: [
                    { tenant: { in: tenantIds } },
                    { 'tenant.subdomain': { equals: activeTenantSubdomain } }
                ]
            } as any
         }
         return false
      }

      // Default Admin Access (Show All)
      if (user.role === 'admin') return true

      // Default User Access (Show All Their Tenants)
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
        try {
          const temporal = await getTemporalClient()
          await temporal.workflow.start('PostProcessingWorkflow', {
            taskQueue: 'branding-queue', // Or a more appropriate queue
            workflowId: `post-processing-${doc.id}-${new Date().getTime()}`,
            args: [doc, previousDoc],
          })
          console.log(`[Hook] Started PostProcessingWorkflow for post ${doc.id}`)
        } catch (e) {
          console.error('[Hook] Failed to start PostProcessingWorkflow:', e)
        }
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Internal Title (Admin Only)',
    },
    {
      name: 'content',
      type: 'blocks',
      required: true,
      minRows: 1,
      maxRows: 1,
      blocks: [
        RealEstateListing,
        SportsFixture,
        RetailProduct,
        ServicePackage,
      ],
      admin: {
        description: 'Select the type of content to generate (Real Estate or Sports)',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      hooks: {
        beforeValidate: [
          ({ req, value }) => {
            if (req.user && req.user.role !== 'admin' && req.user.tenants && req.user.tenants.length > 0) {
              const firstTenant = req.user.tenants[0]
              const myTenantId = typeof firstTenant === 'object' ? firstTenant.id : firstTenant
              return myTenantId
            }
            return value
          },
        ]
      },
      admin: {
        position: 'sidebar',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'campaign',
      type: 'relationship',
      relationTo: 'campaigns',
      required: false,
      admin: {
        description: 'Link this post to a specific Campaign or Content Library.',
      },
    },
    {
        name: 'usageStats',
        type: 'group',
        admin: {
            position: 'sidebar',
            readOnly: true,
        },
        fields: [
            {
                name: 'usageCount',
                type: 'number',
                defaultValue: 0,
            },
            {
                name: 'lastUsedAt',
                type: 'date',
            }
        ]
    },
    {
      name: 'caption',
      type: 'richText',
      label: 'Post Caption',
    },
    {
      name: 'channels',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Facebook Page', value: 'facebook' },
        { label: 'Instagram Feed', value: 'instagram' },
        { label: 'LinkedIn', value: 'linkedin' },
        { label: 'X (Twitter)', value: 'twitter' },
        { label: 'WhatsApp Status (Manual)', value: 'whatsapp_status' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'scheduledAt',
          type: 'date',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'recurrenceInterval',
          type: 'select',
          defaultValue: 'none',
          options: [
            { label: 'None (One-off)', value: 'none' },
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
          ],
          admin: {
            width: '50%',
            description: 'Auto-repost this content periodically (e.g. Vacant Listings)',
          },
        },
      ],
    },
    {
      name: 'distributionStatus',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending Approval', value: 'pending' },
        { label: 'Queued', value: 'queued' },
        { label: 'Published', value: 'published' }, 
        { label: 'Recurring (Active)', value: 'recurring' }, 
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'distributionLogs',
      type: 'array',
      label: 'Publication History',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      fields: [
        {
          name: 'timestamp',
          type: 'date',
        },
        {
          name: 'status',
          type: 'text',
        },
        {
          name: 'destination',
          type: 'text',
        },
      ],
    },
    {
      name: 'assets',
      type: 'group',
      label: 'Creative Assets',
      fields: [
        {
          name: 'rawMedia',
          type: 'relationship',
          relationTo: 'media',
          label: 'Raw Input (User Upload)',
        },
        {
          name: 'brandedMedia',
          type: 'relationship',
          relationTo: 'media',
          label: 'Final Output (Generated)',
          admin: {
            readOnly: true,
            description: 'This is auto-generated by the Creative Engine',
          },
        },
      ],
    },
  ],
}
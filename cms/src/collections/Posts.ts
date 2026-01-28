import { CollectionConfig } from 'payload'
import { RealEstateListing, SportsFixture, RetailProduct, ServicePackage } from '../blocks/CreativeBlocks'

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
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req, previousDoc }) => {
        // 1. Creative Engine Trigger (New Raw Media)
        if (doc.assets?.rawMedia && !doc.assets?.brandedMedia) {
          const tenantId = typeof doc.tenant === 'object' ? doc.tenant.id : doc.tenant
          
          // A. Fetch Tenant to check Credits
          const tenant = await req.payload.findByID({
            collection: 'tenants',
            id: tenantId,
          })

          // B. Determine Cost based on Media Type
          const rawMediaId = typeof doc.assets.rawMedia === 'object' ? doc.assets.rawMedia.id : doc.assets.rawMedia
          const rawMedia = await req.payload.findByID({
            collection: 'media',
            id: rawMediaId,
          })
          
          const isVideo = rawMedia.mimeType?.startsWith('video/')
          const baseCost = isVideo ? 5 : 1
          
          // Apply Service Tier Multiplier
          const multiplier = tenant.billing?.costMultiplier || 1
          const finalCost = baseCost * multiplier
          
          const credits = tenant.billing?.credits || 0

          if (credits < finalCost) {
             console.warn(`[CreativeEngine] Skipped generation for Tenant ${tenant.name}: Insufficient Credits (Has: ${credits}, Needs: ${finalCost}).`)
             return
          }

          // C. Deduct Credit (Optimistic)
          await req.payload.update({
             collection: 'tenants',
             id: tenantId,
             data: {
                billing: {
                    ...tenant.billing,
                    credits: credits - finalCost,
                }
             },
             req, // Pass request context to maintain auth/transaction
          })
          console.log(`[CreativeEngine] Deducted ${finalCost} credit(s) from ${tenant.name} (Base: ${baseCost}x${multiplier}). New Balance: ${credits - finalCost}`)

          // D. Proceed with Generation
          const taskSlug = isVideo ? 'generateBrandedVideo' : 'generateBrandedImage'

          // Extract Data from the first Content Block
          const activeBlock = doc.content?.[0]
          let creativeData = {}

          if (activeBlock && activeBlock.data) {
             creativeData = {
               template: activeBlock.blockType,
               ...activeBlock.data as object
             }
          }

          await req.payload.jobs.queue({
            task: taskSlug,
            input: {
              postId: doc.id,
              mediaId: doc.assets.rawMedia,
              tenantId: doc.tenant,
              data: creativeData,
            },
          })
        }

        // 2. Distribution Trigger
        if (
          doc.distributionStatus === 'queued' && 
          previousDoc?.distributionStatus !== 'queued' &&
          (doc.assets?.brandedMedia || (typeof doc.assets?.brandedMedia === 'object' && doc.assets.brandedMedia !== null))
        ) {
          await req.payload.jobs.queue({
            task: 'publishToPostiz',
            input: {
              postId: doc.id,
              channels: doc.channels || [],
            },
          })
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
            // Auto-assign tenant for non-admins. Use the first tenant if multiple exist.
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
        { label: 'Published', value: 'published' }, // For one-offs
        { label: 'Recurring (Active)', value: 'recurring' }, // Visual helper
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

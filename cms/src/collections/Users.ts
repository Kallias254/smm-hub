import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Organization',
  },
  auth: true,
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      
      // Tenant users can only see users in their own tenant
      if (user.tenant) {
        const tenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant
        return {
          tenant: {
            equals: tenantId,
          },
        }
      }
      return {
        id: {
          equals: user.id,
        },
      }
    },
    create: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      // Agency Owners can create users
      if (user.role === 'tenant_owner') return true
      return false
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      
      // Users can update themselves
      // Tenant Owners can update users in their tenant
      if (user.tenant) {
        const tenantId = typeof user.tenant === 'object' ? user.tenant.id : user.tenant
        return {
          or: [
            {
              id: {
                equals: user.id,
              },
            },
            {
              tenant: {
                equals: tenantId,
              },
            },
          ]
        }
      }
      return {
        id: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      
      // Tenant Owners can delete users in their tenant
      if (user.role === 'tenant_owner' && user.tenant) {
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
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'agent',
      options: [
        { label: 'System Admin', value: 'admin' },
        { label: 'Agency Owner', value: 'tenant_owner' },
        { label: 'Agent', value: 'agent' },
      ],
      validate: (value, { req }) => {
        // Security: Prevent non-admins from creating admins
        if (req.user && req.user.role !== 'admin' && value === 'admin') {
          return 'You cannot assign the Admin role.'
        }
        return true
      },
      access: {
        update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'tenant_owner',
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      saveToJWT: true, 
      hooks: {
        beforeChange: [
          ({ req, value }) => {
            // Security: If not admin, FORCE the user's own tenant
            if (req.user && req.user.role !== 'admin' && req.user.tenant) {
              const myTenantId = typeof req.user.tenant === 'object' ? req.user.tenant.id : req.user.tenant
              return myTenantId
            }
            return value
          }
        ]
      },
      admin: {
        position: 'sidebar',
        // Hide tenant field for non-admins (it's auto-assigned)
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
  ],
}
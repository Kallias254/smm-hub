import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Organization',
  },
  auth: true,
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
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      saveToJWT: true, // We need this for the access control logic later
      admin: {
        position: 'sidebar',
        condition: (data, siblingData) => siblingData?.role !== 'admin',
      },
    },
  ],
}
import { CollectionConfig } from 'payload'

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    group: 'Organization',
  },
  access: {
    // We will lock this down later to ensure users only see their own tenant
    read: () => true,
    create: () => true, 
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
  ],
}

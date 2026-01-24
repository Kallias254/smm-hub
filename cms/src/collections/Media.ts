import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Creative Assets',
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: 'media',
    mimeTypes: ['image/*', 'video/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      // required: true, // Uncomment when Auth is fully ready
      admin: {
        description: 'The agency that owns this asset',
      },
    },
    {
      name: 'isPanorama',
      type: 'checkbox',
      label: 'Is this a 360° Panorama?',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'panoramaType',
      type: 'select',
      label: 'Panorama Mode',
      options: [
        { label: 'Full Sphere (Pro Camera)', value: 'sphere' },
        { label: 'Cylindrical (Phone/Mount)', value: 'cylinder' },
      ],
      admin: {
        condition: (data, siblingData) => siblingData.isPanorama,
      },
    },
  ],
}
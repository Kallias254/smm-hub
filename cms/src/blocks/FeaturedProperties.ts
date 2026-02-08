import { Block } from 'payload'

export const FeaturedPropertiesBlock: Block = {
  slug: 'featuredProperties',
  interfaceName: 'FeaturedPropertiesBlock',
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
      defaultValue: 'Featured Properties',
    },
    {
      name: 'properties',
      type: 'relationship',
      relationTo: 'properties',
      hasMany: true,
      minRows: 1,
      maxRows: 6,
    },
  ],
}

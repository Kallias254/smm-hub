import { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlock',
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
    },
    {
      name: 'subtext',
      type: 'text',
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
  ],
}

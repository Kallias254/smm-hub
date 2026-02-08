import { CollectionConfig } from 'payload'
import { HeroBlock } from '../blocks/Hero'
import { SplitLayoutBlock } from '../blocks/SplitLayout'
import { RichTextBlock } from '../blocks/RichText'
import { FeaturedPropertiesBlock } from '../blocks/FeaturedProperties'
import { FullScreenChatBlock } from '../blocks/FullScreenChat'

export const Homepages: CollectionConfig = {
  slug: 'homepages',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    description: 'Build your public-facing homepage using a modular block-based editor.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'layout',
      label: 'Page Layout',
      type: 'blocks',
      minRows: 1,
      blocks: [
        HeroBlock,
        SplitLayoutBlock,
        RichTextBlock,
        FeaturedPropertiesBlock,
        FullScreenChatBlock,
      ],
    },
  ],
}

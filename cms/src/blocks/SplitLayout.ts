import { Block } from 'payload'
import { ChatbotBlock } from './Chatbot'
import { PreferenceFormBlock } from './PreferenceForm'

export const SplitLayoutBlock: Block = {
  slug: 'splitLayout',
  interfaceName: 'SplitLayoutBlock',
  fields: [
    {
      name: 'layout',
      type: 'radio',
      options: [
        { label: 'Image Left, Content Right', value: 'imageLeft' },
        { label: 'Content Left, Image Right', value: 'imageRight' },
      ],
      defaultValue: 'imageLeft',
      admin: {
        layout: 'horizontal',
      }
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'content',
      type: 'blocks',
      required: true,
      minRows: 1,
      maxRows: 1,
      blocks: [ChatbotBlock, PreferenceFormBlock],
    },
  ],
}

import { Block } from 'payload'

export const FullScreenChatBlock: Block = {
  slug: 'fullScreenChat',
  interfaceName: 'FullScreenChatBlock',
  fields: [
    {
      name: 'typebotId',
      type: 'text',
      required: true,
      label: 'Typebot Public ID',
      admin: {
        description: 'The public ID of the Typebot to display full-screen (e.g., "real-estate-concierge").',
      }
    },
  ],
}

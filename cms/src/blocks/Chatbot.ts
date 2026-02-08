import { Block } from 'payload'

export const ChatbotBlock: Block = {
  slug: 'chatbot',
  interfaceName: 'ChatbotBlock',
  fields: [
    {
      name: 'typebotId',
      type: 'text',
      required: true,
      admin: {
        description: 'The public ID of the Typebot to display.',
      },
    },
  ],
}

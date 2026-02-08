import { Block } from 'payload'

export const PreferenceFormBlock: Block = {
  slug: 'preferenceForm',
  interfaceName: 'PreferenceFormBlock',
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      admin: {
        description: 'Select the form to display.',
      }
    },
  ],
}

import { CollectionConfig } from 'payload'

export const Forms: CollectionConfig = {
  slug: 'forms',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
        name: 'fields',
        type: 'json',
        // In a real app, you would use the payload-plugin-form-builder
        // For now, we just define a placeholder
        admin: {
            description: 'This is a placeholder for form fields. Ideally, use a form builder plugin.'
        }
    }
  ],
}

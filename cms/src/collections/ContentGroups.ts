import { CollectionConfig } from 'payload'

export const ContentGroups: CollectionConfig = {
  slug: 'content-groups',
  admin: {
    useAsTitle: 'title',
    group: 'Marketing',
    defaultColumns: ['title', 'tenant', 'nextRun', 'status'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Library Name (e.g. "Monday Motivation")',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Paused', value: 'paused' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'frequency',
          type: 'select',
          required: true,
          options: [
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
          ],
          admin: {
            width: '33%',
          },
        },
        {
          name: 'timeOfDay',
          type: 'text', // Simple "HH:MM" validation can be added later
          required: true,
          label: 'Time (24h format, e.g. 09:00)',
          admin: {
            width: '33%',
            placeholder: '09:00',
          },
        },
        {
          name: 'dayOfWeek',
          type: 'select',
          label: 'Day (Weekly Only)',
          options: [
             { label: 'Sunday', value: '0' },
             { label: 'Monday', value: '1' },
             { label: 'Tuesday', value: '2' },
             { label: 'Wednesday', value: '3' },
             { label: 'Thursday', value: '4' },
             { label: 'Friday', value: '5' },
             { label: 'Saturday', value: '6' },
          ],
          admin: {
            condition: (data) => data.frequency === 'weekly',
            width: '33%',
          },
        },
      ],
    },
    {
      name: 'strategy',
      type: 'select',
      defaultValue: 'cycle',
      label: 'Selection Strategy',
      options: [
        { label: 'Cycle (Next in line)', value: 'cycle' },
        { label: 'Shuffle (Random)', value: 'shuffle' },
      ],
      admin: {
        description: 'How should we pick the next post from this group?',
      },
    },
    {
      name: 'nextRun',
      type: 'date',
      label: 'Next Scheduled Run',
      admin: {
        position: 'sidebar',
        date: {
            pickerAppearance: 'dayAndTime',
        }
      },
    },
    {
      name: 'lastRun',
      type: 'date',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
        name: 'channels',
        type: 'select',
        hasMany: true,
        label: 'Default Channels',
        options: [
          { label: 'Facebook Page', value: 'facebook' },
          { label: 'Instagram Feed', value: 'instagram' },
          { label: 'LinkedIn', value: 'linkedin' },
          { label: 'X (Twitter)', value: 'twitter' },
          { label: 'WhatsApp Status (Manual)', value: 'whatsapp_status' },
        ],
    },
  ],
}

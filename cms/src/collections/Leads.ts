import type { CollectionConfig } from 'payload'

export const Leads: CollectionConfig = {
  slug: 'leads',
  admin: {
    useAsTitle: 'phone',
    defaultColumns: ['phone', 'type', 'status', 'createdAt'],
  },
  access: {
    create: () => true, // Allow public to create leads (will be validated via API)
    read: ({ req: { user } }) => Boolean(user), // Only admins/agents can view leads
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Tour Booking', value: 'booking' },
        { label: 'WhatsApp Click', value: 'whatsapp' }, // Optional: if we ever want to track clicks
        { label: 'General Inquiry', value: 'inquiry' },
      ],
      required: true,
      defaultValue: 'booking',
    },
    {
        name: 'status',
        type: 'select',
        options: [
            { label: 'Pending Verification', value: 'pending' },
            { label: 'Verified', value: 'verified' },
            { label: 'Contacted', value: 'contacted' },
            { label: 'Closed', value: 'closed' },
        ],
        defaultValue: 'pending',
        admin: {
            position: 'sidebar',
        }
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
      label: 'Phone Number',
    },
    {
        name: 'bookingDetails',
        type: 'group',
        admin: {
            condition: (data) => data.type === 'booking',
        },
        fields: [
            {
                name: 'date',
                type: 'date',
                required: true,
            },
            {
                name: 'slot',
                type: 'text', // e.g., "10:00 AM"
            },
            {
                name: 'method',
                type: 'select',
                options: ['In-Person', 'Video Chat'],
                defaultValue: 'In-Person',
            }
        ]
    },
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
      required: false,
      label: 'Interested In (Listing)',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
    },
  ],
}

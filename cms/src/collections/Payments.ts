import { CollectionConfig } from 'payload'

export const Payments: CollectionConfig = {
  slug: 'payments',
  admin: {
    useAsTitle: 'transactionId',
    group: 'Billing',
    defaultColumns: ['transactionId', 'status', 'amount', 'tenant', 'createdAt'],
  },
  access: {
    read: () => true,
    create: () => true, // We'll secure this with hooks/logic later
    update: () => false, // Payments should be immutable mostly
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      required: true,
    },
    {
      name: 'phoneNumber',
      type: 'text',
      required: true,
      admin: {
        description: 'Format: 2547XXXXXXXX',
      },
    },
    {
      name: 'transactionId',
      type: 'text',
      label: 'M-PESA Receipt',
    },
    {
      name: 'checkoutRequestId',
      type: 'text',
      unique: true,
      required: true, 
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Completed', value: 'completed' },
        { label: 'Failed', value: 'failed' },
      ],
    },
    {
      name: 'rawCallback',
      type: 'json', // Store the full callback for debugging
      admin: {
        readOnly: true,
      },
    },
  ],
}

import { CollectionConfig } from 'payload'
import { calculateCampaignResources } from './Campaigns/hooks/calculateCampaignResources.ts'

export const Campaigns: CollectionConfig = {
  slug: 'campaigns',
  admin: {
    useAsTitle: 'title',
    group: 'Marketing',
    defaultColumns: ['title', 'tenant', 'status', 'scheduleMode', 'nextRun'],
  },
  hooks: {
    beforeChange: [calculateCampaignResources],
  },
  access: {
    create: ({ req: { user } }) => !!user,
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.tenants && user.tenants.length > 0) {
        const tenantIds = user.tenants.map(t => typeof t === 'object' ? t.id : t)
        return {
          tenant: {
            in: tenantIds,
          },
        }
      }
      return false
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.tenants && user.tenants.length > 0) {
        const tenantIds = user.tenants.map(t => typeof t === 'object' ? t.id : t)
        return {
          tenant: {
            in: tenantIds,
          },
        }
      }
      return false
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.tenants && user.tenants.length > 0) {
        const tenantIds = user.tenants.map(t => typeof t === 'object' ? t.id : t)
        return {
          tenant: {
            in: tenantIds,
          },
        }
      }
      return false
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Campaign Name (e.g. "Summer Sale 2026")',
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
        { label: 'Active (Running)', value: 'active' },
        { label: 'Paused', value: 'paused' },
        { label: 'Draft', value: 'draft' },
        { label: 'Completed/Spent', value: 'completed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Schedule & Strategy',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'scheduleMode',
                  type: 'select',
                  defaultValue: 'fixed',
                  required: true,
                  options: [
                    { label: 'Fixed Duration (Start/End Date)', value: 'fixed' },
                    { label: 'Evergreen (Run until Credits Empty)', value: 'evergreen' },
                  ],
                  admin: { width: '50%' },
                },
                {
                  name: 'strategy',
                  type: 'select',
                  defaultValue: 'cycle',
                  label: 'Post Selection Strategy',
                  options: [
                    { label: 'Cycle (Oldest first)', value: 'cycle' },
                    { label: 'Shuffle (Random)', value: 'shuffle' },
                  ],
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'startDate',
                  type: 'date',
                  required: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'endDate',
                  type: 'date',
                  admin: {
                    width: '50%',
                    condition: (data) => data.scheduleMode === 'fixed',
                  },
                },
              ],
            },
            {
              name: 'automation',
              type: 'group',
              label: 'Posting Cadence',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'frequency',
                      type: 'select',
                      defaultValue: 'daily',
                      options: [
                        { label: 'Manual Only', value: 'manual' },
                        { label: 'Daily', value: 'daily' },
                        { label: 'Weekly', value: 'weekly' },
                        { label: 'Monthly', value: 'monthly' },
                      ],
                      admin: { width: '33%' },
                    },
                    {
                      name: 'timeOfDay',
                      type: 'text',
                      label: 'Time (24h)',
                      admin: {
                        width: '33%',
                        placeholder: '09:00',
                        condition: (data) => data.automation?.frequency !== 'manual',
                      },
                    },
                    {
                      name: 'dayOfWeek',
                      type: 'select',
                      label: 'Day (Weekly)',
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
                        condition: (data) => data.automation?.frequency === 'weekly',
                        width: '33%',
                      },
                    },
                  ],
                },
              ]
            },
          ],
        },
        {
          label: 'Resources & Credits',
          fields: [
            {
              name: 'resources',
              type: 'group',
              fields: [
                {
                  name: 'allocatedCredits',
                  type: 'number',
                  label: 'Allocated Credits',
                  defaultValue: 50,
                  required: true,
                  admin: {
                    description: 'Total generation credits assigned to this specific campaign.',
                  },
                },
                {
                  name: 'projectedUsage',
                  type: 'text',
                  label: 'Credit Forecast',
                  admin: {
                    readOnly: true,
                    description: 'Automatically calculated based on your schedule settings.',
                  },
                },
              ]
            }
          ],
        },
      ],
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
        name: 'defaultChannels',
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
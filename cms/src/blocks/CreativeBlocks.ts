import { Block } from 'payload'

export const RealEstateListing: Block = {
  slug: 'real-estate-listing', // Template Key
  labels: {
    singular: 'Real Estate Listing',
    plural: 'Real Estate Listings',
  },
  fields: [
    {
      name: 'price',
      type: 'text',
      label: 'Price (e.g. KES 15M)',
      required: true,
    },
    {
      name: 'location',
      type: 'text',
      label: 'Location (e.g. Kilimani)',
      required: true,
    },
    {
      name: 'features',
      type: 'text',
      label: 'Key Features (e.g. 4 Bed | 3 Bath)',
    },
  ],
}

export const SportsFixture: Block = {
  slug: 'sports-fixture', // Template Key
  labels: {
    singular: 'Sports Fixture',
    plural: 'Sports Fixtures',
  },
  fields: [
    {
      name: 'league',
      type: 'text',
      label: 'League (e.g. Premier League)',
      defaultValue: 'Premier League',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'homeTeam',
          type: 'text',
          label: 'Home Team',
          required: true,
        },
        {
          name: 'awayTeam',
          type: 'text',
          label: 'Away Team',
          required: true,
        },
      ],
    },
    {
      name: 'matchTime',
      type: 'text',
      label: 'Time (e.g. 15:00 EAT)',
      required: true,
    },
    {
      name: 'prediction',
      type: 'text',
      label: 'Prediction (Optional)',
    },
  ],
}

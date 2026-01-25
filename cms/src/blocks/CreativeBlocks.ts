import { Block } from 'payload'

export const RealEstateListing: Block = {
  slug: 'real-estate-listing',
  imageURL: 'https://payloadcms.com/images/blocks/content.png',
  imageAltText: 'Real Estate Content',
  fields: [
    {
      name: 'data',
      type: 'json',
      required: true,
      label: 'Listing Data (JSON)',
      admin: {
        description: 'Flexible JSON data: { price, location, features: [], agent: {} }',
      },
    },
  ],
}

export const SportsFixture: Block = {
  slug: 'sports-fixture',
  imageURL: 'https://payloadcms.com/images/blocks/content.png',
  imageAltText: 'Sports Content',
  fields: [
    {
      name: 'data',
      type: 'json',
      required: true,
      label: 'Fixture/Bet Data (JSON)',
      admin: {
        description: 'Flexible JSON data: { matches: [], league, predictions, slipCode }',
      },
    },
  ],
}

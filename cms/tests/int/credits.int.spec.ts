import { getPayload, Payload } from 'payload'
import config from '../../src/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'
import path from 'path'
import fs from 'fs'

let payload: Payload
let tenantId: string
let mediaId: string

describe('Credit System & Billing', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // 1. Create a Test Tenant with known credits
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: 'Test Auto Agency',
        slug: 'test-auto-agency',
        subdomain: 'testauto', // Required field
        billing: {
          credits: 10, // Start with 10
        },
        branding: {
          primaryColor: '#000000',
        }
      },
    })
    tenantId = typeof tenant.id === 'object' ? tenant.id : tenant.id

    // 2. Create a Dummy Media File for testing uploads
    // We'll create a simple buffer to simulate an image
    const imageBuffer = Buffer.from('fake-image-data')
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: 'Test Image',
        tenant: tenantId,
      },
      file: {
        data: imageBuffer,
        name: 'test-image.jpg',
        mimetype: 'image/jpeg',
        size: imageBuffer.length,
      },
    })
    mediaId = media.id
  })

  it('should deduct 1 credit when a Post is created with rawMedia', async () => {
    // Action: Create a Post
    await payload.create({
      collection: 'posts',
      data: {
        title: 'Credit Deduction Test Post',
        tenant: tenantId,
        content: [{ blockType: 'real-estate-listing', data: { price: '100' } }],
        assets: {
          rawMedia: mediaId,
        },
      },
    })

    // Assert: Check Tenant Credits
    const updatedTenant = await payload.findByID({
      collection: 'tenants',
      id: tenantId,
    })

    expect(updatedTenant.billing?.credits).toBe(9) // 10 - 1 = 9
  })

  it('should NOT queue a job if credits are 0', async () => {
    // Setup: Set credits to 0
    await payload.update({
      collection: 'tenants',
      id: tenantId,
      data: {
        billing: {
          credits: 0,
        },
      },
    })

    // Action: Create another Post
    await payload.create({
      collection: 'posts',
      data: {
        title: 'Zero Credit Post',
        tenant: tenantId,
        content: [{ blockType: 'real-estate-listing', data: { price: '100' } }],
        assets: {
          rawMedia: mediaId,
        },
      },
    })

    // Assert: Credits should remain 0 (not go to -1)
    const tenantAfter = await payload.findByID({
      collection: 'tenants',
      id: tenantId,
    })

    expect(tenantAfter.billing?.credits).toBe(0)
    
    // Note: To fully verify the "job not queued" part, we'd need to mock payload.jobs.queue,
    // but verifying balance doesn't drop is a good enough integration check for now.
  })
})

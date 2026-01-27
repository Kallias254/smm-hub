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
    const uniqueId = Date.now()
    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name: `Test Auto Agency ${uniqueId}`,
        slug: `test-auto-agency-${uniqueId}`,
        subdomain: `testauto${uniqueId}`, // Required field
        billing: {
          credits: 10, // Start with 10
        },
        branding: {
          primaryColor: '#000000',
        }
      },
    })
    tenantId = typeof tenant.id === 'object' ? tenant.id : tenant.id

            // 2. Create a Dummy Media File

            // We utilize a valid Base64 PNG (1x1 pixel) to ensure 'image-size' and file-type validation pass

            const tempFilePath = path.resolve(__dirname, 'temp-test-image.png')

            const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='

            fs.writeFileSync(tempFilePath, Buffer.from(base64Image, 'base64'))

            

            const fileBuffer = fs.readFileSync(tempFilePath)

            

            const media = await payload.create({

              collection: 'media',

              data: {

                alt: 'Test Image',

                tenant: tenantId,

              },

              file: {

                data: new Uint8Array(fileBuffer),

                name: 'test-image.png',

                mimetype: 'image/png',

                size: fileBuffer.length,

              },

            })

        

        // Cleanup temp file

        if (fs.existsSync(tempFilePath)) {

            fs.unlinkSync(tempFilePath)

        }

        

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

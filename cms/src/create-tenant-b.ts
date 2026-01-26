import { getPayload } from 'payload'
import config from './payload.config'
import crypto from 'crypto'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load env vars from cms/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function createTenantB() {
  console.log('\n🚀 Creating Tenant B (Test Agency B)...\n')
  
  try {
    const payload = await getPayload({ config })

    const name = 'Test Agency B'
    const slug = 'test-agency-b'
    const postizKey = '85b990ae4198911310f6bb62e454eb3953feb3837bc158f2ac2000c011967097' // The key we just inserted
    const ingestionKey = crypto.randomBytes(16).toString('hex')

    // Check if exists first
    const existing = await payload.find({
        collection: 'tenants',
        where: {
            slug: { equals: slug }
        }
    })

    if (existing.docs.length > 0) {
        console.log('Tenant "test-agency-b" already exists.')
        process.exit(0)
    }

    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name,
        slug,
        branding: {
          primaryColor: '#0000ff', // Blue for B
        },
        billing: {
            plan: 'starter',
            credits: 20,
            subscriptionStatus: 'active'
        },
        integrations: {
            postizApiKey: postizKey,
            ingestionKey: ingestionKey
        }
      },
    })

    console.log('\n✅ Tenant B Created Successfully!')
    console.log('------------------------------------------------')
    console.log(`Agency:         ${tenant.name}`)
    console.log(`ID:             ${tenant.id}`)
    console.log(`Slug:           ${tenant.slug}`)
    console.log(`Postiz Key:     ${(tenant as any).integrations?.postizApiKey?.substring(0, 10)}...`)
    console.log('------------------------------------------------')

  } catch (error: any) {
    console.error('\n❌ Error creating tenant:', error.message)
    if (error.data) {
        console.error('Validation Errors:', JSON.stringify(error.data, null, 2))
    }
  } finally {
    process.exit(0)
  }
}

createTenantB()

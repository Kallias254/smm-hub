import { getPayload } from 'payload'
import config from './payload.config'
import crypto from 'crypto'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function createTenantAuto() {
  console.log('\n🚀 Automatically Creating Nebula Agency...\n')
  
  try {
    const payload = await getPayload({ config })

    const name = 'Nebula Agency'
    const slug = 'nebula-agency'
    const subdomain = 'nebula'
    const ingestionKey = crypto.randomBytes(16).toString('hex')

    // Find the admin user to use as owner
    const users = await payload.find({
        collection: 'users',
        where: { email: { equals: 'admin@example.com' } },
        limit: 1
    })
    const adminUser = users.docs[0]

    console.log('Creating Tenant (this will trigger the Postiz hook)...')

    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name,
        slug,
        subdomain,
        branding: {
          primaryColor: '#8E44AD', // Purple for Nebula
        },
        billing: {
            plan: 'pro',
            credits: 50,
            seatLimit: 10,
            subscriptionStatus: 'active'
        },
        integrations: {
            ingestionKey: ingestionKey
        }
      },
      user: adminUser, // Pass user to the local API
    })

    console.log('\n✅ Tenant Created!')
    
    // Fetch again to see if the hook updated the postizApiKey
    const updatedTenant = await payload.findByID ({
        collection: 'tenants',
        id: tenant.id
    })

    console.log('------------------------------------------------')
    console.log(`Agency:         ${updatedTenant.name}`)
    console.log(`Slug:           ${updatedTenant.slug}`)
    console.log(`Postiz API Key: ${updatedTenant.integrations?.postizApiKey || 'FAILED TO PROVISION'}`)
    console.log(`Ingestion Key:  ${updatedTenant.integrations?.ingestionKey}`)
    console.log('------------------------------------------------')
    
    if (updatedTenant.integrations?.postizApiKey) {
        console.log('\n✨ SUCCESS: The hook automatically provisioned the Postiz workspace.')
        console.log(`🔗 Hub Link:    http://${updatedTenant.subdomain}.smmhub.localhost/admin`)
        console.log(`🔗 Postiz Link: http://${updatedTenant.subdomain}.postiz.localhost`)
    }

  } catch (error: any) {
    console.error('\n❌ Error:', error.message)
  } finally {
    process.exit(0)
  }
}

createTenantAuto()

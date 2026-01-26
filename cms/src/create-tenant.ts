import { getPayload } from 'payload'
import config from './payload.config'
import readline from 'readline'
import crypto from 'crypto'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load env vars from cms/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim())
    })
  })
}

async function createTenant() {
  console.log('\n🚀 Interactively Create New Tenant\n')
  
  try {
    const payload = await getPayload({ config })

    // 1. Get Agency Name
    let name = await question('Enter Agency Name: ')
    while (!name) {
      console.log('Name is required.')
      name = await question('Enter Agency Name: ')
    }

    // 2. Get Slug
    const defaultSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    let slug = await question(`Enter Slug (default: ${defaultSlug}): `)
    if (!slug) slug = defaultSlug

    // 3. Generate Ingestion Key
    const ingestionKey = crypto.randomBytes(16).toString('hex')
    console.log(`\n🔑 Generated Ingestion Key: ${ingestionKey}`)

    console.log('\nCreating Tenant...')

    const tenant = await payload.create({
      collection: 'tenants',
      data: {
        name,
        slug,
        branding: {
          primaryColor: '#000000', // Default to black
        },
        billing: {
            plan: 'starter',
            credits: 20,
            subscriptionStatus: 'active'
        },
        integrations: {
            ingestionKey: ingestionKey
        }
      },
    })

    console.log('\n✅ Tenant Created Successfully!')
    console.log('------------------------------------------------')
    console.log(`Agency:         ${tenant.name}`)
    console.log(`ID:             ${tenant.id}`)
    console.log(`Slug:           ${tenant.slug}`)
    console.log(`Postiz Key:     (Provisioning in progress via hook...)`)
    console.log(`Ingestion Key:  ${(tenant as any).integrations?.ingestionKey}`)
    console.log('------------------------------------------------')
    console.log('\nYou can now see the connected socials in the Admin UI -> Integrations.')

  } catch (error: any) {
    console.error('\n❌ Error creating tenant:', error.message)
    if (error.data) {
        console.error('Validation Errors:', JSON.stringify(error.data, null, 2))
    }
  } finally {
    rl.close()
    process.exit(0)
  }
}

createTenant()

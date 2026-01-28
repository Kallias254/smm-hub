import { getPayload } from 'payload'
import config from './payload.config'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { Client } from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const POSTIZ_DB_URL = process.env.POSTIZ_DATABASE_URL || 'postgresql://postiz-user:postiz-password@localhost:5440/postiz-db-local'

async function verifyTenancy() {
  console.log('\n🕵️  Starting Tenancy Verification & Security Audit...\n')

  try {
    const payload = await getPayload({ config })

    // Helper to create an agency
    const createAgency = async (name: string, slug: string, subdomain: string, email: string) => {
        console.log(`\n--- Creating Agency: ${name} ---`)
        
        // 1. Create User
        let user = await payload.find({ collection: 'users', where: { email: { equals: email } } }).then(res => res.docs[0])
        if (!user) {
            console.log(`Creating Owner: ${email}`)
            user = await payload.create({
                collection: 'users',
                data: { email, password: 'password123', role: 'tenant_owner' } // Tenant assigned later
            })
        }

        // 2. Create Tenant
        // Check if exists first
        let tenant = await payload.find({ collection: 'tenants', where: { slug: { equals: slug } } }).then(res => res.docs[0])
        
        if (!tenant) {
            console.log(`Creating Tenant: ${name}`)
            tenant = await payload.create({
                collection: 'tenants',
                data: {
                    name,
                    slug,
                    subdomain,
                    branding: { primaryColor: '#000000' },
                    billing: { plan: 'pro', credits: 100, subscriptionStatus: 'active' },
                    integrations: { ingestionKey: 'test-key-' + slug }
                },
                user, // Context user
            })
        } else {
            console.log(`Tenant ${name} already exists. ID: ${tenant.id}`)
        }

        // 3. Update User with Tenant
        const currentTenantIds = (user as any).tenants ? (user as any).tenants.map((t: any) => typeof t === 'object' ? t.id : t) : []
        if (!currentTenantIds.includes(tenant.id)) {
            console.log(`Assigning User ${email} to Tenant ${name}`)
            user = await payload.update({
                collection: 'users',
                id: user.id,
                data: { tenants: [tenant.id] }
            })
        }

        // 4. Create Campaign
        const campaignSlug = `campaign-${slug}`
        let campaign = await payload.find({ 
            collection: 'campaigns', 
            where: { title: { equals: campaignSlug } },
            req: { user: user as any } // Use RLS context
        }).then(res => res.docs[0])

        if (!campaign) {
            console.log(`Creating Campaign: ${campaignSlug}`)
            campaign = await payload.create({
                collection: 'campaigns',
                data: {
                    title: campaignSlug,
                    tenant: tenant.id,
                    startDate: new Date().toISOString(),
                    budget: 1000
                },
                req: { user: user as any }
            })
        }

        // 5. Create Post
        const postTitle = `post-${slug}`
        let post = await payload.find({
            collection: 'posts',
            where: { title: { equals: postTitle } },
            req: { user: user as any }
        }).then(res => res.docs[0])

        if (!post) {
            console.log(`Creating Post: ${postTitle}`)
            post = await payload.create({
                collection: 'posts',
                data: {
                    title: postTitle,
                    tenant: tenant.id,
                    content: [{ blockType: 'sports-fixture', data: { homeTeam: 'A', awayTeam: 'B' } }], // Dummy block
                    channels: ['twitter'],
                    distributionStatus: 'pending'
                },
                req: { user: user as any }
            })
        }

        // Refetch tenant to get keys updated by hooks
        const freshTenant = await payload.findByID({ collection: 'tenants', id: tenant.id })

        return { user, tenant: freshTenant, campaign, post }
    }

    // --- EXECUTION ---

    const alpha = await createAgency('Gamma Agency', 'gamma-agency', 'gamma', 'owner@gamma.com')
    const beta = await createAgency('Delta Agency', 'delta-agency', 'delta', 'owner@delta.com')

    // --- VERIFICATION 1: POSTIZ KEY SYNC ---
    console.log('\n🔐 Verification 1: Postiz Key Synchronization')
    
    const client = new Client({ connectionString: POSTIZ_DB_URL })
    await client.connect()

    const checkKey = async (agency: any) => {
        const cmsKey = agency.tenant.integrations?.postizApiKey
        if (!cmsKey) {
            console.error(`❌ [${agency.tenant.name}] No Postiz API Key found in CMS! Hook might have failed.`) 
            return
        }

        const res = await client.query('SELECT "apiKey" FROM "Organization" WHERE "apiKey" = $1', [cmsKey])
        if (res.rows.length > 0) {
            console.log(`✅ [${agency.tenant.name}] Key MATCHES! CMS: ${cmsKey.substring(0, 10)}... exists in Postiz DB.`) 
        } else {
            console.error(`❌ [${agency.tenant.name}] Key MISMATCH! CMS Key ${cmsKey} NOT found in Postiz DB.`) 
        }

        // Check if User exists
        const userEmail = agency.user.email
        const userRes = await client.query('SELECT id FROM "User" WHERE email = $1', [userEmail])
        if (userRes.rows.length > 0) {
             console.log(`✅ [${agency.tenant.name}] User ${userEmail} EXISTS in Postiz DB.`)
        } else {
             console.error(`❌ [${agency.tenant.name}] User ${userEmail} MISSING in Postiz DB.`)
        }
    }

    await checkKey(alpha)
    await checkKey(beta)
    await client.end()

    // --- VERIFICATION 2: RLS ISOLATION ---
    console.log('\n🛡️  Verification 2: RLS Data Isolation')

    // Try to access Alpha's campaign using Beta's user
    const stolenCampaigns = await payload.find({
        collection: 'campaigns',
        where: { tenant: { equals: alpha.tenant.id } }, // Explicitly ask for Alpha's data
        req: { user: beta.user as any }, // As Beta user
        overrideAccess: false
    })

    if (stolenCampaigns.totalDocs === 0) {
        console.log(`✅ [Secure] Beta user CANNOT see Alpha's campaigns. (Docs found: 0)`) 
    } else {
        console.error(`❌ [INSECURE] Beta user SAW Alpha's campaigns! (Docs found: ${stolenCampaigns.totalDocs})`)
    }

    // Try to access Alpha's posts using Beta's user
    const stolenPosts = await payload.find({
        collection: 'posts',
        where: { tenant: { equals: alpha.tenant.id } },
        req: { user: beta.user as any },
        overrideAccess: false
    })

    if (stolenPosts.totalDocs === 0) {
        console.log(`✅ [Secure] Beta user CANNOT see Alpha's posts. (Docs found: 0)`) 
    } else {
        console.error(`❌ [INSECURE] Beta user SAW Alpha's posts! (Docs found: ${stolenPosts.totalDocs})`)
    }
    
    // Try to access Alpha's Payment using Beta's user (Simulating one)
    // First create a payment for Alpha (as Alpha owner)
    // Check if it already exists to avoid dupes
    let alphaPayment = await payload.find({ 
        collection: 'payments', 
        where: { tenant: { equals: alpha.tenant.id } } 
    }).then(res => res.docs[0])

    if (!alphaPayment) {
        alphaPayment = await payload.create({
            collection: 'payments',
            data: {
                tenant: alpha.tenant.id,
                amount: 500,
                phoneNumber: '254712345678',
                checkoutRequestId: 'req_' + Math.random(),
                status: 'pending'
            },
            req: { user: alpha.user as any }
        })
    }
    
    // Now try to read it as Beta
    const stolenPaymentsList = await payload.find({
        collection: 'payments',
        where: { id: { equals: alphaPayment.id } },
        req: { user: beta.user as any },
        overrideAccess: false
    })

    if (stolenPaymentsList.totalDocs === 0) {
         console.log(`✅ [Secure] Beta user CANNOT see Alpha's payments.`) 
    } else {
         console.error(`❌ [INSECURE] Beta user SAW Alpha's payments!`) 
    }

    console.log('\n------------------------------------------------')
    console.log('Verification Complete.')
    console.log('------------------------------------------------')

  } catch (error: any) {
    console.error('\n❌ Fatal Error:', error)
  } finally {
    process.exit(0)
  }
}

verifyTenancy()
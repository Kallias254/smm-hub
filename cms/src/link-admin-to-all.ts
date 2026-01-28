import { getPayload } from 'payload'
import config from './payload.config'
import { postiz } from './distribution/postiz'

async function linkAdmin() {
  const payload = await getPayload({ config })
  const tenants = await payload.find({ collection: 'tenants' })
  
  console.log(`Linking admin@example.com to ${tenants.docs.length} tenants...`)

  for (const tenant of tenants.docs) {
    const apiKey = (tenant as any).integrations?.postizApiKey
    if (apiKey) {
      await postiz.syncMembership('admin@example.com', apiKey, 'link')
    }
  }

  console.log('✅ Admin is now a member of all existing Postiz workspaces.')
  process.exit(0)
}

linkAdmin()

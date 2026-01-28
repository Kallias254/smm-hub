import { getPayload } from 'payload'
import config from './payload.config'
import { postiz } from './distribution/postiz'

async function syncAll() {
  const payload = await getPayload({ config })
  const users = await payload.find({ collection: 'users' })
  
  console.log(`Starting Global Membership Sync for ${users.docs.length} users...`)

  for (const user of users.docs) {
    const tenants = (user as any).tenants || []
    console.log(`User: ${user.email} (${tenants.length} tenants)`)

    for (const tenant of tenants) {
      const apiKey = (tenant as any).integrations?.postizApiKey
      if (apiKey) {
        await postiz.syncMembership(user.email, apiKey, 'link')
      }
    }
  }

  console.log('Global Sync Complete.')
  process.exit(0)
}

syncAll()
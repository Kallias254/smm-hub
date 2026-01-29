import { getPayload } from 'payload'
import config from './payload.config'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function publishPosts() {
  const payload = await getPayload({ config })
  
  // Find Gamma Agency
  const tenants = await payload.find({
      collection: 'tenants',
      where: { slug: { equals: 'gamma-agency' } }
  })
  
  if (tenants.totalDocs === 0) {
      console.log('Gamma Agency not found')
      return
  }
  
  const gamma = tenants.docs[0]
  
  // Update all posts for Gamma to published
  const result = await payload.update({
      collection: 'posts',
      where: { tenant: { equals: gamma.id } },
      data: { distributionStatus: 'published' }
  })
  
  console.log(`Updated ${result.docs.length} posts to Published for Gamma Agency.`)
  process.exit(0)
}

publishPosts()

import { getPayload } from 'payload'
import config from './payload.config'

async function checkPosts() {
  const p = await getPayload({ config })
  const posts = await p.find({ collection: 'posts' })
  console.log('Posts:', JSON.stringify(posts.docs.map(p => ({ title: p.title, status: p.distributionStatus })), null, 2))
  process.exit(0)
}

checkPosts()

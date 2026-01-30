import { getPayload } from 'payload'
import config from './payload.config'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function debugPost() {
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'posts',
    limit: 1,
    depth: 2
  })

  console.log('--- POST DATA ---')
  console.log(JSON.stringify(posts.docs[0], null, 2))
  process.exit(0)
}

debugPost()

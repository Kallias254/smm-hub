import { getPayload } from 'payload'
import config from './payload.config'

async function create() {
  const p = await getPayload({ config })
  await p.create({ collection: 'users', data: { email: 'admin@example.com', password: 'password123', role: 'admin' } })
  console.log('Global Admin Created')
  process.exit(0)
}

create()

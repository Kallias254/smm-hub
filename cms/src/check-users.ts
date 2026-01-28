import { getPayload } from 'payload'
import config from './payload.config'

async function check() {
  const p = await getPayload({ config })
  const users = await p.find({ collection: 'users' })
  console.log('CMS Users:', JSON.stringify(users.docs.map(u => ({ email: u.email, role: u.role, tenants: u.tenants })), null, 2))
  process.exit(0)
}

check()

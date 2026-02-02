import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import dotenv from 'dotenv'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

dotenv.config({ path: path.resolve(dirname, '../.env') })

import { Users } from './collections/Users.ts'
import { Media } from './collections/Media.ts'
import { Tenants } from './collections/Tenants.ts'
import { Campaigns } from './collections/Campaigns.ts'
import { Posts } from './collections/Posts.ts'
import { Payments } from './collections/Payments.ts'
import { Leads } from './collections/Leads.ts'
import { Reviews } from './collections/Reviews.ts'
import { tasks } from './tasks/index.ts'
import { s3Storage } from '@payloadcms/storage-s3'

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeNavLinks: ['/components/TenantSwitcher'],
      afterNavLinks: ['/components/NavIntegrationsLink'],
      views: {
        integrations: {
          Component: '/components/IntegrationsView',
          path: '/integrations',
        },
      },
    },
  },
  collections: [Users, Media, Tenants, Campaigns, Posts, Payments, Leads, Reviews],
  jobs: {
    tasks,
    autoRun: [
      {
        cron: '* * * * *', // Run every minute
        queue: 'default',
      },
    ],
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
        region: process.env.S3_REGION || 'us-east-1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY || '',
          secretAccessKey: process.env.S3_SECRET_KEY || '',
        },
      },
    }),
  ],
})

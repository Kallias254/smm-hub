import { Client } from 'pg'
import crypto from 'crypto'

export interface PostizIntegration {
  id: string
  name: string
  identifier: string
  picture?: string
  profile?: string
  disabled?: boolean
}

export interface PostizPostOptions {
  content: string
  mediaUrls: string[]
  integrationIds: string[]
  scheduledAt?: string
}

export class PostizClient {
  private get config() {
    return {
      defaultApiKey: process.env.POSTIZ_API_KEY || '',
      apiUrl: process.env.POSTIZ_API_URL || 'http://localhost:5000/api',
      // We allow overriding the host via env var, but default to localhost:5440 for local dev outside docker
      databaseUrl: process.env.POSTIZ_DATABASE_URL || 'postgresql://postiz-user:postiz-password@localhost:5440/postiz-db-local'
    }
  }

  private async request<T>(endpoint: string, options: RequestInit & { apiKey?: string } = {}): Promise<T> {
    const { apiUrl, defaultApiKey } = this.config
    const apiKey = options.apiKey || defaultApiKey
    const url = `${apiUrl}${endpoint}`
    
    if (!apiKey) {
      throw new Error('POSTIZ_API_KEY is not provided and not configured in .env')
    }

    const finalHeaders = {
        'Authorization': `${apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
    }

    console.log(`[Postiz] Requesting: ${url}`)
    const response = await fetch(url, { ...options, headers: finalHeaders })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Postiz API Error [${response.status}] ${url}: ${errorText}`)
    }

    return response.json() as Promise<T>
  }

  async getIntegrations(apiKey?: string): Promise<PostizIntegration[]> {
    return this.request<PostizIntegration[]>('/public/v1/integrations', { apiKey })
  }

  /**
   * PROPER PROVISIONING LOGIC (100-Year Dev Way)
   * We insert directly into the Postiz database to create a real Organization
   * and link the creating user to it.
   */
  async createWorkspace(tenantName: string, tenantSlug: string, ownerEmail?: string): Promise<{ apiKey: string }> {
    console.log(`[Postiz] SQL Provisioning for: ${tenantName} (Owner: ${ownerEmail || 'None'})`)
    
    const client = new Client({
      connectionString: this.config.databaseUrl,
    })

    try {
      await client.connect()
      
      const orgId = crypto.randomUUID()
      const apiKey = crypto.randomBytes(32).toString('hex')
      const now = new Date()

      // 1. Insert Organization record
      await client.query(
        `INSERT INTO "Organization" (id, name, "apiKey", "createdAt", "updatedAt", "allowTrial", "isTrailing") 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orgId, tenantName, apiKey, now, now, false, false]
      )

      // 2. Link User to Organization (if ownerEmail provided)
      if (ownerEmail) {
        // Find the user in Postiz by email
        const userRes = await client.query('SELECT id FROM "User" WHERE email = $1', [ownerEmail])
        
        if (userRes.rows.length > 0) {
          const userId = userRes.rows[0].id
          const userOrgId = crypto.randomUUID()
          
          await client.query(
            `INSERT INTO "UserOrganization" (id, "userId", "organizationId", role, "createdAt", "updatedAt", disabled) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [userOrgId, userId, orgId, 'ADMIN', now, now, false]
          )
          console.log(`[Postiz] Linked user ${ownerEmail} to new Organization as ADMIN.`)
        } else {
          console.warn(`[Postiz] Owner user ${ownerEmail} not found in Postiz database. Skipping link.`)
        }
      }

      console.log(`[Postiz] Successfully provisioned Organization ${orgId}.`)
      
      return { apiKey }
    } catch (err: any) {
      console.error('[Postiz] SQL Provisioning Error:', err.message)
      throw new Error(`Failed to provision Postiz database: ${err.message}`)
    } finally {
      await client.end()
    }
  }

  async createPost(data: PostizPostOptions, apiKey?: string) {
    const postsPayload = data.integrationIds.map((integrationId) => ({
      integration: {
        id: integrationId,
      },
      value: [
        {
          content: data.content,
          image: data.mediaUrls.map((url) => ({ path: url })),
        },
      ],
      settings: {},
    }))

    const payload = {
      type: data.scheduledAt ? 'schedule' : 'now',
      date: data.scheduledAt || new Date().toISOString(),
      shortLink: false,
      posts: postsPayload,
    }

    return this.request('/public/v1/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
      apiKey,
    })
  }
}

export const postiz = new PostizClient()

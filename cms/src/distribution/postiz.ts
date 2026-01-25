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
    }
  }

  private async request<T>(endpoint: string, options: RequestInit & { apiKey?: string } = {}): Promise<T> {
    const { apiUrl, defaultApiKey } = this.config
    const apiKey = options.apiKey || defaultApiKey
    const url = `${apiUrl}${endpoint}`
    
    if (!apiKey) {
      throw new Error('POSTIZ_API_KEY is not provided and not configured in .env')
    }

    const headers = {
      'Authorization': `Bearer ${apiKey}`, // Ensure Bearer scheme if required, or just apiKey depending on Postiz auth
      'Content-Type': 'application/json',
      ...options.headers,
    }
    
    // Postiz usually expects just the key in Authorization header or Bearer + key. 
    // Based on previous code: 'Authorization': `${apiKey}`
    // I will revert to exactly what was there to be safe: `${apiKey}`
    // But usually it is Bearer. Let's stick to the previous implementation: `${apiKey}`
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

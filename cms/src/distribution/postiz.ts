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
      apiKey: process.env.POSTIZ_API_KEY || '',
      apiUrl: process.env.POSTIZ_API_URL || 'http://localhost:5000/api',
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const { apiUrl, apiKey } = this.config
    const url = `${apiUrl}${endpoint}`
    
    if (!apiKey) {
      throw new Error('POSTIZ_API_KEY is not configured in .env')
    }

    const headers = {
      'Authorization': `${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    console.log(`[Postiz] Requesting: ${url}`)
    const response = await fetch(url, { ...options, headers })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Postiz API Error [${response.status}] ${url}: ${errorText}`)
    }

    return response.json() as Promise<T>
  }

  async getIntegrations(): Promise<PostizIntegration[]> {
    return this.request<PostizIntegration[]>('/public/v1/integrations')
  }

  async createPost(data: PostizPostOptions) {
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
    })
  }
}

export const postiz = new PostizClient()

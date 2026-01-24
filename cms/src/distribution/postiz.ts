import { Payload } from 'payload'

interface PostizConfig {
  apiKey: string
  apiUrl: string
}

export interface PostizIntegration {
  id: string
  name: string
  identifier: string // e.g., 'facebook', 'twitter', 'linkedin'
  picture?: string
  profile?: string
  disabled?: boolean
}

export interface PostizPostOptions {
  content: string
  mediaUrls: string[]
  integrationIds: string[] // Specific Postiz Integration IDs
  scheduledAt?: string // ISO Date string
}

export class PostizClient {
  private config: PostizConfig

  constructor() {
    this.config = {
      apiKey: process.env.POSTIZ_API_KEY || '',
      apiUrl: process.env.POSTIZ_API_URL || 'https://api.postiz.com/api', // Default to public API if not local
    }

    if (!this.config.apiKey) {
      console.warn('⚠️ POSTIZ_API_KEY is missing. Distribution will fail.')
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.apiUrl}${endpoint}`
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const response = await fetch(url, { ...options, headers })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Postiz API Error [${response.status}] ${url}: ${errorText}`)
    }

    return response.json() as Promise<T>
  }

  /**
   * Fetches all available integrations from Postiz.
   * We need this to map internal channel names (e.g., 'facebook') to actual Integration IDs.
   */
  async getIntegrations(): Promise<PostizIntegration[]> {
    return this.request<PostizIntegration[]>('/public/v1/integrations')
  }

  /**
   * Creates a post in Postiz.
   * Matches the actual Postiz API structure.
   */
  async createPost(data: PostizPostOptions) {
    // Postiz expects 'posts' array, where each item targets a specific integration.
    // We replicate the content for each integration.
    
    const postsPayload = data.integrationIds.map((integrationId) => ({
      integration: {
        id: integrationId,
      },
      value: [
        {
          content: data.content,
          // Postiz expects media as an array of objects with 'path' (URL)
          image: data.mediaUrls.map((url) => ({ path: url })),
        },
      ],
      settings: {}, // Provider specific settings if needed
    }))

    const payload = {
      type: data.scheduledAt ? 'schedule' : 'now',
      date: data.scheduledAt || new Date().toISOString(),
      shortLink: false, // Default to false for now
      posts: postsPayload,
    }

    return this.request('/public/v1/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }
}

export const postiz = new PostizClient()
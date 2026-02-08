import { getGlobalPayload } from '../payload-client'
import { postiz } from '../../../distribution/postiz'
import type { Tenant, User } from '../../../payload-types'

export async function createPostizWorkspaceActivity(tenantId: string, userId?: string): Promise<void> {
  const payload = getGlobalPayload()
  
  const tenant = await payload.findByID({
    collection: 'tenants',
    id: tenantId,
  })

  if (tenant.integrations?.postizApiKey) return

  let ownerEmails: string[] = []
  if (userId) {
    const user = await payload.findByID({
      collection: 'users',
      id: userId,
    })
    if (user.email) ownerEmails = [user.email]
  }

  console.log(`[Activity] Provisioning Postiz for: ${tenant.name}`)
  const { apiKey } = await postiz.createWorkspace(tenant.name, tenant.subdomain, ownerEmails)

  await payload.update({
    collection: 'tenants',
    id: tenantId,
    data: {
      integrations: {
        ...tenant.integrations,
        postizApiKey: apiKey,
      }
    },
  })
}

export async function syncPostizMembershipsActivity(userId: string, addedTenantIds: string[], removedTenantIds: string[]): Promise<void> {
  const payload = getGlobalPayload()
  
  const user = await payload.findByID({
    collection: 'users',
    id: userId,
  })

  if (!user.email) return

  // 1. Process Additions
  for (const tenantId of addedTenantIds) {
    try {
      const tenant = await payload.findByID({
        collection: 'tenants',
        id: tenantId,
      })
      const apiKey = tenant.integrations?.postizApiKey
      if (apiKey) {
        await postiz.syncMembership(user.email, apiKey, 'link')
      }
    } catch (e) {
      console.error(`[Activity] Failed to link tenant ${tenantId}:`, e)
    }
  }

  // 2. Process Removals
  for (const tenantId of removedTenantIds) {
    try {
      const tenant = await payload.findByID({
        collection: 'tenants',
        id: tenantId,
      })
      const apiKey = tenant.integrations?.postizApiKey
      if (apiKey) {
        await postiz.syncMembership(user.email, apiKey, 'unlink')
      }
    } catch (e) {
      console.error(`[Activity] Failed to unlink tenant ${tenantId}:`, e)
    }
  }
}

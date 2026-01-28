import { CollectionAfterChangeHook } from 'payload'
import { postiz } from '../../../distribution/postiz.ts'

/**
 * SYNC POSTIZ MEMBERSHIPS HOOK
 * 
 * Whenever a user's 'tenants' list is updated in Payload CMS, 
 * this hook ensures the Postiz database is updated to match.
 */
export const syncPostizMemberships: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  // We only run on update or create where the email exists
  if (operation !== 'update' && operation !== 'create') return doc
  if (!doc.email) return doc

  const oldTenantIds = previousDoc?.tenants?.map((t: any) => typeof t === 'object' ? t.id : t) || []
  const newTenants = doc.tenants || []
  const newTenantIds = newTenants.map((t: any) => typeof t === 'object' ? t.id : t)

  // 1. Identify Changes
  const addedIds = newTenantIds.filter((id: any) => !oldTenantIds.includes(id))
  const removedIds = oldTenantIds.filter((id: any) => !newTenantIds.includes(id))

  if (addedIds.length === 0 && removedIds.length === 0) return doc

  console.log(`[MembershipHook] Syncing Postiz for ${doc.email}. Added: ${addedIds.length}, Removed: ${removedIds.length}`)

  // 2. Process Additions
  for (const tenant of newTenants) {
    const t = typeof tenant === 'object' ? tenant : null // In afterChange with depth, these might be objects
    if (!t || !addedIds.includes(t.id)) continue

    const apiKey = t.integrations?.postizApiKey
    if (apiKey) {
      await postiz.syncMembership(doc.email, apiKey, 'link')
    }
  }

  // 3. Process Removals
  for (const tenantId of removedIds) {
    try {
      const { payload } = req
      const tenantDoc = await payload.findByID({
        collection: 'tenants',
        id: tenantId,
      })

      const apiKey = tenantDoc.integrations?.postizApiKey
      if (apiKey) {
        await postiz.syncMembership(doc.email, apiKey, 'unlink')
      }
    } catch (e: any) {
      console.error(`[MembershipHook] Could not unlink tenant ${tenantId}:`, e.message)
    }
  }

  return doc
}

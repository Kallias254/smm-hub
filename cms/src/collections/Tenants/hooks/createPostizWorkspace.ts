import { CollectionAfterChangeHook } from 'payload'
import { postiz } from '../../../distribution/postiz'

/**
 * AUTOMATED ONBOARDING HOOK
 * 
 * When a new Tenant is created, we automatically provision a 
 * dedicated Postiz Workspace so the agency owner doesn't have to 
 * manually configure API keys.
 */
export const createPostizWorkspace: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  // Only run on creation
  if (operation !== 'create') return doc

  // Check if it already has a key (prevent double-provisioning)
  if (doc.integrations?.postizApiKey) return doc

  try {
    const { payload } = req
    
    console.log(`[TenantHook] Triggering Postiz Provisioning for: ${doc.name}`)

    // 1. Call the Postiz Provisioning Logic
    const { apiKey } = await postiz.createWorkspace(doc.name, doc.slug, req.user?.email)

    // 2. Update the Tenant with the new Key
    // We use the local API to update without triggering hooks again if possible,
    // though Payload handles recursion usually. 
    await payload.update({
      collection: 'tenants',
      id: doc.id,
      data: {
        integrations: {
          ...doc.integrations,
          postizApiKey: apiKey,
        }
      },
      // Pass the request to maintain transaction and user context
      req,
    })

    console.log(`[TenantHook] Successfully provisioned Postiz for ${doc.name}. Key stored.`)

  } catch (error: any) {
    console.error(`[TenantHook] Postiz Provisioning Failed for ${doc.name}:`, error.message)
    // In a "100yr dev" setup, we might queue a retry task here
  }

  return doc
}

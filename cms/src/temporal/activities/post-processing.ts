import { getPayload } from 'payload'
import config from '../../payload.config'
import type { Post } from '../../payload-types'
import { getTemporalClient } from '../client'

export interface ProcessPostArgs {
  doc: Post
  previousDoc: Post
}

export async function postProcessingActivity({ doc, previousDoc }: ProcessPostArgs): Promise<void> {
  const payload = await getPayload({ config })
  const tenantId = typeof doc.tenant === 'object' ? (doc.tenant as any).id : doc.tenant

  if (!tenantId) {
    console.error('[Activity] Tenant ID not found on post.')
    return
  }

  // --- Credit Logic ---
  const isNewMedia = doc.assets?.rawMedia && !doc.assets?.brandedMedia
  if (isNewMedia) {
    try {
      const tenant = await payload.findByID({
        collection: 'tenants',
        id: tenantId,
        overrideAccess: true,
      })

      if (!doc.assets?.rawMedia) {
        console.warn('[Activity] Raw media not found.')
        return
      }

      const rawMediaId = typeof doc.assets.rawMedia === 'object' ? (doc.assets.rawMedia as any).id : doc.assets.rawMedia
      const rawMedia = await payload.findByID({
        collection: 'media',
        id: rawMediaId,
        overrideAccess: true,
      })

      const isVideo = rawMedia.mimeType?.startsWith('video/')
      const baseCost = isVideo ? 5 : 1
      const multiplier = tenant.billing?.costMultiplier || 1
      const finalCost = baseCost * multiplier
      const credits = tenant.billing?.credits || 0

      if (credits < finalCost) {
        console.warn(`[Activity] Skipped generation: Insufficient Credits for tenant ${tenantId}.`)
        return // Stop processing if not enough credits
      }

      await payload.update({
        collection: 'tenants',
        id: tenantId,
        data: {
          billing: {
            ...tenant.billing,
            credits: credits - finalCost,
          },
        },
        overrideAccess: true,
      })
      console.log(`[Activity] Deducted ${finalCost} credits from tenant ${tenantId}.`)
    } catch (error) {
      console.error('[Activity] Error processing credits:', error)
      return // Stop if there's an error
    }
  }

  // --- Campaign Workflow Logic ---
  const isScheduleReady = doc.distributionStatus === 'queued' && previousDoc?.distributionStatus !== 'queued'
  if (isNewMedia || isScheduleReady) {
    const activeBlock = doc.content?.[0]
    let creativeData = {}
    if (activeBlock && (activeBlock as any).data) {
      creativeData = { template: activeBlock.blockType, ...(activeBlock as any).data as object }
    }

    try {
      const temporal = await getTemporalClient()
      const workflowId = `campaign-post-${doc.id}`

      if (isScheduleReady) {
        try {
          const handle = temporal.workflow.getHandle(workflowId)
          await handle.signal('approvePost')
          console.log(`[Activity] Sent 'approvePost' signal to ${workflowId}`)
        } catch (e) {
          console.warn(`[Activity] Failed to signal workflow:`, e)
        }
      } else {
        const handle = await temporal.workflow.start('CampaignWorkflow', {
          taskQueue: 'branding-queue',
          workflowId: workflowId,
          args: [{
            postId: doc.id,
            tenantId: String(tenantId),
            scheduledAt: doc.scheduledAt,
            requiresApproval: true,
            data: creativeData,
          }],
        })
        console.log(`[Activity] Started Campaign Workflow: ${handle.workflowId}`)
      }
    } catch (e) {
      console.error('[Activity] Workflow Error:', e)
    }
  }
}

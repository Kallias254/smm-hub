import { proxyActivities } from '@temporalio/workflow'
import type * as activities from '../activities/tenant-activities'

const { createPostizWorkspaceActivity, syncPostizMembershipsActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minutes',
  retry: {
    maximumAttempts: 3,
  }
})

export async function CreatePostizWorkspaceWorkflow(tenantId: string, userId?: string): Promise<void> {
  await createPostizWorkspaceActivity(tenantId, userId)
}

export async function SyncPostizMembershipsWorkflow(userId: string, addedTenantIds: string[], removedTenantIds: string[]): Promise<void> {
  await syncPostizMembershipsActivity(userId, addedTenantIds, removedTenantIds)
}

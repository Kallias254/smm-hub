import { proxyActivities } from '@temporalio/workflow'
import type * as activities from '../activities/post-processing'
import type { Post } from '../../payload-types'

const { postProcessingActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '2 minutes',
})

export interface PostProcessingWorkflowArgs {
  doc: Post
  previousDoc: Post
}

export async function PostProcessingWorkflow({ doc, previousDoc }: PostProcessingWorkflowArgs): Promise<void> {
  await postProcessingActivity({ doc, previousDoc })
}

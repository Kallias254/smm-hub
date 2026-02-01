import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities/media.ts';

const { generateBrandedImageActivity, updatePostMediaActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export async function BrandingWorkflow(input: {
  postId: string;
  mediaId: string;
  tenantId: string;
  data: Record<string, unknown>;
}): Promise<string> {
  // 1. Generate the image
  const { generatedMediaId } = await generateBrandedImageActivity({
    mediaId: input.mediaId,
    tenantId: input.tenantId,
    data: input.data,
  });

  // 2. Update the post
  await updatePostMediaActivity(input.postId, generatedMediaId);

  return generatedMediaId;
}
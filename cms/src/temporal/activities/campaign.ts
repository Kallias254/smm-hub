import { getGlobalPayload } from '../payload-client.ts';

export async function checkApprovalStatusActivity(postId: string): Promise<string> {
  const payload = getGlobalPayload();
  const post = await payload.findByID({
    collection: 'posts',
    id: postId,
  });
  return post.distributionStatus || 'pending';
}

export async function publishPostActivity(postId: string): Promise<string> {
  const payload = getGlobalPayload();
  
  // We re-use the existing Task logic by manually queuing it 
  // OR we can call the logic directly. 
  // Calling the queue is safer as it uses the existing Task infrastructure.
  
  await payload.jobs.queue({
    task: 'publishToPostiz',
    input: {
      postId: postId,
      channels: [], // The task will fetch channels from the post doc
    },
  });

  return 'published';
}

export async function generateCreativeActivity(input: {
  postId: string;
  tenantId: string;
  data: Record<string, unknown>;
}): Promise<void> {
  const payload = getGlobalPayload();
  
  // Fetch the post to get the raw media ID
  const post = await payload.findByID({
    collection: 'posts',
    id: input.postId,
  });

  if (!post.assets?.rawMedia) {
     return; // Nothing to generate
  }

  // Check if already generated to ensure idempotency
  if (post.assets.brandedMedia) {
    return;
  }

  const rawMediaId = typeof post.assets.rawMedia === 'object' ? post.assets.rawMedia.id : post.assets.rawMedia;
  const rawMedia = await payload.findByID({
    collection: 'media',
    id: rawMediaId,
  });

  const isVideo = rawMedia.mimeType?.startsWith('video/');
  const taskSlug = isVideo ? 'generateBrandedVideo' : 'generateBrandedImage';

  await payload.jobs.queue({
    task: taskSlug,
    input: {
      postId: input.postId,
      mediaId: rawMediaId,
      tenantId: input.tenantId,
      data: input.data,
    },
  });
}

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
  
  // 1. Fetch post to get requested channels
  const post = await payload.findByID({
    collection: 'posts',
    id: postId,
  });

  // 2. Trigger the real publishing task
  await payload.jobs.queue({
    task: 'publishToPostiz',
    input: {
      postId: postId,
      channels: (post.channels as string[]) || [], 
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

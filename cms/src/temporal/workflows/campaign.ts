import { proxyActivities, sleep, condition, defineSignal, setHandler } from '@temporalio/workflow';
import type * as activities from '../activities/campaign.ts';

const { 
  checkApprovalStatusActivity, 
  publishPostActivity, 
  generateCreativeActivity 
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

// Define Signals
export const approveSignal = defineSignal('approvePost');

export interface CampaignWorkflowInput {
  postId: string;
  tenantId: string;
  scheduledAt?: string; // ISO string
  requiresApproval: boolean;
  data: Record<string, unknown>; // Creative data
}

export async function CampaignWorkflow(input: CampaignWorkflowInput): Promise<string> {
  let isApproved = false;

  // Set up signal handler
  setHandler(approveSignal, () => {
    isApproved = true;
  });

  // 1. Generate Creative Assets
  await generateCreativeActivity({
    postId: input.postId,
    tenantId: input.tenantId,
    data: input.data,
  });

  // 2. Approval Loop (Human-in-the-Loop)
  if (input.requiresApproval) {
    // Check initial status (in case already approved before workflow reached here)
    const currentStatus = await checkApprovalStatusActivity(input.postId);
    if (currentStatus === 'queued' || currentStatus === 'published') {
      isApproved = true;
    }

    // Wait until signal arrives OR already approved
    await condition(() => isApproved, '30 days');
    
    if (!isApproved) {
       throw new Error('Approval timeout after 30 days.');
    }
  }

  // 3. Scheduling Wait (The "Cron Replacement")
  if (input.scheduledAt) {
    const scheduledTime = new Date(input.scheduledAt).getTime();
    const now = Date.now();
    const delay = scheduledTime - now;

    if (delay > 0) {
      await sleep(delay);
    }
  }

  // 4. Publish
  const result = await publishPostActivity(input.postId);
  
  return result;
}

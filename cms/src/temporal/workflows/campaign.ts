import { proxyActivities, sleep, condition } from '@temporalio/workflow';
import type * as activities from '../activities/campaign.ts';

const { 
  checkApprovalStatusActivity, 
  publishPostActivity, 
  generateCreativeActivity 
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export interface CampaignWorkflowInput {
  postId: string;
  tenantId: string;
  scheduledAt?: string; // ISO string
  requiresApproval: boolean;
  data: Record<string, unknown>; // Creative data
}

export async function CampaignWorkflow(input: CampaignWorkflowInput): Promise<string> {
  // 1. Generate Creative Assets (Idempotent: if exists, returns existing)
  // This replaces the immediate "Payload Job" trigger.
  await generateCreativeActivity({
    postId: input.postId,
    tenantId: input.tenantId,
    data: input.data,
  });

  // 2. Approval Loop (Human-in-the-Loop)
  if (input.requiresApproval) {
    // Wait until condition is true OR timeout after 7 days
    let isApproved = false;
    
    // We poll the DB via activity or wait for a signal. 
    // For MVP, let's use a signal 'approvePost' or poll.
    // Better pattern: Wait for Signal.
    // For now, let's just check the DB state periodically via condition if we don't have signals set up yet.
    // Actually, signals are cleaner. Let's assume we will send a signal.
    
    // However, to keep it simple and robust without refactoring the UI to send signals yet:
    // We will loop and sleep.
    while (!isApproved) {
      const status = await checkApprovalStatusActivity(input.postId);
      
      if (status === 'approved' || status === 'queued') {
        isApproved = true;
      } else if (status === 'rejected') {
        throw new Error('Post was rejected by user.');
      } else {
        // Sleep for 1 hour before checking again? 
        // Or wait for a Signal. Signals are much better.
        // Let's implement a Signal handler.
        // But for this step, let's just assume it's pre-approved or we wait for time.
        // If we want "True" approval workflow, we need to add a Signal.
        
        // Let's stick to the "Schedule" logic for now which is the primary request.
        // If 'distributionStatus' is 'pending', we wait.
        
        const approved = await condition(() => isApproved, '7 days');
        if (!approved) {
           // Double check via activity in case condition timed out
           const finalCheck = await checkApprovalStatusActivity(input.postId);
           if (finalCheck !== 'approved' && finalCheck !== 'queued') {
             throw new Error('Approval timeout.');
           }
        }
      }
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

import { Worker } from '@temporalio/worker';
import * as mediaActivities from './activities/media.ts';
import * as campaignActivities from './activities/campaign.ts';
import { getPayload } from 'payload';
import { setGlobalPayload } from './payload-client.ts';
import config from '../payload.config.ts';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const payload = await getPayload({ config });
  setGlobalPayload(payload);
  
  console.log('--- Temporal Worker Starting ---');
  console.log('Namespace: smm-hub-core');

  const activities = {
    ...mediaActivities,
    ...campaignActivities,
  };

  const worker = await Worker.create({
    workflowsPath: path.resolve(__dirname, './workflows'),
    activities,
    taskQueue: 'branding-queue', // We will use this shared queue for now
    namespace: 'smm-hub-core',
  });

  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
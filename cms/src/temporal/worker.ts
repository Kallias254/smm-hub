import { Worker, NativeConnection } from '@temporalio/worker';
import * as mediaActivities from './activities/media.ts';
import * as campaignActivities from './activities/campaign.ts';
import * as paymentActivities from './activities/payments.ts';
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
  
  const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  console.log('--- Temporal Worker Starting ---');
  console.log('Namespace: smm-hub-core');
  console.log('Address:', temporalAddress);

  const activities = {
    ...mediaActivities,
    ...campaignActivities,
    ...paymentActivities,
  };

  const connection = await NativeConnection.connect({
    address: temporalAddress,
  });

  const worker = await Worker.create({
    connection,
    workflowsPath: path.resolve(__dirname, './workflows/index.ts'),
    activities,
    taskQueue: 'branding-queue', 
    namespace: 'smm-hub-core',
  });

  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
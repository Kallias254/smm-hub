import { Worker } from '@temporalio/worker';
import * as activities from './activities/media.ts'; // Add extension for ESM
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

  const worker = await Worker.create({
    workflowsPath: path.resolve(__dirname, './workflows/branding.ts'),
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
import { TaskConfig } from 'payload'

// Helper to create a lazy-loaded task proxy
// This prevents the heavy dependencies (ffmpeg, satori) from being loaded 
// unless the task is actually executed on the server.
const lazyTask = (slug: string, importer: () => Promise<{ default: TaskConfig<any> }>): any => {
  return {
    slug,
    // The handler is what actually gets called by Payload
    handler: async (args: any) => {
      const { default: task } = await importer()
      return task.handler(args)
    }
  }
}

export const tasks = [
  lazyTask('generateBrandedImage', () => import('./generateBrandedImageTask')),
  lazyTask('generateBrandedVideo', () => import('./generateBrandedVideoTask')),
  lazyTask('publishToPostiz', () => import('./publishToPostizTask')),
  lazyTask('notifyMobileApp', () => import('./notifyMobileAppTask')),
  lazyTask('sendReviewRequest', () => import('./sendReviewRequestTask')),
]
import { generateBrandedImageTask } from './generateBrandedImageTask'
import { generateBrandedVideoTask } from './generateBrandedVideoTask'
import { publishToPostizTask } from './publishToPostizTask'
import { notifyMobileAppTask } from './notifyMobileAppTask'
import { sendReviewRequestTask } from './sendReviewRequestTask'

export const tasks = [
  generateBrandedImageTask, 
  generateBrandedVideoTask,
  publishToPostizTask,
  notifyMobileAppTask,
  sendReviewRequestTask
]

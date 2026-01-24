import { generateBrandedImageTask } from './generateBrandedImageTask'
import { generateBrandedVideoTask } from './generateBrandedVideoTask'
import { publishToPostizTask } from './publishToPostizTask'
import { notifyMobileAppTask } from './notifyMobileAppTask'

export const tasks = [
  generateBrandedImageTask, 
  generateBrandedVideoTask,
  publishToPostizTask,
  notifyMobileAppTask
]

import { CollectionBeforeChangeHook } from 'payload'

/**
 * CALCULATE CAMPAIGN RESOURCES
 * 
 * Instead of KES, we calculate the Credit Burn Rate.
 */
export const calculateCampaignResources: CollectionBeforeChangeHook = async ({
  data,
}) => {
  const frequency = data.automation?.frequency || 'manual'
  
  if (data.scheduleMode === 'fixed' && data.startDate && data.endDate) {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    let totalRuns = 0
    if (frequency === 'daily') totalRuns = diffDays
    if (frequency === 'weekly') totalRuns = diffDays / 7
    if (frequency === 'monthly') totalRuns = diffDays / 30

    const minCredits = Math.ceil(totalRuns) * 1 // All images
    const maxCredits = Math.ceil(totalRuns) * 5 // All videos

    if (!data.resources) data.resources = {}
    
    // Store the forecast as a string for easy reading in the UI
    data.resources.projectedUsage = `Estimated ${Math.ceil(totalRuns)} posts. Needs ${minCredits} to ${maxCredits} credits.`
    
    console.log(`[CampaignLogic] Forecast: ${data.resources.projectedUsage}`)
  } 
  
  else if (data.scheduleMode === 'evergreen') {
    const allocated = data.resources?.allocatedCredits || 0
    if (!data.resources) data.resources = {}
    
    // In evergreen, we tell them how many posts they can afford
    const minPosts = Math.floor(allocated / 5) // Worst case (all vids)
    const maxPosts = Math.floor(allocated / 1) // Best case (all images)
    
    data.resources.projectedUsage = `Evergreen Mode: Allocated credits can afford ${minPosts} to ${maxPosts} posts.`
  }

  return data
}
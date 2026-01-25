import { TaskConfig } from 'payload'
import * as admin from 'firebase-admin'
import path from 'path'
import fs from 'fs'

// Lazy initialization of Firebase Admin
let firebaseInitialized = false

function initFirebase() {
  if (firebaseInitialized) return true

  try {
    // 1. Try environment variable (Base64 encoded JSON)
    if (process.env.FIREBASE_CREDENTIALS) {
      const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_CREDENTIALS, 'base64').toString('utf-8'))
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
      firebaseInitialized = true
      console.log('✅ Firebase Admin initialized via Environment Variable')
      return true
    }

    // 2. Try local file (google-services.json or service-account.json)
    const localKeyPath = path.resolve(process.cwd(), 'service-account.json')
    if (fs.existsSync(localKeyPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(localKeyPath, 'utf8'))
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      })
      firebaseInitialized = true
      console.log('✅ Firebase Admin initialized via Local File')
      return true
    }

    console.warn('⚠️ Firebase Credentials not found. Notifications will be MOCKED.')
    return false

  } catch (err) {
    console.error('❌ Failed to initialize Firebase:', err)
    return false
  }
}

interface NotifyMobileAppInput {
  postId: string
  channels: string[]
  title: string
}

interface NotifyMobileAppOutput {
  success: boolean
  message?: string
  error?: string
}

export const notifyMobileAppTask: TaskConfig<{ input: NotifyMobileAppInput, output: NotifyMobileAppOutput }> = {
  slug: 'notifyMobileApp',
  handler: async ({ req, input }) => {
    // const { payload } = req 
    const { postId, channels, title } = input

    try {
      const isLive = initFirebase()
      const messageBody = `New post ready for: ${channels.join(', ')}`
      
      if (isLive) {
        // Fetch Agent Tokens (This is a stub - in real life you'd query the 'Users' collection)
        // const agents = await payload.find({ collection: 'users', where: { role: { equals: 'agent' } } })
        // const tokens = agents.docs.map(u => u.fcmToken).filter(Boolean)
        
        // For MVP, we assume a "Topic" subscription or a hardcoded token for testing if available
        const condition = "'smm_agents' in topics"

        await admin.messaging().send({
          condition: condition,
          notification: {
            title: title,
            body: messageBody,
          },
          data: {
            postId: postId,
            action: 'publish_manual',
            click_action: 'FLUTTER_NOTIFICATION_CLICK' 
          },
          android: {
            priority: 'high',
          }
        })
        
        return {
          output: {
            success: true,
            message: 'FCM Notification dispatched to topic: smm_agents',
          },
        }

      } else {
        // MOCK MODE
        console.log('📱 [MOCK] Sending Push Notification to Agent:')
        console.log(`   - Title: ${title}`)
        console.log(`   - Body: ${messageBody}`)
        console.log(`   - Data: { postId: ${postId} }`)
        console.log(`   - Action: Open App to Publish`)

        return {
          output: {
            success: true,
            message: 'Notification dispatched (Mock)',
          },
        }
      }

    } catch (error: any) {
      console.error('Mobile Notification Failed:', error)
      return {
        output: {
          success: false,
          error: error.message,
        },
      }
    }
  },
}
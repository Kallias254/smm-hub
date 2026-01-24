# Distribution & Queues: The Engine Room

## 1. The "Black Box" Executioner: Postiz

We treat Postiz as a dumb pipe. We do not manage users inside Postiz manually. We control it via API.

**Integration Strategy:**
*   Each `Tenant` in Payload has a corresponding "Integration" or "Profile" in Postiz (mapped by ID).
*   **Scheduling:** We do **not** rely solely on Postiz's scheduler. We utilize Payload's scheduler to push to Postiz "Just in Time" or schedule via Postiz API if robust enough.
    *   *Seasoned Dev Tip:* Scheduling via external APIs is risky if the API goes down. Better to keep the schedule logic in Payload (cron job) and fire "Post Now" requests to Postiz at the right time. *However*, for reliability, we can push a scheduled post to Postiz and check for success webhook.

## 2. The Payload Job Queue (The Heartbeat)

Payload v3 introduced native jobs. We will leverage this extensively.

**Queue 1: `media-processing`**
*   **Concurrency:** 2 (Video processing is heavy).
*   **Tasks:** Satori Image Gen, FFmpeg rendering.

**Queue 2: `distribution`**
*   **Concurrency:** 5.
*   **Tasks:**
    *   `post-to-socials`: Sends API payload to Postiz.
    *   `notify-mobile-app`: Sends FCM (Firebase Cloud Messaging) push to the Agent's phone.

## 3. The Manual-Assist Bridge (Flutter)

For channels that block automation (WhatsApp Personal/Status, TikTok Personal, Facebook Groups), we use "Human Automation".

**The Workflow:**
1.  **Payload:** "It is time to post to WhatsApp."
2.  **Payload:** Sends FCM Push to Agent's Phone -> "Time to post: 3 Bedroom Apartment".
3.  **Flutter App:**
    *   Receives notification.
    *   Downloads the *Generated Asset* (Video/Image) to local cache.
    *   Copies the *Caption* to clipboard.
    *   **Action:** Opens the native Android "Share Intent" targeted at WhatsApp.
4.  **Human:** Taps "My Status" -> Paste Caption -> Send.
5.  **Flutter App:** Asks "Did you post?" -> Human clicks "Yes".
6.  **Flutter App:** API call back to Payload -> Mark post as `published`.

## 4. Cloud Scheduler vs. Node-Cron

Since we are self-hosting or using a VPS:
*   **Use:** `node-cron` running inside the Payload server instance (or a separate worker service).
*   **Task:** Runs every minute. Queries `Posts` where `scheduledAt <= NOW()` and `status == 'pending'`.
*   **Action:** Dispatches to `distribution` queue.

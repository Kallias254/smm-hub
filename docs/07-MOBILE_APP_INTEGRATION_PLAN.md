# Mobile App Integration Plan: "The Agent's Pocket Office"

## 1. The Goal
To enable an Agency Owner (e.g., "John's Realty") to log in to the SMM Hub Android App and manage their specific business context securely.

## 2. The Challenge: "Mobile Has No Subdomains"
*   **Web World:** We rely on `gamma.smmhub.localhost` to tell the backend which database to load.
*   **Mobile World:** Apps talk to an IP address (e.g., `10.0.2.2` or `api.smmhub.com`). There is no subdomain.
*   **Problem:** If the App calls `/api/users/login`, the backend doesn't know if the user belongs to "Gamma", "Delta", or "Alpha".

## 3. The Solution: Header Injection
We will introduce a "Tenant Context" in the mobile login flow.

### A. The User Experience (UX)
1.  **Screen 1:** Login.
2.  **Field 1 (New):** **Agency ID** (e.g., `gamma`).
    *   *Note:* In production, this could be a "Find my Agency" search or a magic link, but for MVP, manual entry is fastest.
3.  **Field 2:** Email (`owner@gamma.com`).
4.  **Field 3:** Password (`password123`).

### B. The Technical Implementation
1.  **Header:** The App will inject `X-Tenant-Subdomain: gamma` into *every* API request.
2.  **Middleware:** Our existing Backend Middleware already looks for this header! It will seamlessly switch the database context to Gamma's data.

---

## 4. Implementation Steps

### Step 1: Update `AuthService` (The Logic)
*   **Action:** Modify `login()` to accept `agencySlug`.
*   **Action:** Inject `{'X-Tenant-Subdomain': agencySlug}` into the HTTP headers.
*   **Action:** Persist the `agencySlug` in secure storage so we don't ask for it again on every restart.

### Step 2: Update `LoginScreen` (The UI)
*   **Action:** Add a `TextField` for "Agency ID" above the Email field.
*   **Action:** Pass this value to the `AuthService`.

### Step 3: Update `Config` (The Environment)
*   **Action:** Ensure `apiBaseUrl` points to `http://10.0.2.2:3000/api` (Android Emulator Localhost) or the correct LAN IP.

---

## 5. Future Roadmap (Post-Integration)

Once this connection is live, we unlock:
1.  **Dynamic Branding:** App reads `tenant.branding.primaryColor` and recolors the UI to match "John's Realty".
2.  **Push Notifications:** "Your flyer is ready" (via Firebase).
3.  **M-Pesa:** "Top Up Credits" button triggers the STK Push to the phone number on file.

---

## 6. The Smart Camera Interface

Beyond simple data management, the mobile app's primary role for a field agent is as a "smart camera" for content capture. This interface is designed to get structured, high-quality media into the system with minimal effort.

### 6.1. Capture Modes

The camera interface will support multiple capture modes, accessible via a simple selector:

1.  **Standard Photo/Video:** For quick, ad-hoc shots. Uses the native device camera.
2.  **Guided Panorama:** A built-in panoramic stitching mode. The UI will guide the user to pan slowly, providing feedback to ensure a smooth, high-resolution result.
3.  **360 Tour (Via Hardware):** The app will interface with common 360-degree cameras (e.g., Ricoh Theta, Insta360) to initiate captures and import the resulting equirectangular images.

### 6.2. The "Capture-Then-Tag" Workflow

To make data entry feel like part of the creative process, we will implement a "capture-then-tag" workflow directly within the camera UI.

**User Flow:**

1.  **Capture:** The agent takes a photo or video of a room (e.g., the kitchen).
2.  **Immediate Tagging Prompt:** Before returning to the camera view, a simple, non-intrusive overlay appears with a question: "What did you just capture?"
3.  **Tag Selection:** A list of common tags for that niche is displayed (e.g., 'Kitchen', 'Bedroom', 'Garden', 'Exterior', 'Special Feature'). The user taps one or more tags.
4.  **Metadata Saved:** The app saves the media along with this metadata, which is now ready to be used by the **Headless Creative Engine**.

### 6.3. Content Strategy Guidance

The app will also provide a simple decision tree to help the agent choose the right tool for the job:

*   **"Have a 360 Camera?"** -> Use **360 Tour** mode for the most immersive experience.
*   **"No 360 camera, but have good light?"** -> Use **Guided Panorama** to create wide, impressive shots of key rooms.
*   **"Short on time or want to show action?"** -> Use **Standard Video** to create a quick, personal walkthrough.

This workflow transforms the agent from a simple "photographer" into a "data provider," feeding the automated creative engine with the structured content it needs to build powerful, feature-specific ads.

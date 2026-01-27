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

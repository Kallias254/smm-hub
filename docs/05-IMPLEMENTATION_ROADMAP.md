# Implementation Roadmap: The Build Plan

**Phase 1: The Core (Days 1-3) - ✅ COMPLETED**
*   Initialize Payload CMS v3 (Blank Starter).
*   Setup PostgreSQL database.
*   Define Core Collections: `Tenants`, `Users`, `Posts`, `Media`.
*   Implement Multi-tenancy access control hooks.

**Phase 2: The Creative Engine (Days 4-7) - ✅ COMPLETED**
*   Install `@vercel/satori` and `fluent-ffmpeg`.
*   Create the `media-processing` Job Queue.
*   Build the "Real Estate Template 01" in Satori.
*   Test flow: Upload Image -> Auto-generate Branded Version.
*   **Status:** Templates built, Tasks implemented, Build errors resolved.

**Phase 3: The Distribution Pipe (Days 8-10) - 🚧 IN PROGRESS**
*   Deploy Postiz (Docker).
*   Connect Payload to Postiz API.
*   Implement `distribution` Job Queue (Stubbed in `publishToPostizTask`).
*   Test automated posting to a dummy Facebook Page.

**Phase 4: The Mobile Bridge (Days 11-14) - 🚧 IN PROGRESS**
*   Scaffold Flutter App (Completed: `HomeScreen`, `TaskCards`).
*   Implement "Share Intent" logic (Completed via `share_plus` + `path_provider`).
*   Connect "Confirm Post" feedback loop (Completed: Status updates to `published` after share).
*   **FCM Status:** Currently **Mocked**. CMS logs notification events; Mobile app requires manual refresh or FCM credentials (`google-services.json`) for real push.
*   **Next:** Add Auth login screen to the mobile app.

**Phase 5: Monetization & Polish (Days 15+) - 🚧 IN PROGRESS**
*   Integrate Daraja API (STK Push) - (Completed: `Payments` collection + `daraja.ts` service with Mock fallback).
*   Build the "Dashboard" (Payload Custom Views for Analytics).
*   **Pannellum Integration:** Add the 360 viewer custom component to the Admin UI.

## Specific Answers to Architect's Questions

### 1. The Dashboard: Payload or Mantine?
**Stick to Payload.**
*   Payload v3 is built on Next.js App Router. You can create completely custom pages at `/admin/dashboard` or `/admin/analytics`.
*   You can import any React library (Recharts for graphs, Mantine for widgets) *inside* these custom views.
*   Building an external dashboard creates a "Dual Truth" problem and doubles your security surface area. Keep it monolithic for the Hub.

### 2. Pano API: Pannellum vs. Outsourced
**Use Pannellum (Local).**
*   **Cost:** Free.
*   **Speed:** Instant (no upload/processing lag).
*   **Complexity:** Low. It's just a React component wrapping a WebGL viewer.
*   **Outsourcing:** Only necessary if you need "Dollhouse" views (Matterport style) or automated stitching of bad photos. For standard 360 equirectangular images, local rendering is the seasoned choice.
---

## Phase 6: The Headless CMS (V2) - 🔵 PLANNED

This phase evolves the platform from a social media tool with a storefront to a full-fledged, niche-aware Headless CMS, with the Creative Engine at its core.

### Epic: Headless Creative Engine

This epic focuses on decoupling creative design from content injection, allowing for rapid expansion into new niches and more sophisticated ad creation.

*   **User Story 1 (Admin):** "As a system admin, I can register external creative templates (e.g., Lottie JSON, Remotion bundles) and map their dynamic placeholders to Payload fields."
*   **User Story 2 (Backend):** "As a developer, I will create a microservice using `ffmpeg` that receives a template ID and a `Post` ID, and renders a final video by stitching the data into the template."
*   **User Story 3 (Mobile):** "As a mobile user (agent), I can tag my photos and videos with feature names (e.g., 'kitchen', 'balcony') directly within the 'smart camera' interface after capturing them."
*   **User Story 4 (Frontend):** "As a content manager, I can select a registered creative template when creating a `Post`, see its required fields, and preview the final output."

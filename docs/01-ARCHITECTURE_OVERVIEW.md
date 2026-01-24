# SMM Command Center Hub: Architectural Overview

**Version:** 1.0 (Senior Architect Draft)
**Date:** January 23, 2026

## 1. The Core Philosophy: "The Headless Marketing Brain"

This system is not just a CMS; it is an autonomous marketing operating system. It centralizes three critical functions:
1.  **Creation:** Procedural generation of high-fidelity assets (Satori/FFmpeg).
2.  **Orchestration:** Approval flows, billing, and scheduling (Payload CMS).
3.  **Execution:** Automated distribution (Postiz) and assisted manual sharing (Flutter).

## 2. System Architecture

```mermaid
graph TD
    User[Client/User] -->|Uploads Raw Assets| Payload[Payload CMS v3 (The Brain)]
    
    subgraph "The Creative Engine"
        Payload -->|Job Queue| Satori[Satori (Image Gen)]
        Payload -->|Job Queue| FFmpeg[FFmpeg (Video Gen)]
    end
    
    subgraph "Distribution"
        Payload -->|API Hook| Postiz[Postiz (Docker Container)]
        Postiz -->|API| FB[Facebook/X/LinkedIn]
        
        Payload -->|Push Notification| Flutter[Flutter Mobile App]
        Flutter -->|Manual Share| WhatsApp[WhatsApp Status/Groups]
    end
    
    subgraph "Monetization"
        Payload -->|STK Push| MPESA[Safaricom Daraja API]
        MPESA -->|Callback| Payload
    end
    
    Satori -->|Processed Asset| Payload
    FFmpeg -->|Processed Asset| Payload
```

## 3. Technology Stack Selection

*   **Core Logic:** [Payload CMS v3](https://payloadcms.com) (Next.js native).
    *   *Why:* Best-in-class TypeScript support, native **Jobs Queue** (crucial for video processing), and extensible Admin UI.
*   **Database:** PostgreSQL.
    *   *Why:* Robustness for multi-tenant data isolation and complex relational queries.
*   **Creative Engine:** Satori (Vercel) + FFmpeg.
    *   *Why:* Satori allows using HTML/CSS to generate images (easier than Canvas). FFmpeg is the industry standard for programmatic video editing.
*   **Automated Posting:** Postiz (Self-Hosted).
    *   *Why:* No monthly fees, open-source, robust API for standard social networks.
*   **Manual Bridge:** Flutter (Android).
    *   *Why:* Access to native Android intents for sharing to WhatsApp, which has no public posting API.

## 4. Key Niche Adapters

### A. Real Estate (The Trust Engine)
*   **Input:** Panorama images, pricing, location.
*   **Output:** 360° Web Viewer links, "Just Listed" video cards.
*   **Lifecycle:** Auto-archive posts when status changes to "Occupied".

### B. Sports Prediction (The Win-Bragger)
*   **Input:** Screenshot of a bet slip.
*   **Output:** Neon-styled "Winner" graphic overlaying the slip.
*   **Goal:** Virality on WhatsApp Status.

### C. Retail/Furniture (The Showroom)
*   **Input:** Raw product photo.
*   **Output:** Background removed product placed in a luxury "virtual showroom" background.

## 5. Strategic Decisions (The "Seasoned Dev" Take)

### Panorama Strategy: Pannellum vs. CloudPano
**Verdict:** **Use Pannellum (Self-Hosted).**
*   *Reasoning:* CloudPano is excellent but adds recurring costs and API dependency. For a "Hub" that might handle thousands of listings, client-side rendering with `pannellum.js` or `react-360` is free and performant. We only store the equirectangular JPG in Payload. The viewer handles the rest.

### Dashboard Strategy: Payload vs. Mantine
**Verdict:** **Extend Payload.**
*   *Reasoning:* Payload v3's Admin UI is React-based and highly customizable. Building a separate Mantine dashboard duplicates auth logic, API layers, and state management.
*   *Solution:* Use Payload's [Custom Views](https://payloadcms.com/docs/admin/views) to build the specific "Client Portals" directly inside the CMS. You can import Mantine components *into* Payload custom views if you really need specific UI widgets.

# Temporal Workflow Engine: The Reliability Layer

## 1. Overview
Temporal is a distributed, stateful engine used to orchestrate complex workflows. In the SMM Hub ecosystem, it serves as the **invincible executor** for heavy-duty tasks like video rendering and image generation.

### Why not just Redis/BullMQ?
Unlike simple task queues (which are "fire and forget"), Temporal provides:
*   **State Persistence:** Every step of a workflow is recorded in a database. If the server crashes mid-process, it resumes exactly where it left off.
*   **Infinite Retries:** Handles transient failures (API timeouts, network drops) automatically with exponential backoff.
*   **Long-running Tasks:** Workflows can "sleep" for months (waiting for human approval or a scheduled date) without consuming CPU.

---

## 2. The "Black Box" Strategy (Namespaces)

We utilize a single Temporal infrastructure (shared with Postiz) but maintain strict isolation through **Namespaces**.

| Component | Namespace | Purpose |
| :--- | :--- | :--- |
| **Postiz** | `default` | Social media scheduling and distribution logic. |
| **SMM Hub** | `smm-hub-core` | Creative Engine (Video/Image) and Credit Billing logic. |

### Benefits of this approach:
1.  **Shared Resources:** No need to run multiple copies of the Temporal Server/DB.
2.  **Security:** Workers for SMM Hub cannot "see" or interfere with Postiz workflows.
3.  **Stability:** High-volume video rendering in SMM Hub will not clog the posting queue in Postiz.

---

## 3. Benefits for the Creative Engine

### A. Execution Guarantees
Video rendering (FFmpeg) is expensive and slow. Temporal ensures that if a render fails 90% of the way through due to a server restart, we don't necessarily have to start over if we've checkpointed the progress.

### B. "Human-in-the-Loop" Workflows
1.  **Step 1:** Generate Branded Video.
2.  **Step 2 (Wait):** Workflow enters a "Waiting" state for an External Signal (`agent_approval`).
3.  **Step 3:** Once approved, the workflow resumes and triggers the distribution to Postiz.

### C. Resource Rate Limiting
Temporal allows us to limit the number of concurrent FFmpeg processes across our entire cluster, preventing "Out of Memory" crashes during peak ingestion times.

---

## 4. Implementation Best Practices

### The Worker Pattern
Do **not** run Temporal workers inside the main Next.js/Payload HTTP process. Workers should be separate lightweight processes that:
1.  Connect to the Temporal Cluster (`temporal:7233`).
2.  Listen on the `smm-hub-core` namespace.
3.  Execute the heavy lifting (FFmpeg, Satori, S3 Uploads).

### Activities vs. Workflows
*   **Workflows:** Orchestrate the sequence (The "Blueprint"). Must be deterministic.
*   **Activities:** Perform the actual work (The "Tools"). This is where FFmpeg, Database writes, and API calls live.

---

## 5. Current Status (Feb 2026)
*   **Infrastructure:** Temporal Server is LIVE (Docker).
*   **Usage:** Currently used by Postiz.
*   **SMM Hub Integration:** Pending. Currently using **Payload Native Jobs** for MVP. Migration to Temporal is planned for the "Scale Phase".

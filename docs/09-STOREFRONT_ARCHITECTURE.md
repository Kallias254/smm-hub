# Storefront Architecture: The "Universal Shop"

## 1. The Core Concept

We are building a **Single Frontend Application** that serves infinite niches.
Instead of building a separate website for the Shoe Seller and the Cleaning Lady, we build a **Universal Adapter**.

*   **URL:** `https://smmhub.com/[tenant-slug]` (e.g., `smmhub.com/shoe-palace`)
*   **Technology:** Next.js (App Router) + Tailwind CSS.
*   **Logic:** The page detects the Tenant, fetches their Blocks, and renders the correct UI dynamically.

---

## 2. The Block Strategy (Data Layer)

We use **JSON Blocks** to store niche-specific data without polluting the database.

| Niche | Block Name | Key Data Fields |
| :--- | :--- | :--- |
| **Real Estate** | `RealEstateListing` | `price`, `location`, `beds`, `baths` |
| **Retail** | `RetailProduct` | `price`, `salePrice`, `sku`, `stockStatus` |
| **Service** | `ServicePackage` | `price`, `duration`, `inclusions`, `serviceCode` |

---

## 3. The Rendering Logic (Presentation Layer)

The Frontend Page (`page.tsx`) uses a **Factory Pattern** to choose the right component.

```tsx
// Simplified Logic
export default function UniversalCard({ post }) {
  const block = post.content[0];

  switch (block.blockType) {
    case 'retail-product':
      return <ProductCard data={block.data} title={post.title} />;
    
    case 'service-package':
      return <ServiceCard data={block.data} title={post.title} />;
      
    case 'real-estate-listing':
      return <PropertyCard data={block.data} title={post.title} />;
      
    default:
      return <GenericCard title={post.title} />;
  }
}
```

### Component Breakdown
1.  **ProductCard:** Focuses on the Image and "Buy Now" button.
2.  **ServiceCard:** Focuses on the "Duration" and "Book Slot" button.
3.  **PropertyCard:** Focuses on the "Location" and "Viewings".

---

## 4. Closing the Loop (WhatsApp Integration)

We use the `ServiceCode` or `SKU` to eliminate confusion.

**The Magic Link:**
`https://wa.me/{agent_number}?text={encoded_message}`

**Example Scenarios:**
*   **Shoe Store:** "Hi! I want to buy **Air Jordan 1 (Ref: SHOE-001)**."
*   **Cleaner:** "Hi! I want to book **Deep Clean (Ref: CLEAN-3BD)**."

**Result:** The business owner knows *exactly* what the customer wants instantly.

---

## 5. Implementation Roadmap

1.  **CMS:** Blocks created (Done).
2.  **API:** Public endpoint to fetch tenant posts (Next Step).
3.  **Frontend:** Next.js Page with the "Factory" component.
4.  **Distribution:** Instagram Link-in-Bio points to this Storefront.

import React from 'react'

/**
 * MODERN GENERIC CARD
 * This is the fallback for any niche we haven't built a specific UI for yet.
 * It uses high-end CSS (Glassmorphism, Gradients) to look expensive.
 */
export const GenericProductCard = ({ post }: { post: any }) => {
  const mediaUrl = post.assets?.brandedMedia?.url || post.assets?.rawMedia?.url
  
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-zinc-900 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl">
      {/* Media Container */}
      <div className="aspect-[4/5] w-full overflow-hidden">
        {mediaUrl ? (
          <img 
            src={mediaUrl} 
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-zinc-500">
            No Preview Available
          </div>
        )}
      </div>

      {/* Floating Info Overlay (Glassmorphism) */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md transition-colors group-hover:bg-black/60">
          <h3 className="text-lg font-bold text-white line-clamp-1">{post.title}</h3>
          
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-300">
              {post.campaign?.title || 'Featured'}
            </span>
            
            <a 
              href={`https://wa.me/?text=Hi, I am interested in ${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-black transition-transform active:scale-95 hover:bg-zinc-200"
            >
              Interested?
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { SplitLayoutBlock as SplitLayoutBlockType } from '@/payload-types'
import { blockComponents } from '.'

export const SplitLayout: React.FC<SplitLayoutBlockType> = ({ layout, image, content }) => {
  const imageUrl = image && typeof image === 'object' ? image.url : ''

  const contentBlocks = content.map((block, i) => {
    // @ts-ignore
    const BlockComponent = blockComponents[block.blockType]
    if (BlockComponent) {
      // @ts-ignore
      return <BlockComponent key={i} {...block} />
    }
    return null
  })

  const imageSide = (
    <div style={{ flex: 1, background: `url(${imageUrl}) center/cover` }} />
  )
  
  const contentSide = (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {contentBlocks}
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: layout === 'imageLeft' ? 'row' : 'row-reverse' }}>
      {imageSide}
      {contentSide}
    </div>
  )
}

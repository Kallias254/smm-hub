'use client'
import React from 'react'
import { Standard } from '@typebot.io/react'
import { ChatbotBlock as ChatbotBlockType } from '@/payload-types'

export const Chatbot: React.FC<ChatbotBlockType> = ({ typebotId }) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Standard
        typebot={typebotId}
        apiHost="https://viewer.typebot.localhost"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}

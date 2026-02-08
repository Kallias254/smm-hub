import React from 'react'
import { RichTextBlock as RichTextBlockType } from '@/payload-types'
import { Box } from '@mantine/core'

// Basic Serializer for Lexical Rich Text
const serialize = (nodes: any[]): React.ReactNode => {
    return nodes.map((node, i) => {
        if (node.type === 'text') {
            let text = <span key={i} dangerouslySetInnerHTML={{ __html: node.text }} />;
            // @ts-ignore
            if (node.bold) text = <strong key={i}>{text}</strong>;
            // @ts-ignore
            if (node.italic) text = <em key={i}>{text}</em>;
            // @ts-ignore
            if (node.underline) text = <u key={i}>{text}</u>;
            return text;
        }

        if (!node) {
            return null;
        }

        switch (node.type) {
            case 'h1': return <h1 key={i}>{serialize(node.children)}</h1>;
            case 'h2': return <h2 key={i}>{serialize(node.children)}</h2>;
            case 'h3': return <h3 key={i}>{serialize(node.children)}</h3>;
            case 'ul': return <ul key={i}>{serialize(node.children)}</ul>;
            case 'ol': return <ol key={i}>{serialize(node.children)}</ol>;
            case 'li': return <li key={i}>{serialize(node.children)}</li>;
            case 'link': return <a href={node.fields.url} key={i}>{serialize(node.children)}</a>;
            
            default: return <p key={i}>{serialize(node.children)}</p>;
        }
    });
}


export const RichText: React.FC<RichTextBlockType> = ({ content }) => {
  if (!content || !content.root || !content.root.children) {
    return null
  }
  return (
    <Box p="xl">
      {serialize(content.root.children)}
    </Box>
  )
}

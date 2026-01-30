'use client'

import React, { useState } from 'react'
import { SimpleGrid, Image, Modal, Box, ActionIcon } from '@mantine/core'
import { Carousel } from '@mantine/carousel'
import { IconX, IconChevronRight, IconChevronLeft, IconPhoto } from '@tabler/icons-react'

export const PropertyGallery = ({ images }: { images: string[] }) => {
  const [opened, setOpened] = useState(false)
  const [initialSlide, setInitialSlide] = useState(0)

  // Duplicate images to fill grid if needed for the "4 cols 2 rows" look (demo purpose)
  // In a real app, 'images' would be the actual list from the CMS
  const displayImages = images.length < 8 ? [...images, ...images, ...images, ...images].slice(0, 8) : images

  const openLightbox = (index: number) => {
    setInitialSlide(index)
    setOpened(true)
  }

  return (
    <>
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing="xs">
        {displayImages.map((src, index) => (
          <Box 
            key={index} 
            h={180} 
            className="hover-overlay-container"
            style={{ 
                cursor: 'pointer', 
                overflow: 'hidden', 
                borderRadius: 8,
                position: 'relative',
            }}
            onClick={() => openLightbox(index)}
          >
            <Image 
                src={src} 
                h="100%" 
                w="100%" 
                fit="cover" 
                className="hover-zoom"
            />
            <Box className="overlay-element" />
          </Box>
        ))}
      </SimpleGrid>

      <Modal 
        opened={opened} 
        onClose={() => setOpened(false)} 
        fullScreen 
        padding={0} 
        withCloseButton={false}
        styles={{ 
            body: { backgroundColor: 'black', height: '100vh', display: 'flex', flexDirection: 'column' } 
        }}
      >
        <Box pos="absolute" top={20} right={20} style={{ zIndex: 100 }}>
             <ActionIcon variant="subtle" color="gray" size="xl" onClick={() => setOpened(false)}>
                <IconX size={32} />
             </ActionIcon>
        </Box>

        <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Carousel 
                initialSlide={initialSlide} 
                loop 
                withIndicators
                height="100%"
                style={{ width: '100%' }}
                nextControlIcon={<IconChevronRight size={48} color="white" />}
                previousControlIcon={<IconChevronLeft size={48} color="white" />}
                styles={{
                    control: { backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }
                }}
            >
                {displayImages.map((src, index) => (
                    <Carousel.Slide key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Image src={src} fit="contain" h="90vh" w="auto" />
                    </Carousel.Slide>
                ))}
            </Carousel>
        </Box>
      </Modal>
    </>
  )
}

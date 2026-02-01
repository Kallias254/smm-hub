'use client'

import React from 'react'

import { Box, ScrollArea, Button, Paper, Text, Stack } from '@mantine/core'

import { IconMap2 } from '@tabler/icons-react'

import { RealEstateListRow } from '../../properties/RealEstateListRow'



export function MapSplitView({ posts, children }: { posts: any[]; children: React.ReactNode }) {



  // Use a generic Google Maps Embed API for the area (Nairobi) if no specific coordinates



  // In a real app, this would be a Google Map React component with markers



  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=&q=Nairobi,Kenya&zoom=12`







  return (



    <Box style={{ display: 'flex', height: 'calc(100vh - 80px)', overflow: 'hidden' }}>



        {/* LEFT PANEL: Map */}



        <Box style={{ flex: 1, position: 'relative', backgroundColor: '#e5e5e5' }}>



            <iframe



                width="100%"



                height="100%"



                frameBorder="0"



                style={{ border: 0, filter: 'grayscale(0.3) contrast(1.1)' }}



                src={mapUrl}



                allowFullScreen



            />



            {/* Mock "Search as I move" button often found on maps */}



            <Button 



                pos="absolute" 



                top={20} 



                left="50%" 



                style={{ transform: 'translateX(-50%)', zIndex: 10 }}



                variant="white" 



                radius="xl"



                boxShadow="md"



                color="dark"



                size="xs"



            >



                Search this area



            </Button>



        </Box>







        {/* RIGHT PANEL: List */}



        <Paper 



            shadow="md"



            radius={0}



            p="md"



            style={{ 



            width: '40%',



            minWidth: '500px',



            maxWidth: '600px', 



            height: '100%', 



            display: 'flex', 



            flexDirection: 'column',



            zIndex: 2,



            borderLeft: '1px solid var(--mantine-color-default-border)'



            }}



        >



            {children}



            <ScrollArea style={{ flex: 1 }} mt="md" type="scroll" offsetScrollbars>



                {posts.length > 0 ? (



                    <Stack gap="sm">



                        {posts.map(post => (



                            <RealEstateListRow key={post.id} post={post} />



                        ))}



                    </Stack>



                ) : (



                    <Box py={50} ta="center">



                        <Text c="dimmed">No properties found matching your criteria.</Text>



                    </Box>



                )}



            </ScrollArea>



        </Paper>



    </Box>



  )



}





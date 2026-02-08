'use client'
import React from 'react'
import { PreferenceFormBlock as PreferenceFormBlockType } from '@/payload-types'
import { useForm } from '@mantine/form'
import { Button, TextInput, Box } from '@mantine/core'

export const PreferenceForm: React.FC<PreferenceFormBlockType> = ({ form }) => {
  const formHook = useForm({
    initialValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  // This is a placeholder. In a real scenario, we'd fetch the form fields
  // from the 'form' prop and dynamically generate the form.
  
  return (
    <Box w="100%" maw={400} p="xl">
      <form onSubmit={formHook.onSubmit((values) => console.log(values))}>
        <TextInput
          label="Name"
          placeholder="Your Name"
          {...formHook.getInputProps('name')}
        />
        <TextInput
          mt="md"
          label="Email"
          placeholder="Your Email"
          {...formHook.getInputProps('email')}
        />
        <TextInput
          mt="md"
          label="Message"
          placeholder="What are you looking for?"
          {...formHook.getInputProps('message')}
        />
        <Button type="submit" mt="xl" fullWidth>
          Submit
        </Button>
      </form>
    </Box>
  )
}

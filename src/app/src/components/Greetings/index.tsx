
import { Container, Image, Text } from './styles'
import Chat from '../Chat/chat'
import Connect from '../Connect/connect'
import React from 'react'




export function Greetings() {
 
  return (
    <Container>
  
      <Text>P2P Chat Demo</Text>
      <Connect/>
      <Chat/>
    </Container>
  )
}
 

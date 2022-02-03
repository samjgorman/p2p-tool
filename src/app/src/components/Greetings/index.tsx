
import { Container, Image, Text } from './styles'
import Chat from '../ChatInput/input'
import Connect from '../Connect/connect'
import React from 'react'




export function Greetings() {
 
  return (
    <Container>
  
      <Text>Demo of a p2p chat application</Text>
      <Connect/>
      <Chat/>
    </Container>
  )
}
 

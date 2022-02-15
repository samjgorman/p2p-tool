
import { Container, Text,Sidebar,Main } from './styles'
import Chat from '../Chat/chat'
import Connect from '../Connect/connect'
import FriendsList from '../Friends/friendsList'
import Confirmation from '../Confirmation/confirmation'


import React from 'react'




export function MainContainer() {
 
  return (
    <Container>
      <Sidebar> 
      <Text>P2P Chat Demo</Text>
      <FriendsList/>
      </Sidebar>
      <Main> 
      <Connect/>
      <Chat/>
      <Confirmation/>
      </Main>

    </Container>
  )
}
 

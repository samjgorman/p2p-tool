import { Container, Text, Sidebar, SidebarContainer, Main } from "./styles";
import Chat from "../Chat/chat";
import Connect from "../Connect/connect";
import FriendsList from "../Friends/friendsList";
import Confirmation from "../Confirmation/confirmation";
import React from "react";

/**
 * Top level container that renders application react components
 */
export function MainContainer() {
  return (
    <Container>
      {/* <SidebarContainer> */}
      <Sidebar>
        <Text>P2P Chat Demo</Text>
        <FriendsList />
      </Sidebar>
      {/* </SidebarContainer> */}
      <Main>
        <Connect />
        <Chat />
        <Confirmation />
      </Main>
    </Container>
  );
}

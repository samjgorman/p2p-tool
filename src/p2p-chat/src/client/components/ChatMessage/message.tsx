import React from "react";
import {
  ChatMessageContainer,
  ChatMessageSender,
  ChatMessageContents,
  ChatMessageMessage,
  ChatMessageTime,
} from "./messageStyling";

/**
 * Functional component that renders a chat message
 * @param props
 * sender: string, sender of message
 * chatMessage: string, message contents
 * timestamp: string, UNIX timestring representing time message sent
 */
function ChatMessage(props) {
  const readableTimestamp = new Date(props.timestamp).toLocaleTimeString(
    "en-US"
  );

  return (
    <ChatMessageContainer>
      <ChatMessageSender>{props.sender}</ChatMessageSender>
      <ChatMessageContents>
        <ChatMessageMessage>{props.chatMessage} </ChatMessageMessage>
        <ChatMessageTime> {readableTimestamp}</ChatMessageTime>
      </ChatMessageContents>
    </ChatMessageContainer>
  );
}
export default ChatMessage;

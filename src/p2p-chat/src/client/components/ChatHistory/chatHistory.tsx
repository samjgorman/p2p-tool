import React from "react";
import ChatMessage from "../ChatMessage/message";
import { ChatHistoryWrapper, ChatHistoryContainer } from "./chatHistoryStyling";

/**
 * Stateful container that renders the chat log of a given friend.
 * This component rendered in response to an onClick in FriendsList.
 */
function ChatHistory(props) {
  const chatHistory = props.chatHistory;

  return (
    <ChatHistoryContainer>
      <ChatHistoryWrapper>
        {chatHistory.map((chatMessage, i) => (
          <ChatMessage
            key={i}
            chatMessage={chatMessage.message}
            timestamp={chatMessage.timestamp}
            sender={chatMessage.sender}
          />
        ))}
      </ChatHistoryWrapper>
    </ChatHistoryContainer>
  );
}

export default ChatHistory;

import React, { useEffect, useState } from "react";
import ChatMessage from "../ChatMessage/message";

/**
 * Stateful container that renders the chat log of a given friend.
 * This component rendered in response to an onClick in FriendsList.
 */
function ChatHistory(props) {
  const chatHistory = props.chatHistory;

  return (
    <div className="FriendsListContainer">
      {chatHistory.map((chatMessage, i) => (
        <ChatMessage
          key={i}
          chatMessage={chatMessage.message}
          timestamp={chatMessage.timestamp}
          sender={chatMessage.sender}
        />
      ))}
    </div>
  );
}

export default ChatHistory;

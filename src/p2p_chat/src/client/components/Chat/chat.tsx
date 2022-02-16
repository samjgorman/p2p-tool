import React, { useEffect, useState } from "react";
import ChatHistory from "../ChatHistory/chatHistory";
import ChatInput from "../ChatInput/chatInput";
import ChatMessage from "../ChatMessage/message";

/**
 * Stateful container that...
 * 1. Renders the ChatHistory, ChatInput, and ChatMessage components
 * 2. Listens for message objects the client has sent or received,
 *    and renders them
 */
function Chat() {
  const [stackPopulated, setStackPopulated] = useState(false);
  const [messagesToRenderStack, setMessagesToRenderStack] = useState([]);
  useEffect(() => {
    //Listen for messages the client has sent
    window.Main.on("i_submitted_message", (event, arg) => {
      console.log("Chat object received");
      console.log(event);
      const messageObjToRender = JSON.parse(event);
      const newState = [...messagesToRenderStack, messageObjToRender];
      setMessagesToRenderStack(newState);
      setStackPopulated(true);
    });
    //Listen for messages the client has received
    window.Main.on("peer_submitted_message", (event, arg) => {
      console.log("Chat object received from peer");
      console.log(event);
      const messageObjToRender = JSON.parse(event);
      const newState = [...messagesToRenderStack, messageObjToRender];
      setMessagesToRenderStack(newState);
      setStackPopulated(true);
    });

    return function cleanup() {
      window.Main.removeAllListeners("client_submitted_message");
      window.Main.removeAllListeners("peer_submitted_message");
    };
  });

  return (
    <div className="LiveChat">
      <ChatHistory />
      {stackPopulated &&
        messagesToRenderStack.map((chatMessage, i) => (
          <ChatMessage
            key={i}
            chatMessage={chatMessage.message}
            timestamp={chatMessage.timestamp}
            sender={chatMessage.sender}
          />
        ))}
      <ChatInput></ChatInput>
    </div>
  );
}

export default Chat;

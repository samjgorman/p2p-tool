import React, { useEffect, useState } from "react";
import { FriendData } from "../../../shared/@types/types";
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
  const [friendReceived, setFriendReceived] = useState(false);
  const [friendName, setFriendName] = useState("");

  const [friendChatObject, setFriendChatObject] = useState([]);
  const [friendChatObjectReceived, setFriendChatObjectReceived] =
    useState(false);

  useEffect(() => {
    //Listen for messages the client has sent
    window.Main.on("i_submitted_message", (event, arg) => {
      console.log("Chat object received");
      console.log(event);
      const messageObjToRender = JSON.parse(event);
      const newState = [...messagesToRenderStack, messageObjToRender];
      setMessagesToRenderStack(newState);
      setStackPopulated(true);
      //Attempt to send a signal
      window.Main.attemptToSendToPeer(event);
    });
    //Listen for messages the client has received
    window.Main.on("peer_submitted_message", (event: string, arg) => {
      console.log("Chat object received from peer");
      console.log(event);
      const messageObjToRender = JSON.parse(event);
      const newState = [...messagesToRenderStack, messageObjToRender];
      setMessagesToRenderStack(newState);
      setStackPopulated(true);
    });

    window.Main.on("friend_data_sent", (event: FriendData, arg) => {
      console.log("Friend data received by client ");
      console.log(event);
      setFriendReceived(true);
      setFriendName(event.friendName);
      setFriendChatObject(event.chatHistory);
      //Check if empty
      if (event.chatHistory && Object.entries(event.chatHistory).length !== 0) {
        setFriendChatObjectReceived(true);
      }
    });

    return function cleanup() {
      window.Main.removeAllListeners("i_submitted_message");
      window.Main.removeAllListeners("peer_submitted_message");
      window.Main.removeAllListeners("friend_data_sent");
    };
  });

  return (
    <div className="LiveChat">
      {friendChatObjectReceived && (
        <ChatHistory chatHistory={friendChatObject} />
      )}
      {stackPopulated &&
        messagesToRenderStack.map((chatMessage, i) => (
          <ChatMessage
            key={i}
            chatMessage={chatMessage.message}
            timestamp={chatMessage.timestamp}
            sender={chatMessage.sender}
          />
        ))}
      {friendReceived && <ChatInput recipient={friendName}></ChatInput>}
    </div>
  );
}

export default Chat;

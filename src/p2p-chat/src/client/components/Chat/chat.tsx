import React, { useLayoutEffect, useState } from "react";
import { FriendData } from "../../../shared/@types/types";
import ChatHistory from "../ChatHistory/chatHistory";
import ChatInput from "../ChatInput/chatInput";
/**
 * Stateful container that...
 * 1. Renders the ChatHistory, ChatInput, and ChatMessage components
 * 2. Listens for message objects the client has sent or received,
 *    and renders them
 */
function Chat() {
  const [friendReceived, setFriendReceived] = useState(false);
  const [friendName, setFriendName] = useState("");

  const [friendChatObject, setFriendChatObject] = useState([]);
  const [friendChatObjectReceived, setFriendChatObjectReceived] =
    useState(false);

  useLayoutEffect(() => {
    window.Main.on("update_chat_history", (event: string, arg) => {
      console.log("request to update registered");
      console.log(event);
      window.Main.getChatHistory(friendName);
    });

    window.Main.on("send_chat_history", (event: FriendData, arg) => {
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
      window.Main.removeAllListeners("send_chat_history");
      window.Main.removeAllListeners("update_chat_history");
    };
  });

  return (
    <div className="LiveChat">
      {friendChatObjectReceived && (
        <ChatHistory chatHistory={friendChatObject} />
      )}
      {friendReceived && <ChatInput recipient={friendName}></ChatInput>}
    </div>
  );
}

export default Chat;

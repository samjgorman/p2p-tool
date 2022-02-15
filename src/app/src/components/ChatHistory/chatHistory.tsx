import React, { useEffect, useState } from "react";
import ChatMessage from "../ChatMessage/message";

/**
 * Stateful container that renders the chat log of a given friend.
 * This component rendered in response to an onClick in FriendsList.
 */
function ChatHistory() {
  const [dataReceived, setDataReceived] = useState(false);
  const [chatObject, setChatObject] = useState([]);

  useEffect(() => {
    window.Main.on("friend_chat_object_sent", (event: Array<object>, arg) => {
      console.log("Friend chat array of objects received by client ");
      console.log(event);
      setDataReceived(true);
      setChatObject(event);
    });
  });

  return (
    <div className="FriendsListContainer">
      {dataReceived &&
        chatObject.map((chatMessage, i) => (
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

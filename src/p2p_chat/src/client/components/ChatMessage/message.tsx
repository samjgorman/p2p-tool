import React from "react";

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
    <div className="ChatMessage">
      <h4 className="ChatMessageSender">{props.sender}</h4>
      <div className="ChatMessageMessageTime">
        <p className="ChatMessageMessage">{props.chatMessage}</p>
        <p className="ChatMessageTime">{readableTimestamp}</p>
      </div>
    </div>
  );
}
export default ChatMessage;

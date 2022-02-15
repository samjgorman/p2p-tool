import React from "react";

/**
 *  Handler triggered with onSubmit in Chat to send peer metadata to Electron.
 * @param event Submitted form element
 */
async function handleMessage(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const raw_message = event.target as HTMLInputElement;
  const payload = raw_message[0].value;
  window.Main.sendMessageToPeer(payload);
}

/**
 * Functional component that allows a user to send a chat message
 * and triggers handleMessage to send to electron.
 */
function Chat() {
  return (
    <div className="LiveChatMessageForm">
      <form
        className="liveChat-message-form"
        noValidate
        autoComplete="off"
        onSubmit={(event) => handleMessage(event)}
      >
        <input className="chat-field" placeholder="Send a message..." />
        <input className="send-chat-button" type="submit" value="Send" />
      </form>
    </div>
  );
}

export default Chat;

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

async function handleOfflineMessage(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const raw_message = event.target as HTMLInputElement;
  const message = raw_message[0].value;
  const recipient = raw_message[1].value;
  const objToSend = { message: message, recipient: recipient };
  const payload = JSON.stringify(objToSend);
  window.Main.sendOfflineMessageToPeer(payload);
}

/**
 * Functional component that allows a user to send a chat message
 * and triggers handleMessage to send to electron.
 */
function Chat() {
  return (
    <React.Fragment>
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

      <div className="LiveChatOfflineMessageForm">
        <form
          className="liveChat-message-form"
          noValidate
          autoComplete="off"
          onSubmit={(event) => handleOfflineMessage(event)}
        >
          <input
            className="chat-field"
            placeholder="Send an offline message..."
          />
          <input className="chat-field" placeholder="Who are you messaging?" />
          <input className="send-chat-button" type="submit" value="Send" />
        </form>
      </div>
    </React.Fragment>
  );
}

export default Chat;

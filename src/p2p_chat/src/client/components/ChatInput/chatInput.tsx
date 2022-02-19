import React from "react";
import { MessageData } from "../../../shared/@types/types";

/**
 *  Handler triggered with onSubmit in Chat to send peer metadata to Electron.
 * @param event Submitted form element
 */
async function handleMessage(
  event: React.FormEvent<HTMLFormElement>,
  recipient: string
) {
  event.preventDefault();
  const raw_message = event.target as HTMLInputElement;
  const payload_object: MessageData = {
    recipient: recipient,
    message: raw_message[0].value,
  };

  const payload = JSON.stringify(payload_object);

  window.Main.sendMessageToPeer(payload);
  console.log("handler firing");
  console.log(payload);
}

/**
 * Functional component that allows a user to send a chat message
 * and triggers handleMessage to send to electron.
 */
function ChatInput(props) {
  return (
    <React.Fragment>
      <div className="LiveChatMessageForm">
        <form
          className="liveChat-message-form"
          noValidate
          autoComplete="off"
          onSubmit={(event) => handleMessage(event, props.recipient)}
        >
          <input className="chat-field" placeholder="Send a message..." />
          <input className="send-chat-button" type="submit" value="Send" />
        </form>
      </div>
    </React.Fragment>
  );
}

export default ChatInput;

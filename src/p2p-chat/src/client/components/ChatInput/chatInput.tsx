import React from "react";
import { MessageData } from "../../../shared/@types/types";
import {
  ChatInputContainer,
  ChatInputMessageInput,
  ChatInputSubmitButton,
  ChatInputForm
} from "./chatInputStyling";

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
}

/**
 * Functional component that allows a user to send a chat message
 * and triggers handleMessage to send to electron.
 */
function ChatInput(props) {
  return (
    <ChatInputContainer>
      <ChatInputForm
        className="liveChat-message-form"
        noValidate
        autoComplete="off"
        onSubmit={(event) => handleMessage(event, props.recipient)}
      >
        <ChatInputMessageInput placeholder="Send a message..." />
        <ChatInputSubmitButton type="submit" value="Send" />
      </ChatInputForm>
    </ChatInputContainer>
  );
}

export default ChatInput;

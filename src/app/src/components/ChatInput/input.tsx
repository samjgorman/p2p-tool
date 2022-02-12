import React from 'react';
import { ReactNode, ButtonHTMLAttributes } from 'react'


async function handleMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const raw_message = (event.target as HTMLInputElement);
    const payload = raw_message[0].value
    window.Main.sendMessageToPeer( payload);
}


/**
 * This component renders a single comment and should be used as a
 * child component to CommentLog.
 *  * @param props is an object that contains these properties
 * 
**/
function Chat() {

    return (
        <div className="LiveChatMessageForm">
            <div>Send a chat message</div>
          <form
            className="liveChat-message-form"
            noValidate
            autoComplete="off"
            onSubmit={(event) =>
                handleMessage(event)
            }
          >
            <input className="chat-field" placeholder="Send a message..." />
            <input className="send-chat-button" type="submit" value="Send" />
          </form>
        </div>
      );
    }



export default Chat;

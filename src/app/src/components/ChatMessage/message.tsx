
import React from "react";


/**
 * Converts a UNIX timestamp seconds into a "... time ago" format.
 *
 * @param seconds - UNIX timestamp seconds as s
 */
 function timeSince(seconds):string {
  const date = new Date(seconds)

  return date.toLocaleTimeString('en-US')
}



/**
 * This component renders a single message and should be used as a
 * child component to LiveChat.
 * @param props is an object that contains these properties
 *    LiveChatMessage - an object that contains these properties
 *      timestamp - a Date object representing when the message was sent
 *      text - a string containing the message's text
 *      time_posted - an object containing these properties
 *          seconds - time posted in UNIX timestamp seconds
 */

 function ChatMessage(props) { //refactor for TS 

    return (
      <div className="LiveChatMessage">
          
            <h4 className="message-owner">{props.sender}</h4>
            <div className="UserAndText">
              <p className="message-text">
                {props.chatMessage}
              </p>
              <p className="message-time">
                {/* {props.timestamp} */}

                {timeSince(props.timestamp)}
              </p>
            </div>

      </div>
    );
  }
  export default ChatMessage;
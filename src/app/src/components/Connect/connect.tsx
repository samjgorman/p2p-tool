
import React from "react";


async function handleConnectInfo(event:React.FormEvent<HTMLFormElement>){
    console.log(event.target[0].value)
    console.log(event.target[1].value)
    //  Send this information to the main thread to begin a webrtc connection
    const user = event.target[0].value
    const initiatorString = event.target[1].value
    const recipient = event.target[2].value

    var initiator = false
    if(initiatorString == "send") initiator = true;

    //  Construct an object to send
    const rawPeerMetadata = {
        initiator: initiator,
        user: user, 
        recipient: recipient
      }

    const peerMetadata = JSON.stringify(rawPeerMetadata)

    window.Main.passPeerMetadata(peerMetadata );


}

/**
 * This component renders a single comment and should be used as a
 * child component to CommentLog.
 *  * @param props is an object that contains these properties
 * 
**/

function Connect() {

    return (
        <div className="LiveChatMessageForm">
            <div>Begin a p2p connection</div>
          <form
            className="liveChat-message-form"
            autoComplete="off"
            onSubmit={(event) =>
                handleConnectInfo(event)
            }
          >
            <input className="username-field" placeholder="Choose a username" required/>
            <select name="role" id="role-select" required>
                <option value="">--Please choose an option--</option>
                <option value="send">Send an invite</option>
                <option value="accept">Accept an invite</option>
            </select>
            <input className="recipient-field" placeholder="Who are you connecting to?" required/>

            <input className="submit-connection-button" type="submit" value="Send" />
          </form>
        </div>
      );
    }

export default Connect
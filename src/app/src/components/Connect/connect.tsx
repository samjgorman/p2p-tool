
import React, {useState} from "react";


async function handleConnectInfo(event:React.FormEvent<HTMLFormElement>){
    console.log(event.target[0].value)
    console.log(event.target[1].value)
    //  Send this information to the main thread to begin a webrtc connection
    const user = event.target[0].value
    const initiatorString = event.target[1].value
    const recipient = event.target[2].value

    let initiator = false
    if(initiatorString ==="send") initiator = true;

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

  const [initiator, setInitiator] = useState(false);

  function handleChoice(val:string){
    if(val === "send"){
      setInitiator(true);
  
    }
    if(val === "accept"){
      setInitiator(false);
    }
  }
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
            <select name="role" id="role-select" onChange={(e) => handleChoice(e.target.value)} required>
                <option value="">--Please choose an option--</option>
                <option value="send" >Send an invite</option>
                <option value="accept" onSelect={() => setInitiator(false)}> Accept an invite</option>
            </select>

            {initiator == true &&
            <React.Fragment> 
            <input className="initiator-field" placeholder="Who are you inviting?" required/>
            </React.Fragment>

            }   

            {initiator == false &&
            <React.Fragment> 
            <input className="ninitiator-field" placeholder="Who are you accepting this invite from?" required/>
            <input className="token-field" placeholder="What's the invite token?" required/>
            </React.Fragment>
            }  


            <input className="submit-connection-button" type="submit" value="Send" />
          </form>

            {initiator && 
          <div>Send this payload:  </div>
            }

        </div>
      );
    }

export default Connect
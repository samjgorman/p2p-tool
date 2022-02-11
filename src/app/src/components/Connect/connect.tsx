
import React, {useState, useEffect} from "react";


async function handleConnectInfo(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault(); //test

    console.log(event.target[0].value)
    console.log(event.target[1].value)
    //  Send this information to the main thread to begin a webrtc connection
    const initiatorString = event.target[1].value

    let initiator = false
    const data = {
      name: event.target[0].value
    }
    if(initiatorString ==="send"){
      initiator = true;
      const recipient = event.target[2].value //Recipient
      data["recipient"] = recipient
      //Schema: 
    }else{
      const invitedBy = event.target[2].value
      const inviteToken = event.target[3].value
      data["invitedBy"] = invitedBy
      data["inviteToken"] = inviteToken
    }

    //  Construct an object to send
    const rawPeerMetadata = {
        initiator: initiator,
        data: data
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
  const [token, setToken] = useState("");


  function handleChoice(val:string){
    if(val === "send"){
      setInitiator(true);
      // window.Main.sendInviteToken("Requested token");
  
    }
    if(val === "accept"){
      setInitiator(false);
    }
  }

  useEffect(() => {
    // Listen for the event
    //Find way to listen for API
    window.Main.on("generate_invite_link", (event, message) => {
      console.log("Received invite link")
      setToken(event);
      console.log(event)
      //Finish this
    });
   
  }); 

    return (
        <div className="LiveChatMessageForm">
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

            {
          <div>Send this payload: {token} </div>
            }

        </div>
      );
    }

export default Connect
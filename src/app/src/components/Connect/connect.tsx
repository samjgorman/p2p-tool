import React, { useState, useEffect } from "react";

/**
 * Handler that packages and sends the user's submitted peerMetadata
 * to Electron for processing.
 *
 * @param event FormEvent from submitted form in Connect
 */
async function handleConnectInfo(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  let initiator = false;

  const initiatorString = event.target[1].value;
  const data = {
    name: event.target[0].value,
  };

  if (initiatorString === "send") {
    initiator = true;
    const recipient = event.target[2].value; //Recipient
    data["recipient"] = recipient;
  } else {
    const invitedBy = event.target[2].value;
    const inviteToken = event.target[3].value;
    data["invitedBy"] = invitedBy;
    data["inviteToken"] = inviteToken;
  }

  //  Construct an object to send
  const rawPeerMetadata = {
    initiator: initiator,
    data: data,
  };
  const peerMetadata = JSON.stringify(rawPeerMetadata);
  window.Main.sendPeerMetadata(peerMetadata);
}

/**
 *  Stateful container that renders a form for users to select
 *  whether they wish to initiate a connection or accept a new connection.
 *
 *  Conditionally renders form options based on what role a user chooses
 *  and calls handleConnectInfo upon submission.
 **/
function Connect() {
  const [initiator, setInitiator] = useState(false);
  const [invite, setInvite] = useState("");
  const [inviteLoaded, setInviteLoaded] = useState(false);

  function handleChoice(val: string) {
    if (val === "send") {
      setInitiator(true);
    } else if (val === "accept") {
      setInitiator(false);
    }
  }

  useEffect(() => {
    // Listen for the event
    window.Main.on("send_invite_link", (event, message) => {
      console.log("Received invite link");
      setInvite(event);
      console.log(event);
      setInviteLoaded(true);
    });
  });

  return (
    <div className="LiveChatMessageForm">
      <form
        className="liveChat-message-form"
        autoComplete="off"
        onSubmit={(event) => handleConnectInfo(event)}
      >
        <input
          className="username-field"
          placeholder="Choose a username"
          required
        />
        <select
          name="role"
          id="role-select"
          onChange={(e) => handleChoice(e.target.value)}
          required
        >
          <option value="">--Please choose an option--</option>
          <option value="send">Send an invite</option>
          <option value="accept" onSelect={() => setInitiator(false)}>
            Accept an invite
          </option>
        </select>

        {initiator == true && (
          <React.Fragment>
            <input
              className="initiator-field"
              placeholder="Who are you inviting?"
              required
            />
          </React.Fragment>
        )}

        {initiator == false && (
          <React.Fragment>
            <input
              className="initiator-field"
              placeholder="Who are you accepting this invite from?"
              required
            />
            <input
              className="token-field"
              placeholder="What's the invite token?"
              required
            />
          </React.Fragment>
        )}

        <input
          className="submit-connection-button"
          type="submit"
          value="Send"
        />
      </form>

      {inviteLoaded && <div>Send this invite link: {invite} </div>}
    </div>
  );
}

export default Connect;

import React, { useEffect, useState } from "react";

/**
 *
 * @param props
 * @returns
 */
function Confirmation(props) {
  const [invitedBy, setInvitedBy] = useState("");
  const [dataReceived, setDataReceived] = useState(false);
  const [ifConnectionConfirmed, setIfConnectionConfirmed] = useState(false);

  useEffect(() => {
    window.Main.on("confirm_connection", (event, arg) => {
      console.log("Confirmation name object received");
      console.log(event);
      setInvitedBy(event);
      setDataReceived(true);
    });
  });

  function handleConfirmation() {
    setIfConnectionConfirmed(true);
    //Confirm to connect with this invite string by passing a boolean back
    window.Main.ifConnectionConfirmed(true);
  }

  return (
    <div className="ConfirmationContainer">
      {dataReceived && (
        <React.Fragment>
          <div className="InvitedBy">
            {" "}
            {invitedBy} has invited you to chat on p2p-chat.{" "}
          </div>
          <div className="InviteInfo">
            {" "}
            If you decide to accept, a secure connection will be formed and you
            will be able to chat.{" "}
          </div>

          <button onClick={handleConfirmation}>Accept</button>
        </React.Fragment>
      )}
      {console.log("hey")}
    </div>
  );
}

export default Confirmation;

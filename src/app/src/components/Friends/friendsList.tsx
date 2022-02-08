
import React from "react";


/**
 * This component renders a list of a user's friends,
 * and displays whether they are online or not. 
 * @param props is an object that contains these properties
 *    LiveChatMessage - an object that contains these properties
 *      timestamp - a Date object representing when the message was sent
 *      text - a string containing the message's text
 *      time_posted - an object containing these properties
 *          seconds - time posted in UNIX timestamp seconds
 */

 function FriendsList(props) { //refactor for TS 

    //TODO: function that reads from the files/friends directory
    //And presents a list of friends 
    
    return (
      <div className="FriendsListContainer">
          
            <h4 className="message-owner">{props.sender}</h4>
            <div className="UserAndText">
              <p className="message-text">
                {props.chatMessage}
              </p>
              <p className="message-time">
                {props.timestamp}
                {/* {timeSince(props.liveChatMessage.time_sent.seconds)} */}
              </p>
            </div>

      </div>
    );
  }
  export default FriendsList;
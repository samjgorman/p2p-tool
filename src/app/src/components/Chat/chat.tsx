import React, { useEffect } from "react";
import ChatInput from "../ChatInput/input";
import ChatMessage from "../ChatMessage/message";


/**
 * This component renders a list of live chat messages to be displayed
 * on the web page for the current video.
 * @param props is an object that contains these properties
 *    videoId - id of the YouTube video for which we should get comments from
 *    player - a handle on the player for the video being played
 */
 function Chat(props) {
   
    //Read from merged file (for now, new.txt)
  
    useEffect(() => {
    //   let div = document.getElementsByClassName("LiveChat")[0];
    //   div.scrollTop = div.scrollHeight;

      //Listen for submitted messages
      window.Main.on("client_submitted_message", (event,arg) =>{
          console.log("Chat object received")
          console.log(event) 
      })

      window.Main.on("peer_submitted_message", (event,arg) =>{
        console.log("Chat object received from peer")
        console.log(event) 
    })

    });
  
    return (
      <div className="LiveChat">
          <ChatInput></ChatInput>
      </div>
    );
  }
  
  export default Chat;
  
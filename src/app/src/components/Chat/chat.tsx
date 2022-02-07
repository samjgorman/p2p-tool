import React, { useEffect, useState } from "react";
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

    const [stackPopulated, setStackPopulated] = useState(false);
    const [messagesToRenderStack, setMessagesToRenderStack] = useState([]);



  
    useEffect(() => {
    //   let div = document.getElementsByClassName("LiveChat")[0];
    //   div.scrollTop = div.scrollHeight;

      //Listen for submitted messages
      window.Main.on("client_submitted_message", (event,arg) =>{
          console.log("Chat object received")
          console.log(event) 
          const messageObjToRender = JSON.parse(event)
          const newState = [...messagesToRenderStack, messageObjToRender];
          setMessagesToRenderStack(newState)
          setStackPopulated(true)
      })

      window.Main.on("peer_submitted_message", (event,arg) =>{
        console.log("Chat object received from peer")
        console.log(event) 
        const messageObjToRender = JSON.parse(event)
        const newState = [...messagesToRenderStack, messageObjToRender];
        setMessagesToRenderStack(newState)
        setStackPopulated(true)


    })

    });

    console.log(messagesToRenderStack.length)
    console.log("one object");

    console.log(messagesToRenderStack[0]);
    //TODO: Add a type here...
  
    return (
      <div className="LiveChat">
          {stackPopulated &&
           messagesToRenderStack.map((chatMessage, i) => (
              <ChatMessage
                key={i}
                chatMessage={chatMessage.message}
                timestamp={chatMessage.timestamp}
                sender= {chatMessage.sender}
              />
            ))
          }

          <ChatInput></ChatInput>
      </div>
    );
  }
  
  export default Chat;
  
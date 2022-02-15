import React, { useEffect, useState } from "react";
import ChatHistory from "../ChatHistory/chatHistory";
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
   
    const [stackPopulated, setStackPopulated] = useState(false);
    const [messagesToRenderStack, setMessagesToRenderStack] = useState([]);
    useEffect(() => {
      //Listen for submitted messages
      window.Main.on("i_submitted_message", (event,arg) =>{
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

    return function cleanup() {
        window.Main.removeAllListeners("client_submitted_message")
        window.Main.removeAllListeners("peer_submitted_message")

        
       };

    });

    //TODO: Add a type here...
  
    return (
      <div className="LiveChat">

          <ChatHistory/> 
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
  
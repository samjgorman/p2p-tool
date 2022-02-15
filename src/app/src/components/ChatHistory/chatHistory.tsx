import React, { useEffect, useState } from "react";
import ChatMessage from "../ChatMessage/message";


function ChatHistory(props) { //refactor for TS 

    const [dataReceived, setDataReceived] = useState(false);
    const [chatObject, setChatObject] = useState([]);


    useEffect(() => {
        window.Main.on("friend_chat_object_sent", (event: Array<object>,arg) =>{
            console.log("Friend chat array of objects received by client ")
            console.log(event) 
            // const messageObjToRender = JSON.parse(event)
            setDataReceived(true)
            setChatObject(event)
  
        })
    })

    //TODO: strongly type this
    return(
        <div className="FriendsListContainer">

        
        {dataReceived && chatObject.map((chatMessage, i) => (
           <ChatMessage
            key={i}
            chatMessage={chatMessage.message}
            timestamp={chatMessage.timestamp}
            sender= {chatMessage.sender}
           />
         ))
        }
     

   </div>
    );

}

export default ChatHistory;

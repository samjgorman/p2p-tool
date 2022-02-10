// import React, { useEffect } from "react";
// import ChatMessage from "../ChatInput/chat";
// /**
//  * This component renders a list of live chat messages to be displayed
//  * on the web page for the current video.
//  * @param props is an object that contains these properties
//  *    videoId - id of the YouTube video for which we should get comments from
//  *    player - a handle on the player for the video being played
//  */
//  function LiveChat(props) {
//     //Read from merged file (for now, new.txt)
//     useEffect(() => {
//       let div = document.getElementsByClassName("LiveChat")[0];
//       div.scrollTop = div.scrollHeight;
//     });
//     return (
//       <div className="LiveChat">
//         {liveChat
//           ? liveChat.map((liveChatMessage, i) => (
//               <LiveChatMessage
//                 key={liveChatMessage.id}
//                 chatMessage={liveChatMessage}
//                 timestamp={props.timestamp}
//               />
//             ))
//           : []}
//       </div>
//     );
//   }
//   export default LiveChat;
//# sourceMappingURL=chat.js.map
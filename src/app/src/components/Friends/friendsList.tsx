
import React, { useEffect, useState } from "react";

type FriendMetadata = {
  publicKey: string;
  lastSeen: string;
};

function FriendObject(props){

  const lastSeenTimestamp:number = parseInt(props.lastSeen)
  const readableLastSeen = new Date(lastSeenTimestamp).toLocaleTimeString("en-US")
  //TODO: If empty, state that user is offline

    return (
      <div className="FriendobjectContainer"> 
        <div className="FriendObject">{props.name}</div>
        <div className="FriendObject">{props.lastSeen === "" ? "Offline" : readableLastSeen}</div> 
        </div>
    );
}

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
    const [friends, setFriends] = useState([]);
    const [time, setTime] = useState(Date.now());

    const [friendsPopulated, setFriendsPopulated] = useState(false);

    function convertRecordToArray(friends: Record<string, FriendMetadata>):Array<Array<string>>{
      //https://stackoverflow.com/questions/61350184/how-to-use-foreach-on-recordstring-object-in-typescript-and-angular
      const friendsArr:Array<Array<string>> = []
      for (const key in friends) {
          const friendObject = []
            // console.log(key)
              friendObject.push(key)
            for (const key2 in friends[key]) {
                // console.log(friends[key][key2]);
                  friendObject.push(friends[key][key2])  
           
            }
          
          friendsArr.push(friendObject)
        }

        return friendsArr

    }



    //TODO: function that reads from the files/friends directory
    //And presents a list of friends 
    useEffect( () =>{
        console.log("rendered ran")

        //Run this every 5 seconds
        //Listen to the route to get all friends for the given user
        window.Main.on("get_all_friends_of_user", (event,arg) =>{
            console.log("Friends object received")
            console.log(event) 
            const friendsRecord = event  //Typecheck this as a Record<string, FriendMetadata>

            const friendsArray = convertRecordToArray(friendsRecord)
            console.log(friendsArray) 
            setFriends(friendsArray)
            setFriendsPopulated(true)
        })

        return function cleanup() {
            window.Main.removeAllListeners("get_all_friends_of_user")
            // clearInterval(interval);

           };
        
    }) //Fire once?


    return (
      <div className="FriendsListContainer">

           {friendsPopulated && friends.map((friend: Record<string,FriendMetadata>, i) => (
              <FriendObject
                key={i}
                name = {friend[0]}
                lastSeen = {friend[2]}

              />
            ))
           }
        

      </div>
    );
  }
  export default FriendsList;
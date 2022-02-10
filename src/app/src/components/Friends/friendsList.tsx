
import React, { useEffect, useState } from "react";

function FriendObject(props){

    return (
        <div className="FriendObject">{props.friend}</div>
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
    const [friendsPopulated, setFriendsPopulated] = useState(false);


    //TODO: function that reads from the files/friends directory
    //And presents a list of friends 
    useEffect( () =>{
        console.log("rendered ran")
        //Listen to the route to get all friends for the given user
        window.Main.on("get_all_friends_of_user", (event,arg) =>{
            console.log("Friends object received")
            console.log(event) 
            const friendsObjToRender = JSON.parse(event)
            const newState = [...friends, friendsObjToRender];
            setFriends(newState)
            setFriendsPopulated(true)
        })

        return function cleanup() {
            window.Main.removeAllListeners("get_all_friends_of_user")
           };
        
    })

    console.log("LEN OF FRIEND ARR" + friends.length)
    console.log(friends[0])

    return (
      <div className="FriendsListContainer">

           {friendsPopulated && friends.map((friend, i) => (
              <FriendObject
                key={i}
                friend = {friend}
              />
            ))
           }
        

      </div>
    );
  }
  export default FriendsList;
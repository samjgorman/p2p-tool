import React, { useEffect, useState } from "react";

type FriendMetadata = {
  publicKey: string;
  lastSeen: string;
};

/**
 * Simple functional component to render a friend object,
 * called in FriendsList
 * @param props
 * name: string, name of selected friend
 * lastSeen: string, UNIX timestring representing time friend last seen
 */
function FriendObject(props) {
  //Handler to pass selected friendName to Electron,
  //used to render ChatHistory
  function handleFriend(friend: string) {
    window.Main.getFriendChatObject(friend);
  }
  const lastSeenTimestamp: number = parseInt(props.lastSeen);
  const readableLastSeen = new Date(lastSeenTimestamp).toLocaleTimeString(
    "en-US"
  );

  return (
    <div
      className="FriendObjectContainer"
      onClick={() => handleFriend(props.name)}
    >
      <div className="FriendObjectName">{props.name}</div>
      <div className="FriendObjectLastSeen">
        {props.lastSeen === "" ? "Offline" : readableLastSeen}
      </div>
    </div>
  );
}

/**
 * Stateful container that renders a list of a user's friends,
 * and displays whether they are online or not.
 */
function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [friendsPopulated, setFriendsPopulated] = useState(false);

  /**
   * Utility function that converts a Record<string, FriendMetadata> to
   * an Array<object>
   * @param friends
   * @returns friendsArr: Array<Array<string>> with schema
   * [name:string, publicKey:string, lastSeen:string]
   *  https://stackoverflow.com/questions/61350184/how-to-use-foreach-on-recordstring-object-in-typescript-and-angular
   */
  function convertRecordToArray(
    friends: Record<string, FriendMetadata>
  ): Array<Array<string>> {
    const friendsArr: Array<Array<string>> = [];
    for (const key in friends) {
      const friendObject = [];
      friendObject.push(key);
      for (const key2 in friends[key]) {
        friendObject.push(friends[key][key2]);
      }
      friendsArr.push(friendObject);
    }
    return friendsArr;
  }

  useEffect(() => {
    console.log("FriendsList rendered");
    //Listen to the route to get all friends for the given user
    window.Main.on("get_all_friends_of_user", (event, arg) => {
      console.log("Friends object received");
      console.log(event);
      const friendsRecord = event; //Typecheck this as a Record<string, FriendMetadata>
      const friendsArray = convertRecordToArray(friendsRecord);
      setFriends(friendsArray);
      setFriendsPopulated(true);
      //TODO: write test to verify friendsArray renders correctly
    });

    return function cleanup() {
      window.Main.removeAllListeners("get_all_friends_of_user");
    };
  });

  return (
    <div className="FriendsListContainer">
      {friendsPopulated &&
        friends.map((friend: Record<string, FriendMetadata>, i) => (
          <FriendObject key={i} name={friend[0]} lastSeen={friend[2]} />
        ))}
    </div>
  );
}
export default FriendsList;

export type Keys = {
  publicKey: Buffer;
  secretKey: Buffer;
};

export type FriendMetadata = {
  publicKey: string;
  lastSeen: string;
};

export type PublicChannelMessage =
  | { type: "seal"; payload: string }
  | { type: "box"; from: string; payload: string }
  | { type: "syn"; from: string; payload: string }
  | { type: "syn-ack"; from: string; payload: string };

export type PublicChannelMessagePayload =
  | InviteResponseMessage
  | InviteAckMessage
  | PeerSignal;

export type InviteResponseMessage = {
  type: "invite";
  password: string;
  publicKey: string;
};

export type InviteAckMessage = { type: "invite-ack" };

export type PeerSignal = {
  type: "signal";
  data: any;
};

export type OfflineSignal = {
  type: "offlineSignal";
  numMessagesPeerReceived: number;
};

export type OnlineData = {
  type: "onlineData";
  data: string;
};

export type FriendData = {
  friendName: string;
  chatHistory: Array<object>;
};

export type MessageData = {
  recipient: string;
  message: string;
};

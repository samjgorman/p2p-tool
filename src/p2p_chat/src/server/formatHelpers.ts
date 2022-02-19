/**
 * formatMessageToStringifiedLog is a helper function that formats
 * a peerMetadata message into a stringified log suitable to be written
 * to the filesystem.
 * @param identity
 * @param message
 * @param sentOverWebRTC boolean representing whether message was sent over WebRTC or offline
 * @returns
 */
export function formatMessageToStringifiedLog(
  identity: string,
  message: string,
  numReceivedMessagesFromRemotePeer: number
): string {
  const log = {
    timestamp: Date.now(),
    sender: identity,
    message: message,
    numReceivedMessagesFromRemotePeer: numReceivedMessagesFromRemotePeer,
  };
  const stringified_log = JSON.stringify(log);
  return stringified_log;
}

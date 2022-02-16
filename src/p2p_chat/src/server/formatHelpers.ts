/**
 * formatMessageToStringifiedLog is a helper function that formats
 * a peerMetadata message into a stringified log suitable to be written
 * to the filesystem.
 * @param identity
 * @param message
 * @returns
 */
export function formatMessageToStringifiedLog(
  identity: string,
  message: string
): string {
  const log = {
    timestamp: Date.now(),
    sender: identity,
    message: message,
    //TODO: write a last_synced or delivered property
  };
  const stringified_log = JSON.stringify(log);
  return stringified_log;
}

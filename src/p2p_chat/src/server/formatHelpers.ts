export function formatMessageToStringifiedLog(
  identity: string,
  message: string
): string {
  const log = {
    timestamp: Date.now(),
    sender: identity,
    message: message, //Check this
    //TODO: write a last_synced or delivered property
  };
  const stringified_log = JSON.stringify(log);
  return stringified_log;
}

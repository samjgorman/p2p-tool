declare module 'signalhub' {
  function signalhub(appName: string, servers: Array<string>): Signalhub
  interface Signalhub {
    subscribe(channel: string): import('stream').Readable
    broadcast(channel: string, message: any, callback?: () => void)
    close(callback?: () => void)
  }
  export = signalhub
}

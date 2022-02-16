import { api } from "../../server/bridge";

declare global {
  // eslint-disable-next-line
  interface Window {
    Main: typeof api;
  }
}

// During development the backend runs on port 5000.
// In the built app, the backend serves the pages itself, so use the same address.
export const SERVER_URL = import.meta.env.DEV
  ? `http://${window.location.hostname}:5000`
  : window.location.origin

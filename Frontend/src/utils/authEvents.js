export const AUTH_EVENT = "auth-change";

export const emitAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_EVENT));
};

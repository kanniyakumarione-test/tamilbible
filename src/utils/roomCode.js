const ROOM_CODE_KEY = "appPresentationRoomCode";

export function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function getRoomCode() {
  if (typeof window === "undefined") return "default";

  const urlParams = new URLSearchParams(window.location.search);
  const urlRoom = urlParams.get("room");
  if (urlRoom) {
    sessionStorage.setItem("appActiveRoomCode", urlRoom.toUpperCase());
    return urlRoom.toUpperCase();
  }

  const sessionRoom = sessionStorage.getItem("appActiveRoomCode");
  if (sessionRoom) return sessionRoom;
  
  let code = localStorage.getItem(ROOM_CODE_KEY);
  if (!code) {
    code = generateRoomCode();
    localStorage.setItem(ROOM_CODE_KEY, code);
  }
  return code;
}

export function setRoomCode(code) {
  if (!code || typeof window === "undefined") return;
  localStorage.setItem(ROOM_CODE_KEY, code.toUpperCase());
}

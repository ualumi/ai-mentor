export function connectTaskWS(sessionId, token, onMessage) {
  const ws = new WebSocket(
    `ws://localhost:8004/ws/tasks/${sessionId}?token=${token}`
  );

  ws.onmessage = (event) => {
    onMessage(JSON.parse(event.data));
  };

  return ws;
}

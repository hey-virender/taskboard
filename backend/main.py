from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from connection_manager import manager

app = FastAPI()


@app.websocket("/ws")
async def websocket_endpoint(websocket:WebSocket):
  await manager.connect(websocket)
  try:
    while True:
      data = await websocket.receive_json()

  except WebSocketDisconnect:
    manager.disconnect(websocket)
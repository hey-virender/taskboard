from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from connection_manager import manager
from crud import create_task,move_task,delete_task, list_tasks
from models import init_db
from models import Task
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app:FastAPI):
    init_db()
    yield




app = FastAPI(lifespan=lifespan)

app.add_middleware(
   CORSMiddleware,
   allow_origins=["http://localhost:5173"],
   allow_methods=["*"],
   allow_headers=["*"],
)

@app.get("/tasks")
def get_tasks()->list[Task]:
   return list_tasks()


@app.websocket("/ws")
async def websocket_endpoint(websocket:WebSocket):
  await manager.connect(websocket)
  try:
    while True:
      data = await websocket.receive_json()
      if data["action"] == "create_task":
        task = create_task(data["title"])
        await manager.broadcast({"action":"task_created","task": task.model_dump()})

      elif data["action"] == "move_task":
        task = move_task(data["task_id"],data["new_status"],data["new_position"])
        if task is None:
          await manager.broadcast({"action":"task_moved","task": None, "message": "Task not found" })
        else:
          await manager.broadcast({"action":"task_moved","task": task.model_dump()})

      elif data["action"] == "delete_task":
            task = delete_task(data["task_id"])
            if not task:
              await manager.broadcast({"action":"task_deleted","task_id":data["task_id"],"success":False, })
            else:
              await manager.broadcast({"action":"task_deleted","task_id":data["task_id"],"success": True ,})

  except WebSocketDisconnect:
    manager.disconnect(websocket)


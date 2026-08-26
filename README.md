# Taskboard

A real-time Kanban-style task board. Tasks are organized into **Todo**, **In Progress**, and **Done** columns, support drag-and-drop reordering across columns, and stay in sync across all connected clients over a WebSocket connection.

## Tech Stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) — REST + WebSocket server
- [SQLModel](https://sqlmodel.tiangolo.com/) — ORM on top of SQLite
- [uvicorn](https://www.uvicorn.org/) — ASGI server
- [uv](https://docs.astral.sh/uv/) — Python package/project manager

**Frontend**
- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [dnd-kit](https://next.dndkit.com/) (`@dnd-kit/react`, `@dnd-kit/dom`, `@dnd-kit/helpers`) — drag-and-drop
- [react-icons](https://react-icons.github.io/react-icons/)

## Project Structure

```
taskboard/
├── backend/               # FastAPI + WebSocket API
│   ├── main.py             # App entrypoint, routes, WebSocket handler
│   ├── models.py           # SQLModel Task model + DB engine/init
│   ├── crud.py              # Database operations for tasks
│   ├── connection_manager.py  # Tracks/broadcasts to active WebSocket clients
│   └── taskboard.db         # SQLite database (created automatically)
└── frontend/               # React + Vite client
    └── src/
        ├── App.tsx             # Board layout, WebSocket client, state
        └── components/
            ├── TaskComponent.tsx  # Individual task card
            ├── TaskForm.tsx        # Create-task form
            └── Dropable.tsx        # Droppable column wrapper
```

## How It Works

- The frontend fetches the initial task list via `GET /tasks`, then opens a WebSocket connection to `/ws` for real-time updates.
- Creating, moving, and deleting tasks are sent as WebSocket messages (`create_task`, `move_task`, `delete_task`); the server persists the change and broadcasts the result (`task_created`, `task_moved`, `task_deleted`) to every connected client, keeping all open boards in sync.
- Drag-and-drop (powered by `dnd-kit`) updates local state immediately for a responsive feel, then sends a `move_task` message to persist the new column/position.

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- Python 3.11+
- [uv](https://docs.astral.sh/uv/getting-started/installation/)

## Setup

### Backend

```bash
cd backend
uv sync
uv run uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`, and the WebSocket endpoint at `ws://127.0.0.1:8000/ws`. The SQLite database (`taskboard.db`) is created automatically on first run.

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/` with the backend URL:

```
VITE_BASE_URL="http://127.0.0.1:8000"
```

Then start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

> Note: the backend's CORS policy currently allows requests only from `http://localhost:5173`. If you run the frontend on a different origin, update `allow_origins` in `backend/main.py` accordingly.

## Available Scripts (frontend)

| Command           | Description                     |
| ------------------ | -------------------------------- |
| `npm run dev`      | Start the Vite dev server        |
| `npm run build`    | Type-check and build for production |
| `npm run preview`  | Preview the production build     |
| `npm run lint`     | Run ESLint                       |

## API Reference

### REST

| Method | Endpoint  | Description          |
| ------ | --------- | --------------------- |
| GET    | `/tasks`  | List all tasks        |

### WebSocket (`/ws`)

| Action (client → server) | Payload                                    |
| ------------------------- | ------------------------------------------- |
| `create_task`              | `{ action: "create_task", title }`          |
| `move_task`                | `{ action: "move_task", task_id, new_status, new_position }` |
| `delete_task`              | `{ action: "delete_task", task_id }`        |

| Broadcast (server → clients) | Payload                                                   |
| ------------------------------ | ----------------------------------------------------------- |
| `task_created`                  | `{ action: "task_created", task }`                          |
| `task_moved`                    | `{ action: "task_moved", task }`                             |
| `task_deleted`                  | `{ action: "task_deleted", task_id, success }`               |

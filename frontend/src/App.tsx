import { useEffect, useRef, useState } from "react";
import type { Task } from "./types";
import TaskComponent from "./components/TaskComponent";
import TaskForm from "./components/TaskForm";
import Droppable from "./components/Dropable";
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";

export default function App() {
  const [tasks, setTasks] = useState<Record<number, Task>>({});
  const [columns, setColumns] = useState<Record<string, number[]>>({
    todo: [],
    in_progress: [],
    done: [],
  });
  const [isTaskFormOpen, setIsTaskFormOpen] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws");
    wsRef.current = ws;
    ws.onopen = () => console.log("connected");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.action == "task_created") {
        setTasks((prev) => ({ ...prev, [data.task.id]: data.task }));
        setColumns((prev) => ({
          ...prev,
          [data.task.status]: [...prev[data.task.status], data.task.id],
        }));
      } else if (data.action == "task_moved") {
        setTasks((prev) => ({ ...prev, [data.task.id]: data.task }));
        setColumns((prev) => {
          const withoutTask: Record<string, number[]> = {
            todo: prev.todo.filter((id) => id !== data.task.id),
            in_progress: prev.in_progress.filter((id) => id !== data.task.id),
            done: prev.done.filter((id) => id !== data.task.id),
          };
          const targetColumn = [...withoutTask[data.task.status]];
          targetColumn.splice(data.task.position, 0, data.task.id);
          return { ...withoutTask, [data.task.status]: targetColumn };
        });
      } else if (data.action == "task_deleted") {
        setTasks((prev) => {
          const { [data.task_id]: removed, ...rest } = prev;
          return rest;
        });
        setColumns((prev) => ({
          todo: prev.todo.filter((id) => id !== data.task_id),
          in_progress: prev.in_progress.filter((id) => id !== data.task_id),
          done: prev.done.filter((id) => id !== data.task_id),
        }));
      }
    };
    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/tasks`)
      .then((res) => res.json())
      .then((data: Task[]) => {
        const taskMap = data.reduce(
          (acc, task) => {
            return { ...acc, [task.id]: task };
          },
          {} as Record<number, Task>,
        );

        const columnMap = data.reduce(
          (acc, task) => {
            const existing = acc[task.status] ?? [];
            return { ...acc, [task.status]: [...existing, task.id] };
          },
          { todo: [], in_progress: [], done: [] } as Record<string, number[]>,
        );
        setTasks(taskMap);
        setColumns(columnMap);
      });
  }, []);

  const todoTasks = columns.todo.map((id) => tasks[id]);
  const inProgressTasks = columns.in_progress.map((id) => tasks[id]);
  const doneTasks = columns.done.map((id) => tasks[id]);

  function handleCreateTask({ title }: { title: string }) {
    wsRef.current?.send(JSON.stringify({ action: "create_task", title }));
    setIsTaskFormOpen(false);
  }

  function handleDeleteTask({ task_id }: { task_id: number }) {
    wsRef.current?.send(JSON.stringify({ action: "delete_task", task_id }));
  }

  function handleMoveTask({
    task_id,
    new_status,
    new_position,
  }: {
    task_id: number;
    new_status: string;
    new_position: number;
  }) {
    wsRef.current?.send(
      JSON.stringify({
        action: "move_task",
        task_id,
        new_status,
        new_position,
      }),
    );
  }

  function handleDragOver(event: any) {
    setColumns((cols) => move(cols, event));
  }

  function handleDragEnd(event: any) {
    if (event.canceled) return;
    const taskId = event.operation.source?.id;
    if (taskId == null) return;

    for (const [status, ids] of Object.entries(columns)) {
      const idx = ids.indexOf(taskId);
      if (idx != -1) {
        handleMoveTask({
          task_id: taskId,
          new_status: status,
          new_position: idx,
        });
        break;
      }
    }
  }

  return (
    <main>
      <header className="flex justify-between px-4 items-center">
        <h1 className="text-xl text-blue-500">Taskboard</h1>
        <button
          className={`${isTaskFormOpen ? "bg-red-500" : "bg-blue-500"} text-white px-4 py-2 rounded-lg`}
          onClick={() => setIsTaskFormOpen(!isTaskFormOpen)}
        >
          {isTaskFormOpen ? "Close" : "Create Task"}
        </button>
      </header>
      {isTaskFormOpen ? (
        <TaskForm onSend={handleCreateTask} />
      ) : (
        <DragDropProvider onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
          <section className="grid grid-cols-3 gap-3 p-3">
            <div className="flex flex-col gap-3 border-blue-500 border-1 p-3 rounded-lg">
              <h3>Todo</h3>
              <Droppable id="todo">
                {todoTasks.map((task, index) => (
                  <TaskComponent
                    onDelete={handleDeleteTask}
                    key={task.id}
                    task={task}
                    index={index}
                  />
                ))}
              </Droppable>
            </div>
            <div className="flex flex-col gap-3 border-yellow-500 border-1 p-3 rounded-lg">
              <h3>In Progress</h3>
              <Droppable id="in_progress">
                {inProgressTasks.map((task, index) => (
                  <TaskComponent
                    onDelete={handleDeleteTask}
                    key={task.id}
                    task={task}
                    index={index}
                  />
                ))}
              </Droppable>
            </div>
            <div className="flex flex-col gap-3 border-green-500 border-1 p-3 rounded-lg">
              <h3>Done</h3>
              <Droppable id="done">
                {doneTasks.map((task, index) => (
                  <TaskComponent
                    onDelete={handleDeleteTask}
                    key={task.id}
                    task={task}
                    index={index}
                  />
                ))}
              </Droppable>
            </div>
          </section>
        </DragDropProvider>
      )}
    </main>
  );
}

import { useEffect, useRef, useState } from "react";
import type { Task } from "./types";
import TaskComponent from "./components/TaskComponent";
import TaskForm from "./components/TaskForm";
import Droppable from "./components/Dropable";
import { DragDropProvider } from "@dnd-kit/react";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState<boolean>(false);

  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws");
    wsRef.current = ws;
    ws.onopen = () => console.log("connected");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.action == "task_created") {
        setTasks((prev) => [...prev, data.task]);
      } else if (data.action == "task_moved") {
        setTasks((prev) =>
          prev.map((task) => (task.id === data.task.id ? data.task : task)),
        );
      } else if (data.action == "task_deleted") {
        setTasks((prev) => prev.filter((task) => task.id !== data.task_id));
      }
    };
    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/tasks`)
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

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

  function handleDragEnd(event: any) {
    if (event.canceled) return;
    const { operation } = event;
    const taskId = operation.source?.id;
    if (taskId == null) return;
    const newStatus = operation.target?.group ?? operation.target?.id;
    const newPosition = operation.target?.index ?? 0;
    if (newStatus == null) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus, position: newPosition }
          : task,
      ),
    );

    handleMoveTask({
      task_id: taskId,
      new_status: newStatus,
      new_position: newPosition,
    });
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
        <DragDropProvider onDragEnd={handleDragEnd}>
          <section className="grid grid-cols-3 gap-3 p-3">
            <div className="flex flex-col gap-3 border-blue-500 border-1 p-3 rounded-lg">
              <h3>Todo</h3>
              <Droppable id="todo">
                {todoTasks.map((task) => (
                  <TaskComponent
                    onDelete={handleDeleteTask}
                    key={task.id}
                    task={task}
                  />
                ))}
              </Droppable>
            </div>
            <div className="flex flex-col gap-3 border-yellow-500 border-1 p-3 rounded-lg">
              <h3>In Progress</h3>
              <Droppable id="in_progress">
                {inProgressTasks.map((task) => (
                  <TaskComponent
                    onDelete={handleDeleteTask}
                    key={task.id}
                    task={task}
                  />
                ))}
              </Droppable>
            </div>
            <div className="flex flex-col gap-3 border-green-500 border-1 p-3 rounded-lg">
              <h3>Done</h3>
              <Droppable id="done">
                {doneTasks.map((task) => (
                  <TaskComponent
                    onDelete={handleDeleteTask}
                    key={task.id}
                    task={task}
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

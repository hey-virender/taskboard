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
    const ws = new WebSocket(import.meta.env.VITE_WS_URL);
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

  const columnConfig = [
    {
      id: "todo",
      title: "Todo",
      tasks: todoTasks,
      accent: "bg-blue-500",
      header: "border-blue-100 bg-blue-50/60",
    },
    {
      id: "in_progress",
      title: "In Progress",
      tasks: inProgressTasks,
      accent: "bg-yellow-500",
      header: "border-yellow-100 bg-yellow-50/60",
    },
    {
      id: "done",
      title: "Done",
      tasks: doneTasks,
      accent: "bg-green-500",
      header: "border-green-100 bg-green-50/60",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
        <h1 className="text-lg font-bold tracking-tight text-blue-500 sm:text-xl">
          Taskboard
        </h1>
        <button
          className={`${isTaskFormOpen ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"} shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors sm:px-4`}
          onClick={() => setIsTaskFormOpen(!isTaskFormOpen)}
        >
          {isTaskFormOpen ? "Close" : "Create Task"}
        </button>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6">
        {isTaskFormOpen ? (
          <TaskForm onSend={handleCreateTask} />
        ) : (
          <DragDropProvider
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
          >
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {columnConfig.map((column) => (
                <div
                  key={column.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
                >
                  <div
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 ${column.header}`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`size-2.5 rounded-full ${column.accent}`}
                      />
                      <h3 className="text-sm font-semibold text-slate-700">
                        {column.title}
                      </h3>
                    </div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 shadow-sm">
                      {column.tasks.length}
                    </span>
                  </div>
                  <Droppable id={column.id}>
                    {column.tasks.length === 0 ? (
                      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-200 py-8 text-sm text-slate-400">
                        No tasks yet
                      </div>
                    ) : (
                      column.tasks.map((task, index) => (
                        <TaskComponent
                          onDelete={handleDeleteTask}
                          key={task.id}
                          task={task}
                          index={index}
                        />
                      ))
                    )}
                  </Droppable>
                </div>
              ))}
            </section>
          </DragDropProvider>
        )}
      </div>
    </main>
  );
}

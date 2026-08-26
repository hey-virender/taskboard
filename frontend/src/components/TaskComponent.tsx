import { MdDelete } from "react-icons/md";
import type { Task } from "../types";
import { useSortable } from "@dnd-kit/react/sortable";

const statusStyles: Record<string, { border: string; dot: string; badge: string; label: string }> = {
  todo: {
    border: "border-l-blue-500",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-600",
    label: "Todo",
  },
  in_progress: {
    border: "border-l-yellow-500",
    dot: "bg-yellow-500",
    badge: "bg-yellow-50 text-yellow-700",
    label: "In Progress",
  },
  done: {
    border: "border-l-green-500",
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700",
    label: "Done",
  },
};

const TaskComponent = ({
  task,
  onDelete,
  index,
}: {
  task: Task;
  index: number;
  onDelete: ({ task_id }: { task_id: number }) => void;
}) => {
  const { ref, isDragging } = useSortable({
    id: task.id,
    index,
    group: task.status,
  });

  const style = statusStyles[task.status] ?? statusStyles.todo;

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      id={task.id.toString()}
      className={`group relative flex w-full min-h-24 flex-col gap-3 rounded-lg border border-slate-200 border-l-4 bg-white p-3 sm:p-4 shadow-sm transition-shadow hover:shadow-md touch-none cursor-grab active:cursor-grabbing ${style.border}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}
        >
          <span className={`size-1.5 rounded-full ${style.dot}`} />
          {style.label}
        </span>
        <button
          className="shrink-0 rounded-md p-1.5 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 focus-visible:opacity-100 group-hover:opacity-100"
          onClick={() => onDelete({ task_id: task.id })}
          aria-label={`Delete task ${task.title}`}
        >
          <MdDelete className="size-5" />
        </button>
      </div>
      <p className="break-words text-sm font-medium capitalize text-slate-700">
        {task.title}
      </p>
    </div>
  );
};

export default TaskComponent;

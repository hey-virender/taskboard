import { useState } from "react";

const TaskForm = ({ onSend }: { onSend: ({ title }: { title: string }) => void }) => {
  const [title, setTitle] = useState<string>("");

  const handleSubmit = () => {
    if (!title.trim()) {
      return;
    }
    onSend({ title });
    setTitle("");
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <h1 className="text-lg font-semibold text-slate-800">Create Task</h1>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-title" className="text-sm font-medium text-slate-600">
            Title
          </label>
          <input
            id="task-title"
            value={title}
            type="text"
            placeholder="Enter Task Title"
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
        >
          Create Task
        </button>
      </div>
    </div>
  );
};

export default TaskForm;

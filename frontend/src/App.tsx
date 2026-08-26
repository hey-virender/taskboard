import { useEffect,useRef, useState } from "react"
import type { Task } from "./types"
import TaskComponent from "./components/TaskComponent"
import TaskForm from "./components/TaskForm"

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isTaskFormOpen,setIsTaskFormOpen] = useState<boolean>(false)



  const wsRef = useRef<WebSocket | null>(null)
  useEffect(()=>{
    const ws = new WebSocket("ws://127.0.0.1:8000/ws")
    wsRef.current = ws
    ws.onopen=()=>console.log("connected")
    ws.onmessage=(event)=>{
      const data = JSON.parse(event.data)
      if(data.action == "task_created"){
        setTasks(prev=>[...prev,data.task])
      }
      else if(data.action =="task_moved"){
        setTasks(prev=> prev.map(task=> task.id === data.task.id ? data.task : task))
      }
      else if(data.action == "task_deleted"){
        setTasks(prev=>prev.filter(task=>task.id !== data.task_id))
      }
    }
    return ()=>{
      ws.close()
    }
  },[])

  useEffect(()=>{
    fetch(`${import.meta.env.VITE_BASE_URL}/tasks`)
    .then(res=>res.json())
    .then(data=>setTasks(data))
  },[])

  const todoTasks = tasks.filter(t=> t.status === "todo")
  const inProgressTasks = tasks.filter(t=> t.status === "in_progress")
  const doneTasks = tasks.filter(t=> t.status === "done")

  function handleCreateTask ({title}:{title:string}){
    wsRef.current?.send(JSON.stringify({action:"create_task",title}))
    setIsTaskFormOpen(false)
  }

  
  return (
    <main>
      <header className="flex justify-between px-4 items-center">
        <h1 className="text-xl text-blue-500">Taskboard</h1>
        <button className={`${isTaskFormOpen ? "bg-red-500":"bg-blue-500"} text-white px-4 py-2 rounded-lg`} onClick={()=>setIsTaskFormOpen(!isTaskFormOpen)}>{isTaskFormOpen ? "Close" : "Create Task"}</button>
      </header>
      {isTaskFormOpen ? <TaskForm onSend={handleCreateTask}/> : <section>
        <div className="flex flex-col gap-3">
          {todoTasks.map((task)=>(<TaskComponent key={task.id} task={task}/>))}
        </div>
         <div className="flex flex-col gap-3">
          {inProgressTasks.map((task)=>(<TaskComponent key={task.id} task={task}/>))}
        </div>
         <div className="flex flex-col gap-3">
          {doneTasks.map((task)=>(<TaskComponent key={task.id} task={task}/>))}
        </div>
      </section>}
      


    </main>
  )
}

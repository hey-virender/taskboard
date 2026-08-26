import { useEffect,useRef, useState } from "react"
import type { Task } from "./types"

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])



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
        setTasks(prev=>prev.filter(task=>task.id !== data.task.id))
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

  
  return (
    <div>App</div>
  )
}

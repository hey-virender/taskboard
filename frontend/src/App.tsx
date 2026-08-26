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
      console.log(data)
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

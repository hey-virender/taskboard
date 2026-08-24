import { useEffect,useRef } from "react"

export default function App() {
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

  
  return (
    <div>App</div>
  )
}

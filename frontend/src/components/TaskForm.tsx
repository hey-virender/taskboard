import { useState } from 'react'

const TaskForm = ({onSend}:{onSend:({title}:{title:string})=>void}) => {
  const [title,setTitle] = useState<string>("")

  const handleSubmit =()=>{
    if(!title.trim()){
      return 
    }
    onSend({title})
    setTitle("")
  }
  return (
    <div className='w-48 h-24 border-blue-400 border-1'>
      <h1 className='text-lg font-semibold '>Create Task</h1>
      <div>
        <div>
          <label>Title</label>
          <input value={title} type="text" placeholder='Enter Task Title' onChange={(e)=>setTitle(e.target.value)} />
        </div>
        <button onClick={handleSubmit} className='bg-blue-500 text-white font-medium px-4 py-2 rounded-lg'>
          Create Task
        </button>
      </div>
    </div>
  )
}

export default TaskForm
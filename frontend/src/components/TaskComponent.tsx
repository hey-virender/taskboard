import { MdDelete } from "react-icons/md";
import type { Task } from '../types'

const TaskComponent = ({task, onDelete}:{task:Task,onDelete:({task_id}:{task_id:number})=>void}) => {

  return (
    <div  id={task.id.toString()} className={`h-32 w-full p-3 relative border-1 rounded-lg ${task.status == "todo" && "border-blue-500"} ${task.status == "in_progress" && "border-yellow-500"} ${task.status == "done" && "border-green-500"}`}>
      <button className="absolute right-4 top-4 bg-red-500 text-white rounded-md" onClick={()=>onDelete({task_id:task.id})}><MdDelete className="size-8"  /></button>
      <div>
        <p className='capitalize'>{task.title}</p>
      </div>
    </div>
  )
}

export default TaskComponent
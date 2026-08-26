
import type { Task } from '../types'

const TaskComponent = ({task}:{task:Task}) => {
  return (
    <div  id={task.id.toString()}>
      <div>
        <p className='capitalize'>{task.title}</p>
      </div>
    </div>
  )
}

export default TaskComponent
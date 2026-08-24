from sqlmodel import Session
from models import Task, engine

def create_task(title:str) -> Task:
  with Session(engine) as session:
    task = Task(title=title)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

def move_task(task_id:int, new_status:str, new_position:int)->Task | None:
  with Session(engine) as session:
    
    task = session.get(Task,task_id)
    if task is None:
      return None
    task.status = new_status
    task.position = new_position
    session.commit()
    session.refresh(task)
    return task

def delete_task(task_id:int) -> bool :
  with Session(engine) as session:
    task = session.get(Task,task_id)
    if task is None :
      return False
    session.delete(task)
    session.commit()
    return True
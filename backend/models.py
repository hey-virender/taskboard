from sqlmodel import SQLModel, Field, create_engine
from typing import Optional

class Task(SQLModel,table=True):
  id: Optional[int] = Field(default=None, primary_key=True)
  title: str
  status : str = "todo"
  position: int = 0


DATABASE_URL = "sqlite:///taskboard.db"
engine = create_engine(DATABASE_URL)

def init_db():
  SQLModel.metadata.create_all(engine)
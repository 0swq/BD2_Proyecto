from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class Log(BaseModel):
    ID_Log: int
    descripcion: Optional[str] = None
    tipo: Optional[str] = None
    fecha_hora: Optional[datetime] = None

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())

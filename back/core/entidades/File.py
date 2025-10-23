from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class File(BaseModel):
    ID_File: int
    filename: str
    contenido: bytes
    ubicacion: Optional[str] = None
    path: Optional[str] = None
    tamaño: Optional[int] = None
    fecha_subida: Optional[datetime] = None
    tipo_medio: Optional[str] = None
    ID_usuario: Optional[int] = None

    def str(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())

from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class IngresosBoveda(BaseModel):
    ID_Ingresos_boveda: int
    fecha_hora: Optional[datetime] = None
    aceptacion: Optional[bool] = None
    resultado: Optional[str] = None

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())

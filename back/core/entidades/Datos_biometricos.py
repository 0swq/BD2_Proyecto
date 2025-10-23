from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class DatosBiometricos(BaseModel):
    ID_Datos_biometrico: int
    vector: Optional[bytes] = None
    ultima_actualizacion: Optional[datetime] = None

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())

from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from sqlalchemy import Column, Integer, LargeBinary, DateTime, ForeignKey, String, Boolean
from sqlalchemy.orm import relationship, declarative_base
from cassandra.cqlengine.models import Model
from cassandra.cqlengine import columns
from core.entidades import Datos_generales , Base

class Ingreso_Boveda(BaseModel):
    ID_Ingreso_boveda: Optional[str] = None
    fecha_hora: datetime = datetime.utcnow()
    aceptacion: Optional[bool] = None
    resultado: Optional[str] = None
    id_usuario: Optional[str] = None

class IngresoBovedaSQL(Base):
    __tablename__ = "IngresoBovedaSQL"
    __table_args__ = {'schema': 'C##PROYECTO'}
    ID_Ingreso_boveda = Column(String(36), primary_key=True)
    fecha_hora = Column(DateTime, default=datetime.utcnow)
    aceptacion = Column(Boolean, nullable=True)
    resultado = Column(String(200), nullable=True)
    id_usuario = Column(String(36), ForeignKey('C##PROYECTO.UsuarioSQL.ID_Usuario'))
    usuario = relationship("UsuarioSQL", back_populates="ingresos_boveda")

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())

class IngresoBovedaNOSQL(Model):
    __keyspace__ = Datos_generales.nosql_nombre

    ID_Ingreso_boveda = columns.Text(primary_key=True)
    fecha_hora = columns.DateTime(default=datetime.utcnow)
    aceptacion = columns.Boolean()
    resultado = columns.Text()
    id_usuario = columns.UUID()

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())

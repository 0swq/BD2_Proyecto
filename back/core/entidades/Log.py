from datetime import datetime
from typing import Optional

from pydantic import BaseModel
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from cassandra.cqlengine.models import Model
from cassandra.cqlengine import columns
from core.entidades import Datos_generales , Base

class Log(BaseModel):
    ID_Log: Optional[str] = None
    descripcion: Optional[str] = None
    tipo: Optional[str] = None
    fecha_hora: datetime = datetime.utcnow()
    id_usuario: Optional[str] = None

class LogSQL(Base):
    __tablename__ = "LogSQL"
    __table_args__ = {'schema': 'C##PROYECTO'}
    ID_Log = Column(String(36), primary_key=True)
    descripcion = Column(String(500), nullable=True)
    tipo = Column(String(10), nullable=True)
    fecha_hora = Column(DateTime, default=datetime.utcnow)

    id_usuario = Column(String(36), ForeignKey('C##PROYECTO.UsuarioSQL.ID_Usuario'))
    usuario = relationship("UsuarioSQL", back_populates="log")

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())

class LogNOSQL(Model):
    __keyspace__ = Datos_generales.nosql_nombre

    ID_Log = columns.Text(primary_key=True)
    descripcion = columns.Text()
    tipo = columns.Text()
    fecha_hora = columns.DateTime(default=datetime.utcnow)
    id_usuario = columns.UUID()

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())

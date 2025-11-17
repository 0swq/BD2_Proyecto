
from datetime import datetime
from typing import Optional

from pydantic import BaseModel
#SQLAlchemy
from sqlalchemy import Column, Integer, LargeBinary, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship, declarative_base

#Cassandra
from cassandra.cqlengine.models import Model
from cassandra.cqlengine import columns

from core.entidades import Datos_generales , Base


class File(BaseModel):
    ID_File: Optional[str] = None
    filename: str
    ubicacion: Optional[str] = None
    path: Optional[str] = None
    tamano: Optional[int] = None
    fecha_subida: datetime = datetime.utcnow()
    tipo_medio: Optional[str] = None
    id_usuario: Optional[str] = None
    contrasena_hash: Optional[bytes] = None
    contrasena_salt : Optional[bytes] = None

class FileSQL(Base):
    __tablename__ = "FileSQL"
    __table_args__ = {'schema': 'C##PROYECTO'}
    ID_File = Column(String(36), primary_key=True)
    filename = Column(String(255), nullable=False)
    ubicacion = Column(String(255), nullable=True)
    path = Column(String(512), nullable=True)
    tamano = Column(Integer, nullable=True)
    fecha_subida = Column(DateTime, default=datetime.utcnow)
    tipo_medio = Column(String(100), nullable=True)
    contrasena_hash = Column(LargeBinary, nullable=True)
    contrasena_salt= Column(LargeBinary, nullable=True)
    id_usuario = Column(String(36), ForeignKey('C##PROYECTO.UsuarioSQL.ID_Usuario'))
    usuario = relationship("UsuarioSQL", back_populates="file")

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())


class FileNOSQL(Model):
    __keyspace__ = Datos_generales.nosql_nombre

    ID_File = columns.Text(primary_key=True)
    filename = columns.Text()
    ubicacion = columns.Text()
    path = columns.Text()
    tamano = columns.Integer()
    fecha_subida = columns.DateTime(default=datetime.utcnow)
    tipo_medio = columns.Text()
    id_usuario = columns.UUID()
    contrasena_hash = columns.Blob()
    contrasena_salt= columns.Blob()

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())

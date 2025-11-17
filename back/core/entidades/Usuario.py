from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, String, Integer, Date, DateTime
from sqlalchemy.orm import declarative_base, relationship
from cassandra.cqlengine.models import Model
from cassandra.cqlengine import columns
from sqlalchemy.sql.sqltypes import LargeBinary

from core.entidades import Datos_generales , Base

class Usuario(BaseModel):
    ID_Usuario: Optional[str] = None
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    foto_perfil: Optional[str] = None
    contrasena_hash: Optional[bytes] = None
    contrasena_salt : Optional[bytes] = None
    email: Optional[EmailStr] = None
    fecha_registro: datetime = datetime.utcnow()
    rol: Optional[str] = None
    estado: Optional[str] = None

class UsuarioSQL(Base):
    __tablename__ = "UsuarioSQL"
    __table_args__ = {'schema': 'C##PROYECTO'}
    ID_Usuario = Column(String(36), primary_key=True)
    nombres = Column(String(100), nullable=True)
    apellidos = Column(String(100), nullable=True)
    foto_perfil = Column(String(255), nullable=True)
    contrasena_hash = Column(LargeBinary, nullable=True)
    contrasena_salt = Column(LargeBinary, nullable=True)
    email = Column(String(255), nullable=True)
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    rol = Column(String(50), nullable=True)
    estado = Column(String(10), nullable=True)

    datos_biometricos = relationship("DatosBiometricosSQL", back_populates="usuario")
    file = relationship("FileSQL", back_populates="usuario")
    ingresos_boveda = relationship("IngresoBovedaSQL", back_populates="usuario")
    log = relationship("LogSQL", back_populates="usuario")

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())
class UsuarioNOSQL(Model):
    __keyspace__ = Datos_generales.nosql_nombre

    ID_Usuario = columns.Text(primary_key=True)
    nombres = columns.Text()
    apellidos = columns.Text()
    foto_perfil = columns.Text()
    contrasena_hash = columns.Blob()
    contrasena_salt= columns.Blob()
    email = columns.Text()
    fecha_registro = columns.DateTime(default=datetime.utcnow)
    rol = columns.Text()
    estado = columns.Text()

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())

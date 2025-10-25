from datetime import date, datetime
from sqlalchemy import Column, String, Integer, Date, DateTime
from sqlalchemy.orm import declarative_base, relationship
from cassandra.cqlengine.models import Model
from cassandra.cqlengine import columns
from core.entidades import Datos_generales

Base = declarative_base()

class UsuarioSQL(Base):
    __tablename__ = "usuarioSQL"

    ID_Usuario = Column(String, primary_key=True)
    nombres = Column(String, nullable=True)
    apellidos = Column(String, nullable=True)
    fecha_nacimiento = Column(Date, nullable=True)
    foto_perfil = Column(String, nullable=True)
    contraseña_hash = Column(String, nullable=True)
    email = Column(String, nullable=True)
    fecha_registro = Column(DateTime, default=datetime.utcnow)
    rol = Column(String, nullable=True)
    estado = Column(String, nullable=True)

    datos_biometricos = relationship("DatosBiometricosSQL", back_populates="usuario")
    file = relationship("FileSQL", back_populates="usuario")
    ingresos_boveda = relationship("IngresoBovedaSQL", back_populates="usuario")
    log = relationship("LogSQL", back_populates="usuario")

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())


class UsuarioNOSQL(Model):
    __keyspace__ = Datos_generales.nosql_nombre

    ID_Usuario = columns.UUID(primary_key=True)
    nombres = columns.Text()
    apellidos = columns.Text()
    fecha_nacimiento = columns.Date()
    foto_perfil = columns.Text()
    contraseña_hash = columns.Text()
    email = columns.Text()
    fecha_registro = columns.DateTime(default=datetime.utcnow)
    rol = columns.Text()
    estado = columns.Text()

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())

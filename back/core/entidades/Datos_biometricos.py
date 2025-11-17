from datetime import datetime
from typing import Optional

from pydantic import BaseModel

# SQLAlchemy
from sqlalchemy import Column, Text, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

# Cassandra
from cassandra.cqlengine.models import Model
from cassandra.cqlengine import columns

from core.entidades import Datos_generales, Base


class Datos_Biometricos(BaseModel):
    ID_Datos_biometricos: Optional[str] = None
    vector: Optional[str] = None
    ultima_actualizacion: datetime = datetime.utcnow()
    id_usuario: Optional[str] = None

class DatosBiometricosSQL(Base):
    __tablename__ = "DatosBiometricosSQL"
    __table_args__ = {'schema': 'C##PROYECTO'}

    ID_Datos_biometricos = Column(String(36), primary_key=True)
    vector = Column(Text, nullable=True)
    ultima_actualizacion = Column(DateTime, default=datetime.utcnow)

    id_usuario = Column(String(36), ForeignKey('C##PROYECTO.UsuarioSQL.ID_Usuario'))
    usuario = relationship("UsuarioSQL", back_populates="datos_biometricos")

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())


class DatosBiometricosNOSQL(Model):
    __keyspace__ = Datos_generales.nosql_nombre

    ID_Datos_biometricos = columns.Text(primary_key=True)
    vector = columns.Text()
    ultima_actualizacion = columns.DateTime(default=datetime.utcnow)
    id_usuario = columns.UUID()

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())

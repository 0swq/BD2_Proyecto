from datetime import datetime

#SQLAlchemy
from sqlalchemy import Column, Integer, LargeBinary, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship, declarative_base

#Cassandra
from cassandra.cqlengine.models import Model
from cassandra.cqlengine import columns

from core.entidades import Datos_generales

Base = declarative_base()


class DatosBiometricosSQL(Base):
    __tablename__ = "DatosBiometricosSQL"

    ID_Datos_biometrico = Column(String, primary_key=True)
    vector = Column(LargeBinary, nullable=True)
    ultima_actualizacion = Column(DateTime, default=datetime.utcnow)

    usuario_id = Column(String, ForeignKey('UsuarioSQL.ID_Usuario'))
    usuario = relationship("UsuarioSQL", back_populates="datos_biometricos")
    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())




class DatosBiometricosNOSQL(Model):
    #Mapeo solo para cassandra
    __keyspace__ = Datos_generales.nosql_nombre
    ID_Datos_biometrico = columns.UUID(primary_key=True)
    vector = columns.Blob()
    ultima_actualizacion = columns.DateTime(default=datetime.utcnow)
    usuario_id = columns.UUID()

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())

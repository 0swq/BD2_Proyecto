
from datetime import datetime

#SQLAlchemy
from sqlalchemy import Column, Integer, LargeBinary, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship, declarative_base

#Cassandra
from cassandra.cqlengine.models import Model
from cassandra.cqlengine import columns

from core.entidades import Datos_generales

Base = declarative_base()

class FileSQL(Base):
    __tablename__ = "FileSQL"

    ID_File = Column(String, primary_key=True)
    filename = Column(String, nullable=False)
    contenido = Column(LargeBinary, nullable=False)
    ubicacion = Column(String, nullable=True)
    path = Column(String, nullable=True)
    tamaño = Column(Integer, nullable=True)
    fecha_subida = Column(DateTime, default=datetime.utcnow)
    tipo_medio = Column(String, nullable=True)

    usuario_id = Column(String, ForeignKey('UsuarioSQL.ID_Usuario'))
    usuario = relationship("UsuarioSQL", back_populates="file")

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())

class FileNOSQL(Model):
    __keyspace__ = Datos_generales.nosql_nombre

    ID_File = columns.UUID(primary_key=True)
    filename = columns.Text()
    contenido = columns.Blob()
    ubicacion = columns.Text()
    path = columns.Text()
    tamaño = columns.Integer()
    fecha_subida = columns.DateTime(default=datetime.utcnow)
    tipo_medio = columns.Text()
    usuario_id = columns.UUID()

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())

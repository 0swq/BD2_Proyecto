from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from cassandra.cqlengine.models import Model
from cassandra.cqlengine import columns
from core.entidades import Usuario, Datos_generales

Base = declarative_base()


class LogSQL(Base):
    __tablename__ = "LogSQL"

    ID_Log = Column(String, primary_key=True)
    descripcion = Column(String, nullable=True)
    tipo = Column(String, nullable=True)
    fecha_hora = Column(DateTime, default=datetime.utcnow)

    usuario_id = Column(String, ForeignKey('usuarioSQL.ID_Usuario'))
    usuario = relationship("UsuarioSQL", back_populates="log")

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())


class LogNOSQL(Model):
    __keyspace__ = Datos_generales.nosql_nombre

    ID_Log = columns.UUID(primary_key=True)
    descripcion = columns.Text()
    tipo = columns.Text()
    fecha_hora = columns.DateTime(default=datetime.utcnow)
    id_usuario = columns.UUID()

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())

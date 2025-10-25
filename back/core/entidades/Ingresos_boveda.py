from datetime import datetime
from sqlalchemy import Column, Integer, LargeBinary, DateTime, ForeignKey, String, Boolean
from sqlalchemy.orm import relationship, declarative_base
from cassandra.cqlengine.models import Model
from cassandra.cqlengine import columns
from core.entidades import Datos_generales

Base = declarative_base()

class IngresoBovedaSQL(Base):
    __tablename__ = "IngresoBovedaSQL"

    id_ingreso = Column(String, primary_key=True)
    fecha_hora = Column(DateTime, default=datetime.utcnow)
    aceptacion = Column(Boolean, nullable=True)
    resultado = Column(String, nullable=True)
    usuario_id = Column(String, ForeignKey('usuarioSQL.ID_Usuario'))
    usuario = relationship("UsuarioSQL", back_populates="ingresos_boveda")

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())


class IngresoBovedaNOSQL(Model):
    __keyspace__ = Datos_generales.nosql_nombre

    id_ingreso = columns.UUID(primary_key=True)
    fecha_hora = columns.DateTime(default=datetime.utcnow)
    aceptacion = columns.Boolean()
    resultado = columns.Text()
    id_usuario = columns.UUID()

    def __str__(self):
        return ', '.join(f"{k}: {v}" for k, v in vars(self).items())

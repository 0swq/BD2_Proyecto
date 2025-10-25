from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

class OracleConnection:
    instancia = None
    def __new__(cls):
        if cls.instancia is None:
            cls.instancia = super().__new__(cls)
            cls.instancia.engine = create_engine("oracle+oracledb://SYSTEM:c204@localhost:1521/?service_name=FREE")
            cls.instancia.SessionFactory = sessionmaker(bind=cls.instancia.engine)
        return cls.instancia

    @contextmanager
    def get_session(self):
        nueva_sesion = self.SessionFactory()
        try:
            yield nueva_sesion
            nueva_sesion.commit()
        except Exception as e:
            nueva_sesion.rollback()
            raise RuntimeError(f"Error al conectar a Oracle: {e}")
        finally:
            nueva_sesion.close()


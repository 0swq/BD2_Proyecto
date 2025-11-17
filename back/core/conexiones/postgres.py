import os
from contextlib import contextmanager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


class PostgreConnection:
    instancia = None

    def __new__(cls):
        if cls.instancia is None:
            cls.instancia = super().__new__(cls)
            os.environ['PGSYSCONFDIR'] = ''
            os.environ['PGSERVICEFILE'] = ''
            url = "postgresql+psycopg2://postgres:c204@127.0.0.1:5432/bd_proyecto"

            cls.instancia.engine = create_engine(
                url,
                pool_pre_ping=True,
                connect_args={'options': '-c client_encoding=utf8'}
            )
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
            raise RuntimeError(f"Error en sesión de PostgreSQL: {e}")
        finally:
            nueva_sesion.close()
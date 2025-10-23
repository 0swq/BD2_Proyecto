from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

class PostgresConnection:
    _instance = None
    url = "postgresql://postgres:12321@localhost:5432/BD2_proyecto"
    def __new__(cls, url: str):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            engine = create_engine(url, echo=True)
            cls._instance.session = sessionmaker(bind=engine)()
            cls._instance.engine = engine
        return cls._instance

    def get_session(self):
        return self.session

    def close_session(self):
        self.session.close()
        PostgresConnection._instance = None

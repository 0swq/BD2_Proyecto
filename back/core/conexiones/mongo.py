from pymongo import MongoClient
from typing import Optional


class MongoConnection:
    instancia: Optional['MongoConnection'] = None
    cliente: Optional[MongoClient] = None
    db = None

    def __new__(cls):
        if cls.instancia is None:
            url = "mongodb://localhost:27017"
            try:
                cls.instancia = super().__new__(cls)
                cls.cliente = MongoClient(url)
                cls.db = cls.cliente["proyecto_final"]
                return cls.instancia
            except Exception as e:
                raise RuntimeError(f"Error al conectar a Mongo: {e}")

        return cls.instancia

    def get_cliente(self):
        return self.cliente

    def get_db(self):
        if self.db is None:
            raise RuntimeError("MongoDB no esta disponible.")
        return self.db

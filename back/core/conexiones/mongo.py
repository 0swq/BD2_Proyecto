from pymongo import MongoClient
from typing import Optional


class MongoConnection:
    instancia= None
    cliente = None
    def __new__(cls):
        if cls.instancia is None:
            url = "mongodb://localhost:27017"
            try:
                cls.instancia = super().__new__(cls)
                cls.cliente = MongoClient(url)
                return cls.instancia
            except Exception as e:
                raise RuntimeError(f"Error al conectar a Mongo: {e}")
        return None

    def get_cliente(self):
        return self.cliente


from pymongo import MongoClient
from typing import Optional


class MongoConnection:
    _instance: Optional['MongoConnection'] = None
    client: Optional[MongoClient] = None
    url= "mongodb://localhost:27017/"
    def __new__(cls, url: str = None):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            final_url = url if url else cls.url_base
            try:
                cls.client = MongoClient(final_url)
            except Exception as e:
                print(f"Error al conectar con MongoDB: {e}")
                cls._instance = None
                raise

        return cls._instance

    def get_database(self, db_name: str = "mi_base_de_datos"):
        if self.client:
            return self.client[db_name]

    def close_connection(self):
        if self.client:
            self.client.close()
            MongoConnection.client = None
            MongoConnection._instance = None
            print("Conexión a MongoDB cerrada.")
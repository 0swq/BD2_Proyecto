from cassandra.cluster import Cluster
from cassandra.auth import PlainTextAuthProvider
from typing import Optional, List

class CassandraConnection:
    _instance: Optional['CassandraConnection'] = None
    _cluster: Optional[Cluster] = None
    CONTACT_POINTS: List[str] = ['localhost']
    PORT: int = 9042
    AUTH_PROVIDER: Optional[PlainTextAuthProvider] = None

    def __new__(cls, contact_points: List[str] = None):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            final_points = contact_points or cls.CONTACT_POINTS
            try:
                cls._cluster = Cluster(contact_points=final_points,
                                       port=cls.PORT,
                                       auth_provider=cls.AUTH_PROVIDER)
                cls._cluster.connect()
                print("Conexión a Cassandra establecida.")
            except Exception as e:
                cls._cluster = None
                cls._instance = None
                raise RuntimeError(f"Error al conectar con Cassandra: {e}")
        return cls._instance

    def get_session(self, keyspace: Optional[str] = None):
        if self._cluster:
            return self._cluster.connect(keyspace=keyspace)
        raise RuntimeError("Cassandra no está conectado.")

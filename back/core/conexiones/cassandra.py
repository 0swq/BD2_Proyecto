from cassandra.cluster import Cluster

class CassandraConnection:
    instancia = None
    sesion = None

    def __new__(cls):
        if cls.instancia is None:
            try:
                cls.instancia = super().__new__(cls)
                url = "cassandra"
                cluster = Cluster([url])
                cls.sesion = cluster.connect()
                return cls.instancia
            except Exception as e:
                raise RuntimeError(f"Error al conectar a Cassandra: {e}")

    def get_session(self):
        return self.sesion

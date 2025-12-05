from cassandra.cluster import Cluster

class CassandraConnection:
    instancia = None
    sesion = None
    cluster = None

    def __new__(cls):
        if cls.instancia is None:
            try:
                cls.instancia = super().__new__(cls)
                url = "127.0.0.1"
                cls.cluster = Cluster([url],port=9042)

                cls.sesion = cls.cluster.connect("proyecto_final")
                return cls.instancia
            except Exception as e:
                raise RuntimeError(f"Error al conectar a Cassandra: {e}")
        return cls.instancia

    def get_session(self):
        return self.sesion

    def close(self):
        if self.sesion:
            self.sesion.shutdown()
        if self.cluster:
            self.cluster.shutdown()


from infra.crud.Datos_biometricos_repository import Datos_biometricosInterface, Datos_biometricosPostGre, \
    Datos_biometricosOracle, Datos_biometricosMongo, Datos_biometricosCassandra
from typing import List, Dict, Any, Optional


class Datos_biometricos_service:
    def __init__(self):
        self.postgre = Datos_biometricosPostGre()
        self.oracle = Datos_biometricosOracle()
        self.mongo = Datos_biometricosMongo()
        self.cassandra = Datos_biometricosCassandra()
        self.bd = [self.postgre, self.oracle, self.mongo, self.cassandra]

    def crear(self, datos_biometricos):
        for bd in self.bd:
            bd.create(datos_biometricos)

    def modificar(self, datos_biometricos):
        for bd in self.bd:
            bd.update(datos_biometricos)

    def obtener(self, id: str) -> Optional[Dict[str, Any]]:
        return self.mongo.get(id)

    def eliminar(self, id: str) -> Dict[str, bool]:
        resultados = {
            "postgre" : self.postgre.delete(id),
            "oracle" : self.oracle.delete(id),
            "mongo" : self.mongo.delete(id),
            "cassandra" : self.cassandra.delete(id)
        }
        return resultados

    def listar(self) :
        return self.mongo.list()

    def listar_por_ID(self, id: str) :
        return self.mongo.list_ID_Usuario(id)
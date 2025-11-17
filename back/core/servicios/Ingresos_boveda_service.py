from infra.crud.Ingresos_boveda_repository import Ingresos_bovedaInterface, Ingresos_bovedaPostGre, \
    Ingresos_bovedaOracle, Ingresos_bovedaCassandra, Ingresos_bovedaMongo
from typing import List, Dict, Any, Optional


class Ingresos_boveda_service:
    def __init__(self):
        self.postgre = Ingresos_bovedaPostGre()
        self.oracle = Ingresos_bovedaOracle()
        self.mongo = Ingresos_bovedaMongo()
        self.cassandra = Ingresos_bovedaCassandra()
        self.bd = [self.postgre, self.oracle, self.mongo, self.cassandra]

    def crear(self, ingreso_boveda):
        for bd in self.bd:
            bd.create(ingreso_boveda)

    def modificar(self, ingreso_boveda):
        for bd in self.bd:
            bd.update(ingreso_boveda)

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

    def listar(self):
        return self.mongo.list()

    def listar_por_ID(self, id: str):
        return self.mongo.list_ID_Usuario(id)
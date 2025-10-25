from core.entidades.Ingresos_boveda import IngresoBovedaSQL, IngresoBovedaNOSQL
from infra.crud.Ingresos_boveda_repository import Ingresos_bovedaInterface
from typing import List, Dict, Any, Optional


class Ingresos_boveda_service:
    def __init__(self,
                 postgre_repo: Ingresos_bovedaInterface,
                 oracle_repo: Ingresos_bovedaInterface,
                 mongo_repo: Ingresos_bovedaInterface,
                 cassandra_repo: Ingresos_bovedaInterface):
        self.postgre = postgre_repo
        self.oracle = oracle_repo
        self.mongo = mongo_repo
        self.cassandra = cassandra_repo

    def crear(self, ingreso_boveda_sql: IngresoBovedaSQL, ingreso_boveda_nosql: IngresoBovedaNOSQL):
        self.postgre.create(ingreso_boveda_sql)
        self.oracle.create(ingreso_boveda_sql)
        self.mongo.create(ingreso_boveda_nosql)
        self.cassandra.create(ingreso_boveda_nosql)

    def modificar(self, ingreso_boveda_sql: IngresoBovedaSQL, ingreso_boveda_nosql: IngresoBovedaNOSQL):
        self.postgre.update(ingreso_boveda_sql)
        self.oracle.update(ingreso_boveda_sql)
        self.mongo.update(ingreso_boveda_nosql)
        self.cassandra.update(ingreso_boveda_nosql)

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

    def listar(self) -> List[Dict[str, Any]]:
        return self.mongo.list()

    def listar_por_ID(self, id: str) -> Optional[Dict[str, Any]]:
        return self.mongo.list_id(id)
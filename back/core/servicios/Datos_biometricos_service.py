from core.entidades.Datos_biometricos import DatosBiometricosSQL, DatosBiometricosNOSQL
from infra.crud.Datos_biometricos_repository import Datos_biometricosInterface
from typing import List, Dict, Any, Optional


class Datos_biometricos_service:
    def __init__(self,
                 postgre_repo: Datos_biometricosInterface,
                 oracle_repo: Datos_biometricosInterface,
                 mongo_repo: Datos_biometricosInterface,
                 cassandra_repo: Datos_biometricosInterface):
        self.postgre = postgre_repo
        self.oracle = oracle_repo
        self.mongo = mongo_repo
        self.cassandra = cassandra_repo

    def crear(self, datos_biometricos_sql: DatosBiometricosSQL, datos_biometricos_nosql: DatosBiometricosNOSQL):
        self.postgre.create(datos_biometricos_sql)
        self.oracle.create(datos_biometricos_sql)
        self.mongo.create(datos_biometricos_nosql)
        self.cassandra.create(datos_biometricos_nosql)

    def modificar(self, datos_biometricos_sql: DatosBiometricosSQL, datos_biometricos_nosql: DatosBiometricosNOSQL):
        self.postgre.update(datos_biometricos_sql)
        self.oracle.update(datos_biometricos_sql)
        self.mongo.update(datos_biometricos_nosql)
        self.cassandra.update(datos_biometricos_nosql)

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
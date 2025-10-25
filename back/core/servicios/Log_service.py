from core.entidades.Log import LogSQL, LogNOSQL
from infra.crud.Log_repository import LogInterface
from typing import List, Dict, Any, Optional


class Log_service:
    def __init__(self,
                 postgre_repo: LogInterface,
                 oracle_repo: LogInterface,
                 mongo_repo: LogInterface,
                 cassandra_repo: LogInterface):
        self.postgre = postgre_repo
        self.oracle = oracle_repo
        self.mongo = mongo_repo
        self.cassandra = cassandra_repo

    def crear(self, logSQL: LogSQL, logNOSQL: LogNOSQL):
        self.postgre.create(logSQL)
        self.oracle.create(logSQL)
        self.mongo.create(logNOSQL)
        self.cassandra.create(logNOSQL)

    def modificar(self, logSQL: LogSQL, logNOSQL: LogNOSQL):
        self.postgre.update(logSQL)
        self.oracle.update(logSQL)
        self.mongo.update(logNOSQL)
        self.cassandra.update(logNOSQL)

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
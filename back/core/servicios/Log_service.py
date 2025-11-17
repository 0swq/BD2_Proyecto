from core.entidades.Log import LogSQL, LogNOSQL
from infra.crud.Log_repository import LogInterface, LogMongo, LogCassandra, LogOracle, LogPostGre
from typing import List, Dict, Any, Optional


class Log_service:
    def __init__(self):
        self.postgre = LogPostGre()
        self.oracle = LogOracle()
        self.mongo = LogMongo()
        self.cassandra = LogCassandra()
        self.bd = [self.postgre, self.oracle, self.mongo, self.cassandra]

    def crear(self, log):
        for bd in self.bd:
            bd.create(log)

    def modificar(self, log):
        for bd in self.bd:
            bd.update(log)
    def obtener(self, id: str):
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

    def listar_por_UsuarioID(self, id: str) -> Optional[Dict[str, Any]]:
        return self.mongo.list_ID_Usuario(id)
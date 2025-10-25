from core.entidades.File import FileSQL, FileNOSQL
from infra.crud.File_repository import FileInterface
from typing import List, Dict, Any, Optional


class File_service:
    def __init__(self,
                 postgre_repo: FileInterface,
                 oracle_repo: FileInterface,
                 mongo_repo: FileInterface,
                 cassandra_repo: FileInterface):
        self.postgre = postgre_repo
        self.oracle = oracle_repo
        self.mongo = mongo_repo
        self.cassandra = cassandra_repo

    def crear(self, file_sql: FileSQL, file_nosql: FileNOSQL):
        self.postgre.create(file_sql)
        self.oracle.create(file_sql)
        self.mongo.create(file_nosql)
        self.cassandra.create(file_nosql)

    def modificar(self, file_sql: FileSQL, file_nosql: FileNOSQL):
        self.postgre.update(file_sql)
        self.oracle.update(file_sql)
        self.mongo.update(file_nosql)
        self.cassandra.update(file_nosql)

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
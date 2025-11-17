from core.entidades.File import FileSQL, FileNOSQL, File
from infra.crud.File_repository import FileInterface, FilePostGre, FileOracle, FileMongo, FileCassandra
from typing import List, Dict, Any, Optional
from utils.fst import cop


class File_service:
    def __init__(self):
        self.postgre = FilePostGre()
        self.oracle = FileOracle()
        self.mongo = FileMongo()
        self.cassandra = FileCassandra()
        self.bd = [self.postgre, self.oracle, self.mongo, self.cassandra]

    def crear(self, file: File):
        for bd in self.bd:
            bd.create(file)
    def modificar(self, file: File):
        for bd in self.bd:
            bd.update(file)

    def obtener(self, id: str) -> Optional[Dict[str, Any]]:
        return self.mongo.get(id)

    def eliminar(self, id: str) -> Dict[str, bool]:
        resultados = {
            "postgre": self.postgre.delete(id),
            "oracle": self.oracle.delete(id),
            "mongo": self.mongo.delete(id),
            "cassandra": self.cassandra.delete(id)
        }
        return resultados

    def listar(self):
        return self.mongo.list()

    def listar_por_ID(self, id: str) :
        return self.mongo.list_ID_Usuario(id)
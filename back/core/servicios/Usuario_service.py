from core.entidades.Usuario import UsuarioSQL, UsuarioNOSQL
from infra.crud.Usuario_repository import UsuarioInterface
from typing import List, Dict, Any, Optional

class Usuario_service:
    def __init__(self,
                 postgre_repo: UsuarioInterface,
                 oracle_repo: UsuarioInterface,
                 mongo_repo: UsuarioInterface,
                 cassandra_repo: UsuarioInterface):
        self.postgre = postgre_repo
        self.oracle = oracle_repo
        self.mongo = mongo_repo
        self.cassandra = cassandra_repo

    def crear(self, usuarioSQL: UsuarioSQL, usuarioNOSQL: UsuarioNOSQL):
        self.postgre.create(usuarioSQL)
        self.oracle.create(usuarioSQL)
        self.mongo.create(usuarioNOSQL)
        self.cassandra.create(usuarioNOSQL)

    def modificar(self, usuarioSQL: UsuarioSQL, usuarioNOSQL: UsuarioNOSQL):
        self.postgre.update(usuarioSQL)
        self.oracle.update(usuarioSQL)
        self.mongo.update(usuarioNOSQL)
        self.cassandra.update(usuarioNOSQL)

    def obtener(self, id: str):
        return self.mongo.get(id)

    def eliminar(self, id: str) :
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
        return self.mongo.list_id(id)
from core.entidades.Usuario import UsuarioSQL, UsuarioNOSQL, Usuario
from infra.crud.Usuario_repository import UsuarioInterface, UsuarioPostGre, UsuarioMongo, UsuarioOracle, \
    UsuarioCassandra
from typing import List, Dict, Any, Optional
from utils.fst import cop


class Usuario_service:
    def __init__(self):

        self.postgre = UsuarioPostGre()
        self.oracle = UsuarioOracle()
        self.mongo = UsuarioMongo()
        self.cassandra = UsuarioCassandra()
        self.bd = [self.postgre,self.oracle,self.mongo,self.cassandra]

    def crear(self, usuario):
        for bd in self.bd:
            bd.create(usuario)


    def modificar(self, usuario):
        for bd in self.bd:
            if not bd.update(usuario):
                return False
        return True

    def obtener(self, id: str):
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

    def listar_por_UsuarioID(self, id: str):
        return self.mongo.list_ID_Usuario(id)
    def verificar_email_existe(self,email):
        return self.mongo.get_cEmail(email)
    def obtener_por_email(self,email):
        return self.mongo.get_Email(email)

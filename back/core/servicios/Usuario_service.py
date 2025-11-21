import os

from core.entidades.Usuario import UsuarioSQL, UsuarioNOSQL, Usuario
from core.servicios.Datos_biometricos_service import Datos_biometricos_service
from core.servicios.File_service import File_service
from core.servicios.Ingresos_boveda_service import Ingresos_boveda_service
from core.servicios.Log_service import Log_service
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
        self.bd = [self.postgre, self.oracle, self.mongo, self.cassandra]

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

    def eliminar(self, id: str) -> Dict[str, any]:
        usuario = self.obtener(id)
        Datos_biometricos = Datos_biometricos_service().listar_por_ID(id)
        Files = File_service().listar_por_ID(id)
        Ingresos = Ingresos_boveda_service().listar_por_ID(id)
        Logs = Log_service().listar_por_UsuarioID(id)

        for d in Datos_biometricos:
            Datos_biometricos_service().eliminar(d["ID_Datos_biometricos"])

        for f in Files:
            File_service().eliminar(f["ID_File"])

        for i in Ingresos:
            Ingresos_boveda_service().eliminar(i["ID_Ingreso_boveda"])

        for l in Logs:
            Log_service().eliminar(l["ID_Log"])

        if usuario["foto_perfil"] and usuario["foto_perfil"] != "default.jpeg":
            ruta_foto = os.path.join("Recursos/fotos_perfil", usuario["foto_perfil"])
            if os.path.exists(ruta_foto):
                try:
                    os.remove(ruta_foto)
                except Exception as e:
                    print(f"Error al eliminar foto: {e}")

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

    def verificar_email_existe(self, email):
        return self.mongo.get_cEmail(email)

    def obtener_por_email(self, email):
        return self.mongo.get_Email(email)

import os

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

    def eliminar(self, id: str) -> Dict[str, Any]:
        file = self.obtener(id)

        if not file:
            return {"success": False, "error": "Archivo no encontrado"}

        if file.get("path") and file.get("ubicacion") == "Nube":
            # Agregar "back/" si la ruta no la incluye
            file_path = file["path"]
            if not file_path.startswith("back/"):
                file_path = os.path.join("back", file_path)

            file_path = os.path.normpath(file_path)

            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    print(f"Archivo físico eliminado: {file_path}")
                except Exception as e:
                    print(f"Error al eliminar archivo físico: {e}")
            else:
                print(f"Advertencia: El archivo físico no existe en: {file_path}")

        resultados = {
            "postgre": self.postgre.delete(id),
            "oracle": self.oracle.delete(id),
            "mongo": self.mongo.delete(id),
            "cassandra": self.cassandra.delete(id)
        }

        return {"success": True, "message": "Archivo eliminado correctamente", "resultados": resultados}

    def listar(self):
        return self.mongo.list()

    def listar_por_ID(self, id: str):
        return self.mongo.list_ID_Usuario(id)

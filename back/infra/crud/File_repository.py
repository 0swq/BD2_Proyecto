from bson import ObjectId
from core.entidades.File import FileSQL, FileNOSQL, File
from core.conexiones.mongo import MongoConnection
from core.conexiones.oracle import OracleConnection
from core.conexiones.postgres import PostgreConnection
from core.conexiones.cassandra import CassandraConnection
from utils.fst import cop

conexionPostgre = PostgreConnection()
conexionOracle = OracleConnection()
conexionMongo = MongoConnection()
conexionCassandra = CassandraConnection()


class FileInterface:
    def create(self, entity): pass

    def get(self, id): pass

    def delete(self, id): pass

    def update(self, entity): pass

    def list(self): pass

    def list_ID_Usuario(self, id): pass


class FilePostGre(FileInterface):
    def create(self, file: File):
        datos = file.model_dump(exclude_unset=True)
        file_sql = FileSQL(**datos)
        with conexionPostgre.get_session() as session:
            session.add(file_sql)

    def get(self, id):
        with conexionPostgre.get_session() as session:
            return session.query(FileSQL).filter_by(ID_File=id).one_or_none()

    def delete(self, id):
        with conexionPostgre.get_session() as session:
            obj = session.query(FileSQL).filter_by(ID_File=id).one_or_none()
            if obj:
                session.delete(obj)
                return True
            return False

    def update(self, file):
        file_limpio = {k: v for k, v in file.items() if k != "_id"}
        file_sql = FileSQL(**file_limpio)
        with conexionPostgre.get_session() as session:
            obj = session.query(FileSQL).filter_by(ID_File=file_sql.ID_File).one_or_none()
            if obj:
                para_actualizar = {k: v for k, v in file_sql.__dict__.items() if
                                   not k.startswith('_') and k != "ID_File"}

                for attr, value in para_actualizar.items():
                    setattr(obj, attr, value)

                return True
            return False

    def list(self):
        pass

    def list_ID_Usuario(self, id_usuario):
        pass


class FileOracle(FileInterface):
    def create(self, file: File):
        datos = file.model_dump(exclude_unset=True)
        file = FileSQL(**datos)
        with conexionOracle.get_session() as session:
            session.add(file)

    def get(self, id):
        with conexionOracle.get_session() as session:
            return session.query(FileSQL).filter_by(ID_File=id).one_or_none()

    def delete(self, id):
        with conexionOracle.get_session() as session:
            obj = session.query(FileSQL).filter_by(ID_File=id).one_or_none()
            if obj:
                session.delete(obj)
                return True
            return False

    def update(self, file):
        file_limpio = {k: v for k, v in file.items() if k != "_id"}
        file_sql = FileSQL(**file_limpio)
        with conexionOracle.get_session() as session:
            obj = session.query(FileSQL).filter_by(ID_File=file_sql.ID_File).one_or_none()
            if obj:
                para_actualizar = {k: v for k, v in file_sql.__dict__.items() if
                                   not k.startstart('_') and k != "ID_File"}

                for attr, value in para_actualizar.items():
                    setattr(obj, attr, value)

                return True
            return False

    def list(self):
        pass

    def list_ID_Usuario(self, id_usuario):
        pass


class FileMongo(FileInterface):
    def create(self, file: File):
        datos = file.model_dump(exclude_unset=True)
        db = conexionMongo.get_db()
        return db.FileNOSQL.insert_one(datos)

    def get(self, id):
        db = conexionMongo.get_db()
        return db.FileNOSQL.find_one({"_id": id})

    def delete(self, id):
        db = conexionMongo.get_db()
        result = db.FileNOSQL.delete_one({"_id": id})
        return result.deleted_count > 0

    def update(self, file):
        db = conexionMongo.get_db()
        actualizado = {k: v for k, v in file.items() if k != "ID_File" and k != "_id"}
        result = db.FileNOSQL.update_one(
            {"_id": file["ID_File"]},
            {"$set": actualizado}
        )
        return result.modified_count > 0

    def list(self):
        db = conexionMongo.get_db()
        logs = db.FileNOSQL.find()
        return [{**log, "ID_File": str(log["_id"])} for log in logs]

    def list_ID_Usuario(self, id_usuario):
        db = conexionMongo.get_db()
        logs = db.FileNOSQL.find({"id_usuario": id_usuario})
        return [{**log, "ID_File": str(log["_id"])} for log in logs]


class FileCassandra(FileInterface):
    def create(self, file: File):
        datos = file.model_dump(exclude_unset=True)
        file_nosql = FileNOSQL(**datos)
        file_nosql.save()
        return file_nosql

    def get(self, id):
        return FileNOSQL.objects(ID_File=id).first()

    def delete(self, id):
        obj = self.get(id)
        if obj:
            obj.delete()
            return True
        return False

    def update(self, file):
        file_limpio = {k: v for k, v in file.items() if k != "_id"}
        file_nosql = FileNOSQL(**file_limpio)
        obj = self.get(file_nosql.ID_File)
        if obj:
            para_actualizar = {k: v for k, v in file_nosql.__dict__.items() if
                               not k.startswith('_') and k != "ID_File"}
            for attr, value in para_actualizar.items():
                setattr(obj, attr, value)
            obj.save()
            return True
        return False

    def list(self):
        pass

    def list_ID_Usuario(self, id_usuario):
        pass
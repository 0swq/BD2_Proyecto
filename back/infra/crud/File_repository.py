from bson import ObjectId
from core.entidades.File import FileSQL, FileNOSQL
from core.conexiones.mongo import MongoConnection
from core.conexiones.oracle import OracleConnection
from core.conexiones.postgres import PostgreConnection
from core.conexiones.cassandra import CassandraConnection

conexionPostgre = PostgreConnection()
conexionOracle = OracleConnection()
conexionMongo = MongoConnection()
conexionCassandra = CassandraConnection()


class FileInterface:
    def create(self, entity): pass
    def get(self, id): pass
    def delete(self, id): pass
    def update(self, entity): pass


class FilePostGre(FileInterface):
    def create(self, file_sql: FileSQL):
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

    def update(self, file_sql: FileSQL):
        with conexionPostgre.get_session() as session:
            obj = session.query(FileSQL).filter_by(ID_File=file_sql.ID_File).one_or_none()
            if obj:
                data_to_update = {k: v for k, v in file_sql.__dict__.items() if
                                  not k.startswith('_') and k != "ID_File"}

                for attr, value in data_to_update.items():
                    setattr(obj, attr, value)

                return True
            return False


class FileOracle(FileInterface):
    def create(self, file_sql: FileSQL):
        with conexionOracle.get_session() as session:
            session.add(file_sql)

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

    def update(self, file_sql: FileSQL):
        with conexionOracle.get_session() as session:
            obj = session.query(FileSQL).filter_by(ID_File=file_sql.ID_File).one_or_none()
            if obj:
                data_to_update = {k: v for k, v in file_sql.__dict__.items() if
                                  not k.startswith('_') and k != "ID_File"}

                for attr, value in data_to_update.items():
                    setattr(obj, attr, value)

                return True
            return False


class FileMongo(FileInterface):
    def create(self, file_entity):
        db = conexionMongo.get_db()
        return db.file.insert_one(vars(file_entity))

    def get(self, id):
        db = conexionMongo.get_db()
        return db.file.find_one({"_id": ObjectId(id)})

    def delete(self, id):
        db = conexionMongo.get_db()
        result = db.file.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0

    def update(self, file_entity):
        db = conexionMongo.get_db()
        update_data = {k: v for k, v in vars(file_entity).items() if k != "ID_File"}
        result = db.file.update_one(
            {"_id": ObjectId(file_entity.ID_File)},
            {"$set": update_data}
        )
        return result.modified_count > 0


class FileCassandra(FileInterface):
    def create(self, file_nosql: FileNOSQL):
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

    def update(self, file_nosql: FileNOSQL):
        obj = self.get(file_nosql.ID_File)
        if obj:
            data_to_update = {k: v for k, v in file_nosql.__dict__.items() if
                              not k.startswith('_') and k != "ID_File"}

            for attr, value in data_to_update.items():
                setattr(obj, attr, value)

            obj.save()
            return True
        return False
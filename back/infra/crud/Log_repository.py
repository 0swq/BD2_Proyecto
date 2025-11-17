from bson import ObjectId
from core.entidades.Log import LogSQL, LogNOSQL, Log
from core.conexiones.mongo import MongoConnection
from core.conexiones.oracle import OracleConnection
from core.conexiones.postgres import PostgreConnection
from core.conexiones.cassandra import CassandraConnection
from utils.fst import cop

conexionPostgre = PostgreConnection()
conexionOracle = OracleConnection()
conexionMongo = MongoConnection()
conexionCassandra = CassandraConnection()


class LogInterface:
    def create(self, entity): pass
    def get(self, id): pass
    def delete(self, id): pass
    def update(self, entity): pass
    def list(self): pass
    def list_ID_Usuario(self, id): pass


class LogPostGre(LogInterface):
    def create(self, log: Log):
        datos = log.model_dump(exclude_unset=True)
        log = LogSQL(**datos)
        with conexionPostgre.get_session() as session:
            session.add(log)

    def get(self, id):
        with conexionPostgre.get_session() as session:
            return session.query(LogSQL).filter_by(ID_Log=id).one_or_none()

    def delete(self, id):
        with conexionPostgre.get_session() as session:
            obj = session.query(LogSQL).filter_by(ID_Log=id).one_or_none()
            if obj:
                session.delete(obj)
                return True
            return False

    def update(self, log):
        log_limpio = {k: v for k, v in log.items() if k != "_id"}
        log_sql = LogSQL(**log_limpio)
        with conexionPostgre.get_session() as session:
            obj = session.query(LogSQL).filter_by(ID_Log=log_sql.ID_Log).one_or_none()
            if obj:
                para_actualizar = {k: v for k, v in log_sql.__dict__.items() if
                                  not k.startswith('_') and k != "ID_Log"}

                for attr, value in para_actualizar.items():
                    setattr(obj, attr, value)

                return True
            return False

    def list(self):pass
    def list_ID_Usuario(self, id_usuario):pass


class LogOracle(LogInterface):
    def create(self, log: Log):
        datos = log.model_dump(exclude_unset=True)
        log = LogSQL(**datos)
        with conexionOracle.get_session() as session:
            session.add(log)

    def get(self, id):
        with conexionOracle.get_session() as session:
            return session.query(LogSQL).filter_by(ID_Log=id).one_or_none()

    def delete(self, id):
        with conexionOracle.get_session() as session:
            obj = session.query(LogSQL).filter_by(ID_Log=id).one_or_none()
            if obj:
                session.delete(obj)
                return True
            return False

    def update(self, log):
        log_limpio = {k: v for k, v in log.items() if k != "_id"}
        log_sql = LogSQL(**log_limpio)
        with conexionOracle.get_session() as session:
            obj = session.query(LogSQL).filter_by(ID_Log=log_sql.ID_Log).one_or_none()
            if obj:
                para_actualizar = {k: v for k, v in log_sql.__dict__.items() if
                                   not k.startswith('_') and k != "ID_Log"}

                for attr, value in para_actualizar.items():
                    setattr(obj, attr, value)

                return True
            return False

    def list(self):pass
    def list_ID_Usuario(self, id_usuario):pass


class LogMongo(LogInterface):
    def create(self, log: Log):
        datos = log.model_dump(exclude_unset=True)
        db = conexionMongo.get_db()
        return db.LogNOSQL.insert_one(datos)

    def get(self, id):
        db = conexionMongo.get_db()
        return db.LogNOSQL.find_one({"ID_Log": id})

    def delete(self, id):
        db = conexionMongo.get_db()
        result = db.LogNOSQL.delete_one({"ID_Log": id})
        return result.deleted_count > 0

    def update(self, log):
        db = conexionMongo.get_db()
        actualizado = {k: v for k, v in log.items() if k != "ID_Log" and k != "_id"}
        result = db.LogNOSQL.update_one(
            {"ID_Log": log["ID_Log"]},
            {"$set": actualizado}
        )
        return result.modified_count > 0

    def list(self):
        db = conexionMongo.get_db()
        logs = db.LogNOSQL.find()
        return [{**log, "ID_Log": str(log["ID_Log"])} for log in logs]

    def list_ID_Usuario(self, id_usuario):
        db = conexionMongo.get_db()
        logs = db.LogNOSQL.find({"id_usuario": id_usuario})
        return [{**log, "ID_Log": str(log["ID_Log"])} for log in logs]


class LogCassandra(LogInterface):
    def create(self, log: Log):
        datos = log.model_dump(exclude_unset=True)
        log = LogNOSQL(**datos)
        log.save()
        return log

    def get(self, id):
        return LogNOSQL.objects(ID_Log=id).first()

    def delete(self, id):
        obj = self.get(id)
        if obj:
            obj.delete()
            return True
        return False

    def update(self, log):
        log_limpio = {k: v for k, v in log.items() if k != "_id"}
        log_nosql = LogNOSQL(**log_limpio)
        obj = self.get(log_nosql.ID_Log)
        if obj:
            para_actualizar = {k: v for k, v in log_nosql.__dict__.items() if
                               not k.startswith('_') and k != "ID_Log"}
            for attr, value in para_actualizar.items():
                setattr(obj, attr, value)
            obj.save()
            return True
        return False

    def list(self):pass
    def list_ID_Usuario(self, id_usuario):pass
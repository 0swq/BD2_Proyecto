from bson import ObjectId
from core.entidades.Log import LogSQL, LogNOSQL
from core.conexiones.mongo import MongoConnection
from core.conexiones.oracle import OracleConnection
from core.conexiones.postgres import PostgreConnection
from core.conexiones.cassandra import CassandraConnection

conexionPostgre = PostgreConnection()
conexionOracle = OracleConnection()
conexionMongo = MongoConnection()
conexionCassandra = CassandraConnection()


class LogInterface:
    def create(self, entity): pass
    def get(self, id): pass
    def delete(self, id): pass
    def update(self, entity): pass


class LogPostGre(LogInterface):
    def create(self, log_sql: LogSQL):
        with conexionPostgre.get_session() as session:
            session.add(log_sql)

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

    def update(self, log_sql: LogSQL):
        with conexionPostgre.get_session() as session:
            obj = session.query(LogSQL).filter_by(ID_Log=log_sql.ID_Log).one_or_none()
            if obj:
                data_to_update = {k: v for k, v in log_sql.__dict__.items() if
                                  not k.startswith('_') and k != "ID_Log"}

                for attr, value in data_to_update.items():
                    setattr(obj, attr, value)

                return True
            return False


class LogOracle(LogInterface):
    def create(self, log_sql: LogSQL):
        with conexionOracle.get_session() as session:
            session.add(log_sql)

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

    def update(self, log_sql: LogSQL):
        with conexionOracle.get_session() as session:
            obj = session.query(LogSQL).filter_by(ID_Log=log_sql.ID_Log).one_or_none()
            if obj:
                data_to_update = {k: v for k, v in log_sql.__dict__.items() if
                                  not k.startswith('_') and k != "ID_Log"}

                for attr, value in data_to_update.items():
                    setattr(obj, attr, value)

                return True
            return False


class LogMongo(LogInterface):
    def create(self, log_entity):
        db = conexionMongo.get_db()
        return db.log.insert_one(vars(log_entity))

    def get(self, id):
        db = conexionMongo.get_db()
        return db.log.find_one({"_id": ObjectId(id)})

    def delete(self, id):
        db = conexionMongo.get_db()
        result = db.log.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0

    def update(self, log_entity):
        db = conexionMongo.get_db()
        update_data = {k: v for k, v in vars(log_entity).items() if k != "ID_Log"}
        result = db.log.update_one(
            {"_id": ObjectId(log_entity.ID_Log)},
            {"$set": update_data}
        )
        return result.modified_count > 0


class LogCassandra(LogInterface):
    def create(self, log_nosql: LogNOSQL):
        log_nosql.save()
        return log_nosql

    def get(self, id):
        return LogNOSQL.objects(ID_Log=id).first()

    def delete(self, id):
        obj = self.get(id)
        if obj:
            obj.delete()
            return True
        return False

    def update(self, log_nosql: LogNOSQL):
        obj = self.get(log_nosql.ID_Log)
        if obj:
            data_to_update = {k: v for k, v in log_nosql.__dict__.items() if
                              not k.startswith('_') and k != "ID_Log"}

            for attr, value in data_to_update.items():
                setattr(obj, attr, value)

            obj.save()
            return True
        return False
from bson import ObjectId
from core.entidades.Datos_biometricos import DatosBiometricosSQL, DatosBiometricosNOSQL
from core.conexiones.mongo import MongoConnection
from core.conexiones.oracle import OracleConnection
from core.conexiones.postgres import PostgreConnection
from core.conexiones.cassandra import CassandraConnection

conexionPostgre = PostgreConnection()
conexionOracle = OracleConnection()
conexionMongo = MongoConnection()
conexionCassandra = CassandraConnection()


class Datos_biometricosInterface:
    def create(self, entity): pass
    def get(self, id): pass
    def delete(self, id): pass
    def update(self, entity): pass


#Postgre
class Datos_biometricosPostGre(Datos_biometricosInterface):
    def create(self, datos_biometricos_sql: DatosBiometricosSQL):
        with conexionPostgre.get_session() as session:
            session.add(datos_biometricos_sql)

    def get(self, id):
        with conexionPostgre.get_session() as session:
            return session.query(DatosBiometricosSQL).filter_by(ID_Datos_biometrico=id).one_or_none()

    def delete(self, id):
        with conexionPostgre.get_session() as session:
            obj = session.query(DatosBiometricosSQL).filter_by(ID_Datos_biometrico=id).one_or_none()
            if obj:
                session.delete(obj)
                return True
            return False

    def update(self, datos_biometricos_sql: DatosBiometricosSQL):
        with conexionPostgre.get_session() as session:
            obj = session.query(DatosBiometricosSQL).filter_by(
                ID_Datos_biometrico=datos_biometricos_sql.ID_Datos_biometrico).one_or_none()
            if obj:
                data_to_update = {k: v for k, v in datos_biometricos_sql.__dict__.items() if
                                  not k.startswith('_') and k != "ID_Datos_biometrico"}

                for attr, value in data_to_update.items():
                    setattr(obj, attr, value)

                return True
            return False

#Oracle
class Datos_biometricosOracle(Datos_biometricosInterface):
    def create(self, datos_biometricos_sql: DatosBiometricosSQL):
        with conexionOracle.get_session() as session:
            session.add(datos_biometricos_sql)

    def get(self, id):
        with conexionOracle.get_session() as session:
            return session.query(DatosBiometricosSQL).filter_by(ID_Datos_biometrico=id).one_or_none()

    def delete(self, id):
        with conexionOracle.get_session() as session:
            obj = session.query(DatosBiometricosSQL).filter_by(ID_Datos_biometrico=id).one_or_none()
            if obj:
                session.delete(obj)
                return True
            return False

    def update(self, datos_biometricos_sql: DatosBiometricosSQL):
        with conexionOracle.get_session() as session:
            obj = session.query(DatosBiometricosSQL).filter_by(
                ID_Datos_biometrico=datos_biometricos_sql.ID_Datos_biometrico).one_or_none()
            if obj:
                data_to_update = {k: v for k, v in datos_biometricos_sql.__dict__.items() if
                                  not k.startswith('_') and k != "ID_Datos_biometrico"}

                for attr, value in data_to_update.items():
                    setattr(obj, attr, value)

                return True
            return False

#Mongo
class Datos_biometricosMongo(Datos_biometricosInterface):
    def create(self, datos_biometricos):
        db = conexionMongo.get_db()
        return db.datos_biometricos.insert_one(vars(datos_biometricos))

    def get(self, id):
        db = conexionMongo.get_db()
        return db.datos_biometricos.find_one({"_id": ObjectId(id)})

    def delete(self, id):
        db = conexionMongo.get_db()
        result = db.datos_biometricos.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0

    def update(self, datos_biometricos):
        db = conexionMongo.get_db()
        update_data = {k: v for k, v in vars(datos_biometricos).items() if k != "ID_Datos_biometrico"}
        result = db.datos_biometricos.update_one(
            {"_id": ObjectId(datos_biometricos.ID_Datos_biometrico)},
            {"$set": update_data}
        )
        return result.modified_count > 0

#Cassandra
class Datos_biometricosCassandra(Datos_biometricosInterface):
    def create(self, datos_biometricos_nosql: DatosBiometricosNOSQL):
        datos_biometricos_nosql.save()
        return datos_biometricos_nosql

    def get(self, id):
        return DatosBiometricosNOSQL.objects(ID_Datos_biometrico=id).first()

    def delete(self, id):
        obj = self.get(id)
        if obj:
            obj.delete()
            return True
        return False

    def update(self, datos_biometricos_nosql: DatosBiometricosNOSQL):
        obj = self.get(datos_biometricos_nosql.ID_Datos_biometrico)
        if obj:
            data_to_update = {k: v for k, v in datos_biometricos_nosql.__dict__.items() if
                              not k.startswith('_') and k != "ID_Datos_biometrico"}

            for attr, value in data_to_update.items():
                setattr(obj, attr, value)

            obj.save()
            return True
        return False
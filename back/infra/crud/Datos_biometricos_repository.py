from bson import ObjectId

from core.entidades import Datos_biometricos
from core.entidades.Datos_biometricos import DatosBiometricosSQL, DatosBiometricosNOSQL, Datos_Biometricos
from core.conexiones.mongo import MongoConnection
from core.conexiones.oracle import OracleConnection
from core.conexiones.postgres import PostgreConnection
from core.conexiones.cassandra import CassandraConnection
from utils.fst import cop

conexionPostgre = PostgreConnection()
conexionOracle = OracleConnection()
conexionMongo = MongoConnection()
conexionCassandra = CassandraConnection()


class Datos_biometricosInterface:
    def create(self, entity): pass

    def get(self, id): pass

    def delete(self, id): pass

    def update(self, entity): pass

    def list(self): pass

    def list_ID_Usuario(self, id): pass


class Datos_biometricosPostGre(Datos_biometricosInterface):
    def create(self, datos_biometricos: Datos_Biometricos):
        datos = datos_biometricos.model_dump(exclude_unset=True)
        datos_biometricos = DatosBiometricosSQL(**datos)
        with conexionPostgre.get_session() as session:
            session.add(datos_biometricos)

    def get(self, id):
        with conexionPostgre.get_session() as session:
            return session.query(DatosBiometricosSQL).filter_by(ID_Datos_biometricos=id).one_or_none()

    def delete(self, id):
        with conexionPostgre.get_session() as session:
            obj = session.query(DatosBiometricosSQL).filter_by(ID_Datos_biometricos=id).one_or_none()
            if obj:
                session.delete(obj)
                return True
            return False

    def update(self, datos_biometricos):
        datos_limpio = {k: v for k, v in datos_biometricos.items() if k != "_id"}
        datos_sql = DatosBiometricosSQL(**datos_limpio)
        with conexionPostgre.get_session() as session:
            obj = session.query(DatosBiometricosSQL).filter_by(
                ID_Datos_biometricos=datos_sql.ID_Datos_biometricos).one_or_none()
            if obj:
                por_actualizar = {k: v for k, v in datos_sql.__dict__.items() if
                                  not k.startswith('_') and k != "ID_Datos_biometricos"}

                for attr, value in por_actualizar.items():
                    setattr(obj, attr, value)

                return True
            return False

    def list(self):
        pass

    def list_ID_Usuario(self, id):
        pass


class Datos_biometricosOracle(Datos_biometricosInterface):
    def create(self, datos_biometricos: Datos_Biometricos):
        datos = datos_biometricos.model_dump(exclude_unset=True)
        datos_biometricos = DatosBiometricosSQL(**datos)
        with conexionOracle.get_session() as session:
            session.add(datos_biometricos)

    def get(self, id):
        with conexionOracle.get_session() as session:
            return session.query(DatosBiometricosSQL).filter_by(ID_Datos_biometricos=id).one_or_none()

    def delete(self, id):
        with conexionOracle.get_session() as session:
            obj = session.query(DatosBiometricosSQL).filter_by(ID_Datos_biometricos=id).one_or_none()
            if obj:
                session.delete(obj)
                return True
            return False

    def update(self, datos_biometricos):
        datos_limpio = {k: v for k, v in datos_biometricos.items() if k != "_id"}
        datos_sql = DatosBiometricosSQL(**datos_limpio)
        with conexionOracle.get_session() as session:
            obj = session.query(DatosBiometricosSQL).filter_by(
                ID_Datos_biometricos=datos_sql.ID_Datos_biometricos
            ).one_or_none()

            if obj:
                for k, v in datos_sql.__dict__.items():
                    if not k.startswith('_') and k != "ID_Datos_biometricos":
                        setattr(obj, k, v)
                return True
            return False

    def list(self):
        pass

    def list_ID_Usuario(self, id):
        pass


class Datos_biometricosMongo(Datos_biometricosInterface):
    def create(self, datos_biometricos: Datos_Biometricos):
        datos = datos_biometricos.model_dump(exclude_unset=True)
        db = conexionMongo.get_db()
        return db.Datos_biometricosNOSQL.insert_one(datos)

    def get(self, id):
        db = conexionMongo.get_db()
        return db.Datos_biometricosNOSQL.find_one({"ID_Datos_biometricos": id})

    def delete(self, id):
        db = conexionMongo.get_db()
        result = db.Datos_biometricosNOSQL.delete_one({"ID_Datos_biometricos": id})
        return result.deleted_count > 0

    def update(self, datos_biometricos):
        db = conexionMongo.get_db()
        actualizado = {k: v for k, v in datos_biometricos.items() if k != "ID_Datos_biometricos" and k != "_id"}
        result = db.Datos_biometricosNOSQL.update_one(
            {"_id": datos_biometricos["ID_Datos_biometricos"]},
            {"$set": actualizado}
        )
        return result.modified_count > 0

    def list(self): pass

    def list_ID_Usuario(self, id):
        db = conexionMongo.get_db()
        Datos_Biometricos = db.Datos_biometricosNOSQL.find({"id_usuario": id})
        return [{**datos_b, "ID_Datos_biometricos": str(datos_b["ID_Datos_biometricos"])} for datos_b in Datos_Biometricos]


class Datos_biometricosCassandra(Datos_biometricosInterface):
    def create(self, datos_biometricos: Datos_Biometricos):
        datos = datos_biometricos.model_dump(exclude_unset=True)
        datos_biometricos = DatosBiometricosNOSQL(**datos)
        datos_biometricos.save()
        return datos_biometricos

    def get(self, id):
        return DatosBiometricosNOSQL.objects(ID_Datos_biometricos=id).first()

    def delete(self, id):
        obj = self.get(id)
        if obj:
            obj.delete()
            return True
        return False

    def update(self, datos_biometricos):
        datos_limpio = {k: v for k, v in datos_biometricos.items() if k != "ID_Datos_biometricos"}
        datos_nosql = DatosBiometricosNOSQL(**datos_limpio)
        obj = self.get(datos_nosql.ID_Datos_biometricos)
        if obj:
            por_actualizar = {k: v for k, v in datos_nosql.__dict__.items() if
                              not k.startswith('_') and k != "ID_Datos_biometricos"}

            for attr, value in por_actualizar.items():
                setattr(obj, attr, value)

            obj.save()
            return True
        return False

    def list(self):
        pass

    def list_ID_Usuario(self, id):
        pass
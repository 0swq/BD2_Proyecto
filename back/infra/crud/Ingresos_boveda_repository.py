from bson import ObjectId
from core.entidades.Ingresos_boveda import IngresoBovedaSQL, IngresoBovedaNOSQL, Ingreso_Boveda
from core.conexiones.mongo import MongoConnection
from core.conexiones.oracle import OracleConnection
from core.conexiones.postgres import PostgreConnection
from core.conexiones.cassandra import CassandraConnection
from utils.fst import cop

conexionPostgre = PostgreConnection()
conexionOracle = OracleConnection()
conexionMongo = MongoConnection()
conexionCassandra = CassandraConnection()


class Ingresos_bovedaInterface:
    def create(self, entity): pass

    def get(self, id): pass

    def delete(self, id): pass

    def update(self, entity): pass

    def list(self): pass

    def list_ID_Usuario(self, id): pass


class Ingresos_bovedaPostGre(Ingresos_bovedaInterface):
    def create(self, ingreso_boveda: Ingreso_Boveda):
        datos = ingreso_boveda.model_dump(exclude_unset=True)
        ingreso_boveda = IngresoBovedaSQL(**datos)
        with conexionPostgre.get_session() as session:
            session.add(ingreso_boveda)

    def get(self, id):
        with conexionPostgre.get_session() as session:
            return session.query(IngresoBovedaSQL).filter_by(ID_Ingreso_boveda=id).one_or_none()

    def delete(self, id):
        with conexionPostgre.get_session() as session:
            obj = session.query(IngresoBovedaSQL).filter_by(ID_Ingreso_boveda=id).one_or_none()
            if obj:
                session.delete(obj)
                return True
            return False

    def update(self, ingreso_boveda):
        ingreso_limpio = {k: v for k, v in ingreso_boveda.items() if k != "_id"}
        ingreso_sql = IngresoBovedaSQL(**ingreso_limpio)
        with conexionPostgre.get_session() as session:
            obj = session.query(IngresoBovedaSQL).filter_by(
                ID_Ingreso_boveda=ingreso_sql.ID_Ingreso_boveda).one_or_none()
            if obj:
                para_actualizar = {k: v for k, v in ingreso_sql.__dict__.items() if
                                   not k.startswith('_') and k != "ID_Ingreso_boveda"}

                for attr, value in para_actualizar.items():
                    setattr(obj, attr, value)

                return True
            return False

    def list(self):
        pass

    def list_ID_Usuario(self, id_usuario):
        pass


class Ingresos_bovedaOracle(Ingresos_bovedaInterface):
    def create(self, ingreso_boveda: Ingreso_Boveda):
        datos = ingreso_boveda.model_dump(exclude_unset=True)
        ingreso_boveda = IngresoBovedaSQL(**datos)
        with conexionOracle.get_session() as session:
            session.add(ingreso_boveda)

    def get(self, id):
        with conexionOracle.get_session() as session:
            return session.query(IngresoBovedaSQL).filter_by(ID_Ingreso_boveda=id).one_or_none()

    def delete(self, id):
        with conexionOracle.get_session() as session:
            obj = session.query(IngresoBovedaSQL).filter_by(ID_Ingreso_boveda=id).one_or_none()
            if obj:
                session.delete(obj)
                return True
            return False

    def update(self, ingreso_boveda):
        ingreso_limpio = {k: v for k, v in ingreso_boveda.items() if k != "_id"}
        ingreso_sql = IngresoBovedaSQL(**ingreso_limpio)
        with conexionOracle.get_session() as session:
            obj = session.query(IngresoBovedaSQL).filter_by(
                ID_Ingreso_boveda=ingreso_sql.ID_Ingreso_boveda).one_or_none()
            if obj:
                para_actualizar = {k: v for k, v in ingreso_sql.__dict__.items() if
                                   not k.startswith('_') and k != "ID_Ingreso_boveda"}

                for attr, value in para_actualizar.items():
                    setattr(obj, attr, value)

                return True
            return False

    def list(self):
        pass

    def list_ID_Usuario(self, id_usuario):
        pass


class Ingresos_bovedaMongo(Ingresos_bovedaInterface):
    def create(self, ingreso_boveda: Ingreso_Boveda):
        datos = ingreso_boveda.model_dump(exclude_unset=True)
        db = conexionMongo.get_db()
        return db.Ingresos_bovedaNOSQL.insert_one(datos)

    def get(self, id):
        db = conexionMongo.get_db()
        return db.Ingresos_bovedaNOSQL.find_one({"_id": id})

    def delete(self, id):
        db = conexionMongo.get_db()
        result = db.Ingresos_bovedaNOSQL.delete_one({"_id": id})
        return result.deleted_count > 0

    def update(self, ingreso_boveda):
        db = conexionMongo.get_db()
        actualizado = {k: v for k, v in ingreso_boveda.items() if k != "ID_Ingreso_boveda" and k != "_id"}
        result = db.Ingresos_bovedaNOSQL.update_one(
            {"_id": ingreso_boveda["ID_Ingreso_boveda"]},
            {"$set": actualizado}
        )
        return result.modified_count > 0

    def list(self):
        db = conexionMongo.get_db()
        logs = db.Ingresos_bovedaNOSQL.find()
        return [{**log, "ID_Ingreso_boveda": str(log["_id"])} for log in logs]

    def list_ID_Usuario(self, id_usuario):
        db = conexionMongo.get_db()
        logs = db.Ingresos_bovedaNOSQL.find({"id_usuario": id_usuario})
        return [{**log, "ID_Ingreso_boveda": str(log["_id"])} for log in logs]


class Ingresos_bovedaCassandra(Ingresos_bovedaInterface):
    def create(self, ingreso_boveda: Ingreso_Boveda):
        datos = ingreso_boveda.model_dump(exclude_unset=True)
        ingreso_nosql = IngresoBovedaNOSQL(**datos)
        ingreso_nosql.save()
        return ingreso_nosql

    def get(self, id):
        return IngresoBovedaNOSQL.objects(ID_Ingreso_boveda=id).first()

    def delete(self, id):
        obj = self.get(id)
        if obj:
            obj.delete()
            return True
        return False

    def update(self, ingreso_boveda):
        ingreso_limpio = {k: v for k, v in ingreso_boveda.items() if k != "_id"}
        ingreso_nosql = IngresoBovedaNOSQL(**ingreso_limpio)
        obj = self.get(ingreso_nosql.ID_Ingreso_boveda)
        if obj:
            para_actualizar = {k: v for k, v in ingreso_nosql.__dict__.items() if
                               not k.startswith('_') and k != "ID_Ingreso_boveda"}

            for attr, value in para_actualizar.items():
                setattr(obj, attr, value)

            obj.save()
            return True
        return False

    def list(self):
        pass

    def list_ID_Usuario(self, id_usuario):
        pass
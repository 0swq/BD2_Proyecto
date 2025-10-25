from bson import ObjectId
from core.entidades.Ingresos_boveda import IngresoBovedaSQL, IngresoBovedaNOSQL
from core.conexiones.mongo import MongoConnection
from core.conexiones.oracle import OracleConnection
from core.conexiones.postgres import PostgreConnection
from core.conexiones.cassandra import CassandraConnection

conexionPostgre = PostgreConnection()
conexionOracle = OracleConnection()
conexionMongo = MongoConnection()
conexionCassandra = CassandraConnection()


class Ingresos_bovedaInterface:
    def create(self, entity): pass
    def get(self, id): pass
    def delete(self, id): pass
    def update(self, entity): pass


class Ingresos_bovedaPostGre(Ingresos_bovedaInterface):
    def create(self, ingreso_boveda_sql: IngresoBovedaSQL):
        with conexionPostgre.get_session() as session:
            session.add(ingreso_boveda_sql)

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

    def update(self, ingreso_boveda_sql: IngresoBovedaSQL):
        with conexionPostgre.get_session() as session:
            obj = session.query(IngresoBovedaSQL).filter_by(ID_Ingreso_boveda=ingreso_boveda_sql.ID_Ingreso_boveda).one_or_none()
            if obj:
                data_to_update = {k: v for k, v in ingreso_boveda_sql.__dict__.items() if
                                  not k.startswith('_') and k != "ID_Ingreso_boveda"}

                for attr, value in data_to_update.items():
                    setattr(obj, attr, value)

                return True
            return False


class Ingresos_bovedaOracle(Ingresos_bovedaInterface):
    def create(self, ingreso_boveda_sql: IngresoBovedaSQL):
        with conexionOracle.get_session() as session:
            session.add(ingreso_boveda_sql)

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

    def update(self, ingreso_boveda_sql: IngresoBovedaSQL):
        with conexionOracle.get_session() as session:
            obj = session.query(IngresoBovedaSQL).filter_by(ID_Ingreso_boveda=ingreso_boveda_sql.ID_Ingreso_boveda).one_or_none()
            if obj:
                data_to_update = {k: v for k, v in ingreso_boveda_sql.__dict__.items() if
                                  not k.startswith('_') and k != "ID_Ingreso_boveda"}

                for attr, value in data_to_update.items():
                    setattr(obj, attr, value)

                return True
            return False


class Ingresos_bovedaMongo(Ingresos_bovedaInterface):
    def create(self, ingreso_boveda_entity):
        db = conexionMongo.get_db()
        return db.ingresos_boveda.insert_one(vars(ingreso_boveda_entity))

    def get(self, id):
        db = conexionMongo.get_db()
        return db.ingresos_boveda.find_one({"_id": ObjectId(id)})

    def delete(self, id):
        db = conexionMongo.get_db()
        result = db.ingresos_boveda.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0

    def update(self, ingreso_boveda_entity):
        db = conexionMongo.get_db()
        update_data = {k: v for k, v in vars(ingreso_boveda_entity).items() if k != "ID_Ingreso_boveda"}
        result = db.ingresos_boveda.update_one(
            {"_id": ObjectId(ingreso_boveda_entity.ID_Ingreso_boveda)},
            {"$set": update_data}
        )
        return result.modified_count > 0


class Ingresos_bovedaCassandra(Ingresos_bovedaInterface):
    def create(self, ingreso_boveda_nosql: IngresoBovedaNOSQL):
        ingreso_boveda_nosql.save()
        return ingreso_boveda_nosql

    def get(self, id):
        return IngresoBovedaNOSQL.objects(ID_Ingreso_boveda=id).first()

    def delete(self, id):
        obj = self.get(id)
        if obj:
            obj.delete()
            return True
        return False

    def update(self, ingreso_boveda_nosql: IngresoBovedaNOSQL):
        obj = self.get(ingreso_boveda_nosql.ID_Ingreso_boveda)
        if obj:
            data_to_update = {k: v for k, v in ingreso_boveda_nosql.__dict__.items() if
                              not k.startswith('_') and k != "ID_Ingreso_boveda"}

            for attr, value in data_to_update.items():
                setattr(obj, attr, value)

            obj.save()
            return True
        return False
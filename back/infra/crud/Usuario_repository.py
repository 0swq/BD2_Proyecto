from bson import ObjectId
from core.entidades.Usuario import UsuarioSQL, UsuarioNOSQL
from core.conexiones.mongo import MongoConnection
from core.conexiones.oracle import OracleConnection
from core.conexiones.postgres import PostgreConnection
from core.conexiones.cassandra import CassandraConnection

conexionPostgre = PostgreConnection()
conexionOracle = OracleConnection()
conexionMongo = MongoConnection()
conexionCassandra = CassandraConnection()


class UsuarioInterface:
    def create(self, entity): pass
    def get(self, id): pass
    def delete(self, id): pass
    def update(self, entity): pass
    def list(self): pass # Añadido list()
    def list_id(self, id): pass # Añadido list_id(id)

class UsuarioPostGre(UsuarioInterface):
    def create(self, usuario_sql: UsuarioSQL):
        with conexionPostgre.get_session() as session:
            session.add(usuario_sql)

    def get(self, id):
        with conexionPostgre.get_session() as session:
            return session.query(UsuarioSQL).filter_by(ID_Usuario=id).one_or_none()

    def delete(self, id):
        with conexionPostgre.get_session() as session:
            obj = session.query(UsuarioSQL).filter_by(ID_Usuario=id).one_or_none()
            if obj:
                session.delete(obj)
                return True
            return False

    def update(self, usuario_sql: UsuarioSQL):
        with conexionPostgre.get_session() as session:
            obj = session.query(UsuarioSQL).filter_by(ID_Usuario=usuario_sql.ID_Usuario).one_or_none()
            if obj:
                data_to_update = {k: v for k, v in usuario_sql.__dict__.items() if
                                  not k.startswith('_') and k != "ID_Usuario"}

                for attr, value in data_to_update.items():
                    setattr(obj, attr, value)

                return True
            return False


class UsuarioOracle(UsuarioInterface):
    def create(self, usuario_sql: UsuarioSQL):
        with conexionOracle.get_session() as session:
            session.add(usuario_sql)

    def get(self, id):
        with conexionOracle.get_session() as session:
            return session.query(UsuarioSQL).filter_by(ID_Usuario=id).one_or_none()

    def delete(self, id):
        with conexionOracle.get_session() as session:
            obj = session.query(UsuarioSQL).filter_by(ID_Usuario=id).one_or_none()
            if obj:
                session.delete(obj)
                return True
            return False

    def update(self, usuario_sql: UsuarioSQL):
        with conexionOracle.get_session() as session:
            obj = session.query(UsuarioSQL).filter_by(ID_Usuario=usuario_sql.ID_Usuario).one_or_none()
            if obj:
                data_to_update = {k: v for k, v in usuario_sql.__dict__.items() if
                                  not k.startswith('_') and k != "ID_Usuario"}

                for attr, value in data_to_update.items():
                    setattr(obj, attr, value)

                return True
            return False


class UsuarioMongo(UsuarioInterface):
    def create(self, usuario_nosql: UsuarioNOSQL):
        db = conexionMongo.get_db()
        return db.usuario.insert_one(vars(usuario_nosql))

    def get(self, id):
        db = conexionMongo.get_db()
        return db.usuario.find_one({"_id": ObjectId(id)})

    def delete(self, id):
        db = conexionMongo.get_db()
        result = db.usuario.delete_one({"_id": ObjectId(id)})
        return result.deleted_count > 0

    def update(self, usuario_nosql: UsuarioNOSQL):
        db = conexionMongo.get_db()
        update_data = {k: v for k, v in vars(usuario_nosql).items() if k != "ID_Usuario"}
        result = db.usuario.update_one(
            {"_id": ObjectId(usuario_nosql.ID_Usuario)},
            {"$set": update_data}
        )
        return result.modified_count > 0

    def list(self):
        db = conexionMongo.get_db()
        usuarios = db.usuario.find()
        return [{**u, "_id": str(u["_id"])} for u in usuarios]

    def list_id(self, id):
        db = conexionMongo.get_db()
        usuario = db.usuario.find_one({"_id": ObjectId(id)})
        if usuario:
            usuario["_id"] = str(usuario["_id"])
        return usuario


class UsuarioCassandra(UsuarioInterface):
    def create(self, usuario_nosql: UsuarioNOSQL):
        usuario_nosql.save()
        return usuario_nosql

    def get(self, id):
        return UsuarioNOSQL.objects(ID_Usuario=id).first()

    def delete(self, id):
        obj = self.get(id)
        if obj:
            obj.delete()
            return True
        return False

    def update(self, usuario_nosql: UsuarioNOSQL):
        obj = self.get(usuario_nosql.ID_Usuario)
        if obj:
            data_to_update = {k: v for k, v in usuario_nosql.__dict__.items() if
                              not k.startswith('_') and k != "ID_Usuario"}

            for attr, value in data_to_update.items():
                setattr(obj, attr, value)

            obj.save()
            return True
        return False
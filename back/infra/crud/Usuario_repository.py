from bson import ObjectId
from core.entidades.Usuario import UsuarioSQL, UsuarioNOSQL, Usuario
from core.conexiones.mongo import MongoConnection
from core.conexiones.oracle import OracleConnection
from core.conexiones.postgres import PostgreConnection
from core.conexiones.cassandra import CassandraConnection
from utils.fst import cop

conexionPostgre = PostgreConnection()
conexionOracle = OracleConnection()
conexionMongo = MongoConnection()
conexionCassandra = CassandraConnection()


class UsuarioInterface:
    def create(self, entity): pass

    def get(self, id): pass

    def delete(self, id): pass

    def update(self, entity): pass

    def list(self): pass

    def list_ID_Usuario(self, id): pass


class UsuarioPostGre(UsuarioInterface):
    def create(self, usuario: Usuario):
        datos = usuario.model_dump(exclude_unset=True)
        usuario = UsuarioSQL(**datos)
        with conexionPostgre.get_session() as session:
            session.add(usuario)

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

    def update(self, usuario):
        usuario_limpio = {k: v for k, v in usuario.items() if k != "_id"}
        usuario_sql = UsuarioSQL(**usuario_limpio)
        with conexionPostgre.get_session() as session:
            obj = session.query(UsuarioSQL).filter_by(ID_Usuario=usuario_sql.ID_Usuario).one_or_none()
            if obj:
                para_actualizar = {k: v for k, v in usuario_sql.__dict__.items() if
                                   not k.startswith('_') and k != "ID_Usuario"}

                for attr, value in para_actualizar.items():
                    setattr(obj, attr, value)

                return True
            return False

    def list(self):
        pass

    def list_ID_Usuario(self, id_usuario):
        pass


class UsuarioOracle(UsuarioInterface):
    def create(self, usuario: Usuario):
        datos = usuario.model_dump(exclude_unset=True)
        usuario = UsuarioSQL(**datos)
        with conexionOracle.get_session() as session:
            session.add(usuario)

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

    def update(self, usuario):
        usuario_limpio = {k: v for k, v in usuario.items() if k != "_id"}
        usuario_sql = UsuarioSQL(**usuario_limpio)
        with conexionOracle.get_session() as session:
            obj = session.query(UsuarioSQL).filter_by(ID_Usuario=usuario_sql.ID_Usuario).one_or_none()
            if obj:
                para_actualizar = {k: v for k, v in usuario_sql.__dict__.items() if
                                   not k.startswith('_') and k != "ID_Usuario"}

                for attr, value in para_actualizar.items():
                    setattr(obj, attr, value)

                return True
            return False

    def list(self):
        pass

    def list_ID_Usuario(self, id_usuario):
        pass


class UsuarioMongo(UsuarioInterface):
    def create(self, usuario: Usuario):
        datos = usuario.model_dump(exclude_unset=True)
        db = conexionMongo.get_db()
        return db.UsuarioNOSQL.insert_one(datos)

    def get(self, id):
        db = conexionMongo.get_db()
        return db.UsuarioNOSQL.find_one({"ID_Usuario": id})

    def delete(self, id):
        db = conexionMongo.get_db()
        result = db.UsuarioNOSQL.delete_one({"ID_Usuario": id})
        return result.deleted_count > 0

    def update(self, usuario):
        db = conexionMongo.get_db()
        actualizado = {k: v for k, v in usuario.items() if k != "ID_Usuario" and k != "_id"}
        result = db.UsuarioNOSQL.update_one(
            {"ID_Usuario": usuario["ID_Usuario"]},
            {"$set": actualizado}
        )
        return result.modified_count > 0

    def list(self):
        db = conexionMongo.get_db()
        usuarios = db.UsuarioNOSQL.find()
        return [{**u, "ID_Usuario": str(u["ID_Usuario"])} for u in usuarios]

    def list_ID_Usuario(self, id_usuario): pass

    def get_cEmail(self, email):
        db = conexionMongo.get_db()
        return db.UsuarioNOSQL.find_one({"email": email}) is not None

    def get_Email(self, email):
        db = conexionMongo.get_db()
        usuario = db.UsuarioNOSQL.find_one({"email": email})
        return usuario


class UsuarioCassandra(UsuarioInterface):
    def create(self, usuario: Usuario):
        datos = usuario.model_dump(exclude_unset=True)
        usuario = UsuarioNOSQL(**datos)
        usuario.save()
        return usuario

    def get(self, id):
        return UsuarioNOSQL.objects(ID_Usuario=id).first()

    def delete(self, id):
        obj = self.get(id)
        if obj:
            obj.delete()
            return True
        return False

    def update(self, usuario):
        usuario_limpio = {k: v for k, v in usuario.items() if k != "_id"}
        usuario_nosql = UsuarioNOSQL(**usuario_limpio)
        obj = self.get(usuario_nosql.ID_Usuario)
        if obj:
            para_actualizar = {k: v for k, v in usuario_nosql.__dict__.items() if
                               not k.startswith('_') and k != "ID_Usuario"}

            for attr, value in para_actualizar.items():
                setattr(obj, attr, value)

            obj.save()
            return True
        return False

    def list(self):
        pass

    def list_ID_Usuario(self, id_usuario):
        pass
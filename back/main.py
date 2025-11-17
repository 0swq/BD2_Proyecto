import os
from cassandra.cqlengine import connection
from cassandra.cqlengine.management import sync_table
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  # 👈 NUEVO
from contextlib import asynccontextmanager
from sqlalchemy.exc import SQLAlchemyError
from starlette.staticfiles import StaticFiles

# --- ENTIDADES ---
from core.entidades import Base
from core.entidades.Datos_biometricos import DatosBiometricosNOSQL
from core.entidades.File import FileNOSQL
from core.entidades.Ingresos_boveda import IngresoBovedaNOSQL
from core.entidades.Log import LogNOSQL
from core.entidades.Usuario import UsuarioNOSQL

# --- CONEXIONES ---
from core.conexiones.cassandra import CassandraConnection
from core.conexiones.oracle import OracleConnection
from core.conexiones.postgres import PostgreConnection

# --- RUTAS ---
from routers import usuarios, auth, boveda, dashboard, file

# Configuración de codificación para entornos de Windows
os.environ['PGCLIENTENCODING'] = 'UTF8'
os.environ['PYTHONIOENCODING'] = 'utf-8'


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializar conexiones
    ora = OracleConnection()
    post = PostgreConnection()

    # --- Crear tablas Oracle ---
    print("🟡 Iniciando conexión y creando tablas en Oracle...")
    try:
        Base.metadata.create_all(ora.instancia.engine)
        print("🟢 Oracle conectado y tablas creadas exitosamente.")
    except SQLAlchemyError as e:
        print(f"🔴 ERROR: Falló la conexión/creación de tablas en Oracle: {e}")

    # --- Crear tablas PostgreSQL ---
    print("🟡 Iniciando conexión y creando tablas en PostgreSQL...")
    try:
        Base.metadata.create_all(post.instancia.engine)
        print("🟢 PostgreSQL conectado y tablas creadas exitosamente.")
    except SQLAlchemyError as e:
        print(f"🔴 ERROR: Falló la conexión/creación de tablas en PostgreSQL: {e}")

    # --- Crear tablas Cassandra ---
    print("🟡 Iniciando conexión y creando tablas en Cassandra...")
    try:
        connection.setup(["127.0.0.1"], "proyecto_final", protocol_version=4)
        sync_table(DatosBiometricosNOSQL)
        sync_table(FileNOSQL)
        sync_table(IngresoBovedaNOSQL)
        sync_table(LogNOSQL)
        sync_table(UsuarioNOSQL)
        print("🟢 Cassandra conectado y tablas sincronizadas exitosamente.")
    except Exception as e:
        print(f"🔴 ERROR: Falló la conexión/sincronización de tablas en Cassandra: {e}")

    print("🚀 Inicio de aplicación completado.")
    yield
    print("✅ Finalizando aplicación.")


app = FastAPI(title="Proyecto Final", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)
app.mount(
    "/fotos-perfil",
    StaticFiles(directory="Recursos/fotos_perfil"),
    name="fotos_perfil"
)

# --- Routers ---
app.include_router(auth.router)
app.include_router(boveda.router)
app.include_router(dashboard.router)
app.include_router(file.router)
app.include_router(usuarios.router)


@app.get("/")
def root():
    return {"message": "Inicio exitoso"}

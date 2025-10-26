from fastapi import FastAPI
from routers import usuarios, auth, boveda, dashboard,archivos
app = FastAPI(title="main")

app.include_router(auth.router)
app.include_router(auth.router)
app.include_router(boveda.router)
app.include_router(dashboard.router)
app.include_router(archivos.router)

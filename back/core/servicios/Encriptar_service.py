from cryptography.hazmat.primitives.ciphers import Cipher, modes, algorithms
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend
import os


def crear_path_final(path):
    nombre_archivo = os.path.basename(path)
    nombre, ext = os.path.splitext(nombre_archivo)
    carpeta_nube = r"Recursos\nube"
    path_final = os.path.join(carpeta_nube, f"{nombre}.ficure")
    return path_final


def crear_path_eliminar(filename):
    nombre, ext = os.path.splitext(filename)
    carpeta_nube = r"Recursos\temp"
    path_final = os.path.join(carpeta_nube, f"{nombre}.{ext}")
    return path_final


def eliminar_archivo(path):
    os.remove(path)


async def encriptar(path: str, contraseña: str, id_file: str):
    path_final = crear_path_final(path)
    salt = os.urandom(16)
    contraseña_bytes = contraseña.encode("utf-8")
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=480000,
        backend=default_backend()
    )
    clave = kdf.derive(contraseña_bytes)

    nonce = os.urandom(12)
    cipher = Cipher(
        algorithms.AES(clave),
        modes.GCM(nonce),
        backend=default_backend()
    )
    encryptor = cipher.encryptor()

    with open(path, 'rb') as f:
        datos_archivo = f.read()

    datos_encriptados = encryptor.update(datos_archivo) + encryptor.finalize()
    etiqueta_autenticacion = encryptor.tag

    id_bytes = id_file.encode('utf-8')
    datos_salida = salt + nonce + etiqueta_autenticacion + id_bytes + datos_encriptados

    with open(path_final, 'wb') as f:
        f.write(datos_salida)

    try:
        os.remove(path)
    except Exception as e:
        raise

    return path_final


async def desencriptar(path: str, contraseña: str, extension: str, id_esperado: str):
    path = os.path.normpath(path)

    if not os.path.exists(path):
        raise FileNotFoundError(f"Archivo no encontrado: {path}")

    nombre_archivo = os.path.basename(path)
    nombre, ext = os.path.splitext(nombre_archivo)

    carpeta_temp = "Recursos/temp"
    os.makedirs(carpeta_temp, exist_ok=True)

    extension = extension.lstrip(".")
    path_final = os.path.join(carpeta_temp, f"{nombre}_descifrado.{extension}")

    with open(path, 'rb') as f:
        datos = f.read()

    salt = datos[:16]
    nonce = datos[16:28]
    tag = datos[28:44]
    id_archivo = datos[44:80].decode('utf-8')
    datos_encriptados = datos[80:]

    if id_archivo != id_esperado:
        raise ValueError("El archivo no corresponde a este registro")

    contraseña_bytes = contraseña.encode("utf-8")

    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=480000,
        backend=default_backend()
    )
    clave = kdf.derive(contraseña_bytes)

    cipher = Cipher(
        algorithms.AES(clave),
        modes.GCM(nonce, tag),
        backend=default_backend()
    )
    decryptor = cipher.decryptor()

    datos_desencriptados = decryptor.update(datos_encriptados) + decryptor.finalize()

    with open(path_final, 'wb') as f:
        f.write(datos_desencriptados)

    return path_final


def hashearContra(contraseña, salt):
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=480000,
        backend=default_backend()
    )
    contraseña_bytes = contraseña.encode("utf-8")
    contraseña_hashehada = kdf.derive(contraseña_bytes)
    return contraseña_hashehada


def evaluarHash(contraseña, hash_actual, salt):
    contraseña_bytes = contraseña.encode("utf-8")

    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=480000,
        backend=default_backend()
    )
    try:
        kdf.verify(contraseña_bytes, hash_actual)
        return True
    except Exception:
        return False
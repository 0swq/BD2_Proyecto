import json

from deepface import DeepFace
import numpy as np


def extraer_vector(imagen):
    embedding = DeepFace.represent(img_path=imagen, model_name="Facenet")[0]["embedding"]
    return embedding


def comparar(vector1,vector2):
    vector1 = np.array(vector1)
    vector2 = np.array(vector2)
    # Calcular
    distancia = np.linalg.norm(vector1 - vector2)
    # porcentaje
    aceptacion = max(0, 100 - distancia * 10)
    return round(aceptacion, 2)


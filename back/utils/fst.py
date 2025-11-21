def cop(origen, afectado):

    if hasattr(origen, "__dict__"):
        origen_dict = vars(origen)
    else:
        origen_dict = dict(origen)

    for k in vars(afectado).keys():  # Recorre solo los atributos reales del objeto destino
        if k in origen_dict:
            setattr(afectado, k, origen_dict[k])
    return afectado

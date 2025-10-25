from reportlab.lib.pagesizes import A2
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from reportlab.lib.units import inch
from typing import List, Tuple
import random
import string

# --- CONFIGURACIÓN ---
NOMBRE_ARCHIVO_PDF = "sopa_terminos_cientificos_A2.pdf"
TAMANO_CUADRICULA = 50

# Lista de palabras
MIS_PALABRAS_PERSONALIZADAS: List[str] = [
    "Electroencefalografista", "Otorrinolaringología", "Paralelepípedo", "Incomprehensibilidad",
    "Desoxirribonucleico", "Hipopotomonstrosesquipedaliofobia", "Inconstitucionalidad", "Transterritorialización",
    "Electrocardiográficamente", "Neumoultramicroscopicosilicovolcanoconiosis", "Desproporcionadamente",
    "Fisiopatológicamente", "Internacionalización", "Antropomorfización", "Transubstanciación",
    "Microelectrónica", "Electroquimioterapia", "Paraplejicofobia", "Autoimmunodeficiencia",
    "Hipercolesterolemia", "Psicofarmacológico", "Criptozoológico",
    "Radiocomunicaciones", "Desoxirribonucleótido", "Magnetoencefalografía", "Constitucionalmente",
    "Interdisciplinariedad", "Hidrogeológicamente", "Fotosintéticamente", "Neuropsicofarmacología",
    "Antropocentrismo", "Psiconeuroinmunología", "Fenomenológicamente", "Electrodomésticamente",
    "Policlorurodevinilo", "Oftalmotorrinolaringólogo", "Transdisciplinariedad", "Desafortunadamente",
    "Superextraordinarísimo", "Microspectrofotometría", "Ininteligibilidad", "Termoeléctricamente",
    "Biocompatibilidad", "Electroterapéuticamente", "Internacionalmente", "Neumonoultramicroscopicosilicovolcánico",
    "Contrarrevolucionario", "Extralimitadamente", "Electroencefalograma", "Sobreestimulación",
    "Microbiológicamente", "Craniocerebral", "Fotolitográficamente",
    "Reestructuración", "Antropomórficamente", "Inintencionadamente", "Psiconeuroinmunológico",
    "Bioluminiscentemente", "Electrocardiograma", "Microdosificación", "Psicopatológicamente",
    "Incomprehensiblemente", "Subterráneamente", "Paraplejiafobia", "Microclimatológicamente",
    "Neuropsicológicamente", "Inconstitucionalmente", "Inmunodeficiencia", "Hidroeléctricamente",
    "Geomagnetismo", "Antropozoonosis", "Fotogramétricamente", "Neuroendocrinológicamente",
    "Polipropileno", "Sobreexplotación", "Psiconeuroendocrinología", "Antihistamínico",
    "Craniotomía", "Radiotelegrafista", "Electroquimioluminiscencia",
    "Desmitologización", "Electroforesis", "Bioelectromagnéticamente", "Policloruro",
    "Intercomunicacional", "Superconductividad", "Psiconeurofarmacología", "Ultramicroscopía",
    "Neuropatológicamente", "Criptobióticamente", "Hipercaloríficamente", "Magnetoencefalográfico",
    "Fotovoltaicamente", "Intrasustantivamente", "Neuroendocrinología", "Radiomicroscopía",
    "Microprocesamiento", "Transubstanciaciones", "Subterráneo", "Neuroinmunológicamente",
    "Contrarreforma", "Extralimitación", "Hiperproliferación", "Involuntariamente",
    "Antiestablecimiento", "Anticlimáticamente", "Fotogrametrista", "Reestructuraciones",
    "Policlorobifenilo", "Incomunicabilidad", "Multidisciplinariamente", "Desoxirribonucleótidos",
    "Antirrevolucionario", "Electroterapéutico", "Microfotografía", "Hiperestimulación",
    "Neuropatología", "Neuropsiquiatría", "Ultramicroscópico", "Sobreindustrialización",
    "Descontextualización", "Fotolitográfico", "Contrarrevolucionariamente", "Bioquímicamente",
    "Hipermetropía", "Psicoterapéuticamente", "Electromagnetismo", "Subestandarización",
    "Psicofisiológicamente", "Biomecánicamente", "Antropozoonóticamente", "Termoquímicamente",
    "Hidrodinámicamente", "Magnetoeléctricamente", "Policromáticamente", "Sobrevaloración",
    "Neuropsiquiátrico", "Inmunohistoquímicamente", "Criptográficamente",
    "Sobreestimulado", "Multidimensionalmente", "Radiocomunicador",
    "Involuntariado", "Antropomórfico", "Termoeléctrico", "Electromecánico",
    "Ultramicroscópicamente", "Subdesarrolladamente", "Fotointerpretación",
    "Neuroendocrinólogo", "Policlorurodevinílico",
    "Electromagnético", "Psicofarmacológicamente",
    "Hipertrofización",
    "Electromecánicamente", "Bioquímico", "Fotovoltaico",
    "Multidisciplinariedad", "Neuropsicofarmacológico", "Contrarrevolucionaria",
    "Bioluminiscente", "Fotogramétrico",
    "Policlorobifenilos", "Subdesarrollado", "Transdisciplinario", "Electromecánica",
    "Sobreindustrializado", "Neuroinmunológico", "Psicoterapéutico", "Termodinámicamente",
    "Contrarrevolucionarios", "Ultramicroscopio", "Anticonstitucionalidad",
    "Craniotomías", "Psiconeuroendocrinológico",
    "Magnetohidrodinámico", "Fotosensibilidad", "Electroencefalográfico",
    "Neurotransmisor", "Paleontología", "Espectrometría", "Radiactividad"
]

# Eliminar duplicados
palabras_unicas = []
seen = set()
for palabra in MIS_PALABRAS_PERSONALIZADAS:
    palabra_upper = palabra.upper()
    if palabra_upper not in seen:
        seen.add(palabra_upper)
        palabras_unicas.append(palabra)

MIS_PALABRAS_PERSONALIZADAS = palabras_unicas
PALABRAS_MAYUSCULAS = [p.upper() for p in MIS_PALABRAS_PERSONALIZADAS]


class GeneradorSopaLetras:
    """Generador de sopa de letras sin dependencias externas"""

    def __init__(self, palabras: List[str], size: int):
        self.palabras = palabras
        self.size = size
        self.grid = [[' ' for _ in range(size)] for _ in range(size)]
        self.direcciones = [
            (0, 1),  # horizontal derecha
            (1, 0),  # vertical abajo
            (1, 1),  # diagonal abajo-derecha
            (0, -1),  # horizontal izquierda
            (-1, 0),  # vertical arriba
            (-1, -1),  # diagonal arriba-izquierda
            (1, -1),  # diagonal abajo-izquierda
            (-1, 1)  # diagonal arriba-derecha
        ]

    def puede_colocar_palabra(self, palabra: str, fila: int, col: int, dir_fila: int, dir_col: int) -> bool:
        """Verifica si una palabra puede colocarse"""
        for i, letra in enumerate(palabra):
            nueva_fila = fila + i * dir_fila
            nueva_col = col + i * dir_col

            if nueva_fila < 0 or nueva_fila >= self.size or nueva_col < 0 or nueva_col >= self.size:
                return False

            celda_actual = self.grid[nueva_fila][nueva_col]
            if celda_actual != ' ' and celda_actual != letra:
                return False

        return True

    def colocar_palabra(self, palabra: str, fila: int, col: int, dir_fila: int, dir_col: int):
        """Coloca una palabra en la cuadrícula"""
        for i, letra in enumerate(palabra):
            nueva_fila = fila + i * dir_fila
            nueva_col = col + i * dir_col
            self.grid[nueva_fila][nueva_col] = letra

    def intentar_colocar_palabra(self, palabra: str, max_intentos: int = 200) -> bool:
        """Intenta colocar una palabra"""
        for _ in range(max_intentos):
            fila = random.randint(0, self.size - 1)
            col = random.randint(0, self.size - 1)
            dir_fila, dir_col = random.choice(self.direcciones)

            if self.puede_colocar_palabra(palabra, fila, col, dir_fila, dir_col):
                self.colocar_palabra(palabra, fila, col, dir_fila, dir_col)
                return True

        return False

    def generar(self) -> List[List[str]]:
        """Genera la sopa de letras"""
        palabras_colocadas = 0
        palabras_no_colocadas = []

        # Ordenar por longitud (más largas primero)
        palabras_ordenadas = sorted(self.palabras, key=len, reverse=True)

        print("\nColocando palabras...")
        for i, palabra in enumerate(palabras_ordenadas, 1):
            if self.intentar_colocar_palabra(palabra):
                palabras_colocadas += 1
                print(f"  [{i}/{len(self.palabras)}] ✓ {palabra}")
            else:
                palabras_no_colocadas.append(palabra)
                print(f"  [{i}/{len(self.palabras)}] ✗ {palabra}")

        # Rellenar espacios vacíos
        for i in range(self.size):
            for j in range(self.size):
                if self.grid[i][j] == ' ':
                    self.grid[i][j] = random.choice(string.ascii_uppercase)

        print(f"\n✅ Palabras colocadas: {palabras_colocadas}/{len(self.palabras)}")
        if palabras_no_colocadas:
            print(f"⚠️  No colocadas: {len(palabras_no_colocadas)}")

        return self.grid


def generar_sopa_y_pdf(palabras: List[str]):
    """Crea la sopa de letras y genera el PDF"""

    if not palabras:
        print("Error: Lista vacía")
        return

    longitud_max = max(len(p) for p in palabras)
    print(f"\n{'=' * 60}")
    print(f"GENERADOR DE SOPA DE LETRAS")
    print(f"{'=' * 60}")
    print(f"Palabras: {len(palabras)}")
    print(f"Palabra más larga: {longitud_max} caracteres")
    print(f"Cuadrícula: {TAMANO_CUADRICULA}x{TAMANO_CUADRICULA}")

    # Generar sopa
    generador = GeneradorSopaLetras(palabras, TAMANO_CUADRICULA)
    cuadricula = generador.generar()

    # Crear PDF
    print(f"\n{'=' * 60}")
    print("GENERANDO PDF...")
    print(f"{'=' * 60}")

    doc = SimpleDocTemplate(NOMBRE_ARCHIVO_PDF, pagesize=A2)
    styles = getSampleStyleSheet()
    story = []

    # Título
    titulo = Paragraph(
        f"Sopa de Términos Científicos ({TAMANO_CUADRICULA}x{TAMANO_CUADRICULA})",
        styles['Title']
    )
    story.append(titulo)
    story.append(Spacer(1, 0.5 * inch))

    # Cuadrícula
    datos_cuadricula = [list(fila) for fila in cuadricula]

    estilo_tabla = [
        ('GRID', (0, 0), (-1, -1), 0.25, colors.black),
        ('FONTSIZE', (0, 0), (-1, -1), 3),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]

    ancho_pagina = doc.pagesize[0] - doc.leftMargin - doc.rightMargin
    ancho_celda = ancho_pagina / TAMANO_CUADRICULA

    tabla_sopa = Table(datos_cuadricula, colWidths=ancho_celda)
    tabla_sopa.setStyle(TableStyle(estilo_tabla))

    story.append(Paragraph("La Sopa de Letras:", styles['h2']))
    story.append(Spacer(1, 0.1 * inch))
    story.append(tabla_sopa)
    story.append(Spacer(1, 0.5 * inch))

    # Lista de palabras
    story.append(Paragraph(f"Palabras a Encontrar ({len(palabras)} términos):", styles['h2']))
    story.append(Spacer(1, 0.1 * inch))

    num_columnas = 4
    palabras_en_columnas = [[] for _ in range(num_columnas)]

    for i, palabra in enumerate(MIS_PALABRAS_PERSONALIZADAS):
        palabras_en_columnas[i % num_columnas].append(Paragraph(palabra, styles['Normal']))

    max_filas = max(len(col) for col in palabras_en_columnas)
    for col in palabras_en_columnas:
        while len(col) < max_filas:
            col.append(Paragraph("", styles['Normal']))

    tabla_palabras_datos = list(zip(*palabras_en_columnas))
    tabla_palabras = Table(tabla_palabras_datos, colWidths=[ancho_pagina / num_columnas] * num_columnas)
    tabla_palabras.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
    ]))

    story.append(tabla_palabras)

    # Generar
    print(f"Guardando: {NOMBRE_ARCHIVO_PDF}")
    doc.build(story)
    print(f"\n{'=' * 60}")
    print("✅ ¡PDF GENERADO EXITOSAMENTE!")
    print(f"{'=' * 60}\n")


if __name__ == "__main__":
    generar_sopa_y_pdf(PALABRAS_MAYUSCULAS)
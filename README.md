# Intercambios Frontend

Aplicación web para la **Lista de Intercambios de Alimentos** y la **Calculadora de Requerimientos Energéticos**. Desarrollada en HTML, CSS y JavaScript puro (Vanilla JS), sin frameworks de JavaScript ni proceso de compilación.

---

## Tabla de contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Cómo usar](#cómo-usar)
- [Conexión con la API](#conexión-con-la-api)
- [Endpoints esperados](#endpoints-esperados)
- [Historial](#historial)
- [Calculadora](#calculadora)
- [Tecnologías y dependencias](#tecnologías-y-dependencias)
- [Decisiones técnicas](#decisiones-técnicas)

---

## Descripción

El proyecto consta de dos páginas:

| Página | Archivo | Descripción |
|--------|---------|-------------|
| Lista de intercambios | `page/index.html` | Navega por grupos → subgrupos → alimentos y consulta sus intercambios equivalentes con datos nutricionales |
| Calculadora TMB/GET | `page/calculadora.html` | Calcula la Tasa Metabólica Basal y el Gasto Energético Total usando la fórmula de Harris-Benedict |

Ambas páginas guardan un **historial persistente** de consultas en `localStorage`.

---

## Características

- Navegación por pasos: grupo → subgrupo → alimento → intercambios
- Tarjetas nutricionales por alimento (proteína, grasa, CHO, calcio, hierro, vitamina C)
- Historial de las últimas 15 consultas/cálculos, persistente entre sesiones
- Botón para limpiar el historial
- Animaciones de entrada escalonadas (stagger) en todas las tarjetas
- Contador animado para los resultados de la calculadora
- Spinner de carga CSS puro
- Sanitización de HTML para prevenir XSS
- Cancelación de peticiones en vuelo (tokens de request) para evitar condiciones de carrera
- Diseño responsivo

---

## Estructura del proyecto

```
intercambios-frontend/
│
├── page/
│   ├── index.html          # Lista de intercambios de alimentos
│   └── calculadora.html    # Calculadora TMB y GET
│
├── css/
│   ├── styles.css          # Estilos de la página de intercambios
│   └── styles2.css         # Estilos de la calculadora
│
├── js/
│   ├── historial.js        # Módulo compartido de historial (localStorage)
│   ├── app.js              # Lógica de la lista de intercambios
│   └── script.js           # Lógica de la calculadora
│
└── README.md
```

---

## Cómo usar

### Opción 1 — Abrir directamente en el navegador

Abre cualquiera de los archivos HTML haciendo doble clic desde el explorador de archivos. Las rutas son **relativas**, por lo que no se necesita servidor web para ver la interfaz.

> **Nota:** La carga de datos desde la API requiere que el backend esté corriendo (ver [Conexión con la API](#conexión-con-la-api)). Sin backend, la interfaz carga pero muestra un mensaje de error al intentar obtener grupos de alimentos.

### Opción 2 — Servidor local (recomendado para desarrollo)

```bash
# Con Python
python3 -m http.server 3000

# Con Node.js (npx)
npx serve .
```

Luego abre `http://localhost:3000/page/index.html`.

---

## Conexión con la API

La URL base de la API se configura en la primera línea de `js/app.js`:

```js
const API = 'http://localhost:8080/api';
```

Cambia este valor para apuntar al backend que corresponda. La aplicación usa `fetch` con `async/await` para todas las peticiones.

---

## Endpoints esperados

La aplicación consume los siguientes endpoints REST (todos devuelven JSON):

### Grupos de alimentos
```
GET /api/grupos
```
Respuesta esperada:
```json
[
  { "id": 1, "nombre": "Cereales" },
  { "id": 2, "nombre": "Leguminosas" }
]
```

### Subgrupos por grupo
```
GET /api/subgrupos/por-grupo/{grupoId}
```
Respuesta esperada:
```json
[
  { "id": 10, "nombre": "Cereales simples", "kcalPromedio": 120 }
]
```

### Alimentos por subgrupo
```
GET /api/alimentos/por-subgrupo/{subgrupoId}
```
Respuesta esperada:
```json
[
  {
    "id": 100,
    "nombre": "Arroz cocido",
    "porcionGramos": 100,
    "descripcionMedida": "1/2 taza"
  }
]
```

### Intercambios de un alimento
```
GET /api/alimentos/{alimentoId}/intercambios
```
Devuelve una lista de alimentos con la misma estructura que el endpoint anterior.

### Nutrientes de un alimento
```
GET /api/nutrientes/alimento/{alimentoId}
```
Respuesta esperada:
```json
{
  "kcal": 130,
  "proteinaG": 2.7,
  "grasaTotalG": 0.3,
  "choG": 28.2,
  "calcioMg": 10,
  "hierroMg": 0.2,
  "vitaminaCMg": 0
}
```

---

## Historial

El módulo `js/historial.js` gestiona el historial de ambas páginas. Usa `localStorage` del navegador, por lo que los datos persisten entre sesiones.

### Claves de almacenamiento

| Clave | Página | Contenido |
|-------|--------|-----------|
| `intercambios_historial` | Lista de intercambios | Alimento consultado + número de intercambios |
| `calculadora_historial` | Calculadora | Inputs del formulario + resultados TMB/GET |

### Límite

Máximo **15 entradas** por historial. Las consultas más recientes aparecen primero.

### API del módulo

```js
Historial.obtener(key)        // Devuelve el array del historial
Historial.guardar(key, datos) // Agrega una entrada al inicio
Historial.limpiar(key)        // Elimina el historial de esa clave
Historial.formatearFecha(iso) // Formatea una fecha ISO a es-MX corto
```

### Cuándo se guarda

- **Intercambios:** al seleccionar un alimento y recibir respuesta exitosa de la API.
- **Calculadora:** al enviar el formulario y obtener un resultado.

---

## Calculadora

Implementa la fórmula de **Harris-Benedict** para calcular:

- **TMB** (Tasa Metabólica Basal): calorías que el cuerpo consume en reposo.
- **GET** (Gasto Energético Total): TMB multiplicada por el factor de actividad física.

### Fórmulas utilizadas

| Sexo | Fórmula TMB |
|------|------------|
| Hombre | `66.4 + (13.7 × peso) + (5.0 × altura) − (6.8 × edad)` |
| Mujer  | `655.1 + (9.563 × peso) + (1.85 × altura) − (4.676 × edad)` |
| Niño   | `88.362 + (13.397 × peso) + (4.799 × altura) − (5.677 × edad)` |
| Niña   | `655.1 + (9.563 × peso) + (1.85 × altura) − (4.676 × edad)` |

### Factores de actividad

| Factor | Descripción |
|--------|-------------|
| 1.2    | Sedentario (poco o ningún ejercicio) |
| 1.375  | Actividad leve (1-3 días/semana) |
| 1.55   | Actividad moderada (3-5 días/semana) |
| 1.725  | Actividad intensa (6-7 días/semana) |
| 1.9    | Actividad muy intensa (2 veces al día) |

---

## Tecnologías y dependencias

Todas las dependencias se cargan vía **CDN** (no requieren instalación):

| Recurso | Versión | Uso |
|---------|---------|-----|
| [Google Fonts — Poppins](https://fonts.google.com/specimen/Poppins) | — | Tipografía principal |
| [Font Awesome](https://fontawesome.com/) | 6.5.1 | Iconos en navegación, labels y botones |

No hay `package.json`, `node_modules` ni proceso de build.

---

## Decisiones técnicas

### Tokens de request (cancelación de peticiones en vuelo)
`app.js` usa contadores (`subgruposToken`, `alimentosToken`, `intercambiosToken`) para ignorar respuestas HTTP que lleguen tarde cuando el usuario ya hizo una nueva selección. Esto evita que se pinte contenido desactualizado.

```js
requestState.subgruposToken += 1;
const token = requestState.subgruposToken;
// ... await fetch ...
if (token !== requestState.subgruposToken) return; // petición cancelada
```

### Sanitización XSS
Todos los datos que llegan de la API o del localStorage se pasan por la función `sanitize()` antes de insertarse en el DOM con `innerHTML`, reemplazando los caracteres `& < > ' "` por sus entidades HTML.

### Rutas relativas
Los archivos HTML usan rutas relativas (`../css/`, `../js/`, `./pagina.html`) para que funcionen tanto abiertos directamente con `file://` como servidos por un servidor web.

### localStorage como persistencia del historial
Se eligió `localStorage` porque no requiere backend adicional. Cuando se conecte una API de usuarios en el futuro, el módulo `historial.js` puede reemplazarse para hacer `fetch` en lugar de leer/escribir localStorage sin cambiar el resto del código.

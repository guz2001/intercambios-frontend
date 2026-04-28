# CHANGELOG — Intercambios Frontend

Registro completo de todos los cambios realizados al proyecto, con fechas, archivos modificados y descripción detallada de cada modificación.

---

## Historial de sesiones de desarrollo

---

## [Sesión 2] — 2026-04-27

Sesión completa de refactorización, diseño e integración del historial.

---

### 2026-04-27 21:15 · Commit `a34ad3c`
**Rediseño UI + historial persistente + framework Poppins y Font Awesome**

#### Archivos nuevos

| Archivo | Descripción |
|---------|-------------|
| `js/historial.js` | Módulo compartido para gestión del historial en `localStorage` |

#### `js/historial.js` — NUEVO
Módulo con el objeto `Historial` que expone cuatro métodos:

```
Historial.obtener(key)        → lee el array del localStorage
Historial.guardar(key, datos) → inserta al inicio, máximo 15 entradas
Historial.limpiar(key)        → elimina la clave del localStorage
Historial.formatearFecha(iso) → convierte ISO 8601 a formato es-MX corto
```

- Clave `intercambios_historial` para la página de lista de alimentos.
- Clave `calculadora_historial` para la calculadora.
- Límite configurable: constante `HISTORIAL_MAX = 15`.

---

#### `js/app.js` — MODIFICADO

| Línea aprox. | Cambio |
|---|---|
| 2 | Nueva constante `HISTORIAL_KEY = 'intercambios_historial'` |
| 13–14 | Nuevas entradas en objeto `UI`: `historialContainer` y `btnLimpiarHistorial` |
| 95–103 | `renderGrupos`: forEach recibe `index`, agrega `animationDelay` escalonado (0.05 s por ítem) |
| 112–120 | `renderSubgrupos`: ídem con delay de 0.04 s |
| 129–139 | `renderAlimentos`: ídem con delay de 0.04 s |
| 193–204 | `renderIntercambios`: ídem con delay de 0.06 s |
| 284–299 | `seleccionarAlimento`: después de renderizar, llama `Historial.guardar()` y `renderHistorialIntercambios()` |
| 306–326 | **Nueva función** `renderHistorialIntercambios()`: lee localStorage y pinta las tarjetas del historial con sanitización XSS |
| 328–335 | `DOMContentLoaded` expandido: inicializa historial y registra listener del botón limpiar |

**Antes** (listener original):
```js
document.addEventListener('DOMContentLoaded', cargarGrupos);
```
**Después**:
```js
document.addEventListener('DOMContentLoaded', () => {
    cargarGrupos();
    renderHistorialIntercambios();
    UI.btnLimpiarHistorial.addEventListener('click', () => {
        Historial.limpiar(HISTORIAL_KEY);
        renderHistorialIntercambios();
    });
});
```

---

#### `js/script.js` — MODIFICADO

| Línea aprox. | Cambio |
|---|---|
| 1 | Nueva constante `HISTORIAL_KEY_CALC = 'calculadora_historial'` |
| 3–12 | **Nueva función** `animarContador(elemento, valorFinal, duracion)`: anima el número de 0 al valor final usando `requestAnimationFrame` con ease-out cúbico |
| 14–20 | Nuevo objeto `ACTIVIDAD_LABELS`: mapea los factores numéricos a texto legible |
| 22–24 | Nueva función `sanitizeCalc()`: sanitización XSS para el historial de la calculadora |
| 26–53 | **Nueva función** `renderHistorialCalculadora()`: lee localStorage y renderiza cada cálculo guardado |
| 55–88 | Form submit refactorizado: extrae variables, calcula, muestra resultado, **llama `animarContador`** en vez de setear texto directo, guarda en historial |
| 90–96 | Nuevo bloque `DOMContentLoaded`: inicializa historial y registra botón limpiar |

**Animación del contador** (fragmento clave):
```js
const animarContador = (elemento, valorFinal, duracion = 900) => {
    const inicio = performance.now();
    const animar = (ahora) => {
        const progreso = Math.min((ahora - inicio) / duracion, 1);
        const eased = 1 - Math.pow(1 - progreso, 3); // ease-out cúbico
        elemento.textContent = Math.round(eased * valorFinal);
        if (progreso < 1) requestAnimationFrame(animar);
    };
    requestAnimationFrame(animar);
};
```

---

#### `css/styles.css` — REESCRITO COMPLETAMENTE

Diseño anterior: básico, sin animaciones, colores planos.

Cambios principales:

| Elemento | Cambio |
|---|---|
| `:root` | Nuevas variables: `--shadow-md`, `--shadow-lg`, `--color-accent`, `--radius-lg`, `--transition` |
| `body` | Fuente cambiada a `Poppins` |
| `header` | Gradiente animado (`floatGlow`), efecto de luz radial flotante con `::before` y `::after` |
| `#navegacion1` | Borde semitransparente, `display: inline-flex`, hover con `translateY(-2px)` |
| `.card h2` | Barra vertical izquierda degradada, soporte para icono Font Awesome |
| `.grupo-btn` | Hover con gradiente, efecto `pulseRing` en estado activo (animación de anillo) |
| `.subgrupo-btn` | Hover con `translateX(6px)` en lugar de solo color |
| `.alimento-card` | Línea inferior degradada que se expande con `scaleX` al hover; estado activo con `scale(1.02)` |
| `.intercambio-card` | Línea superior degradada fija |
| `.nutriente` | Hover con `scale(1.07)` |
| `.loading` | Spinner CSS puro con `::before` + `@keyframes spin`, layout en columna |
| `section.visible` | Agrega `animation: fadeInUp` al aparecer |
| Historial | Nuevas clases: `.historial-header`, `.btn-limpiar`, `.historial-grid`, `.historial-item`, `.historial-fecha`, `.historial-nombre`, `.historial-detalle`, `.historial-badge` |
| Animaciones nuevas | `@keyframes fadeInUp`, `@keyframes fadeIn`, `@keyframes pulseRing`, `@keyframes spin` |

---

#### `css/styles2.css` — REESCRITO COMPLETAMENTE

Diseño anterior: gradiente estático, sin animaciones, tipografía Arial.

Cambios principales:

| Elemento | Cambio |
|---|---|
| `body` | Gradiente de 3 colores animado continuo (`gradientShift` en 12 s), fuente Poppins |
| `header` | Glassmorphism: `background: rgba(255,255,255,0.14)`, `backdrop-filter: blur(14px)`, bordes semitransparentes |
| `.container` | Glassmorphism reforzado; barra superior con gradiente animado 4 colores en 4 s; `animation: fadeInUp` al cargar |
| `input`, `select` | Focus con `box-shadow` morado, `transform: translateY(-1px)`, borde `#7c3aed` |
| `.radio-label` | Selector moderno `:has(input:checked)` para highlight del label activo |
| `button[type="submit"]` | Gradiente con hover invertido, `box-shadow` de 28px al pasar el cursor |
| `.result` | Barra superior degradada; `.result-value` con texto degradado (`-webkit-background-clip: text`); animación `popIn` al aparecer |
| Historial | Nuevas clases: `.hist-calculadora`, `.hist-header`, `.btn-limpiar`, `.hist-item`, `.hist-fecha`, `.hist-info`, `.hist-resultados`, `.hist-badge`, `.hist-empty` |
| Animaciones nuevas | `@keyframes gradientShift`, `@keyframes fadeInUp`, `@keyframes popIn`, `@keyframes spin` |

---

#### `page/index.html` — MODIFICADO

| Cambio | Ubicación en el archivo |
|---|---|
| Agrega `<link>` Google Fonts Poppins (preconnect + stylesheet) | `<head>` |
| Agrega `<link>` Font Awesome 6.5.1 CDN | `<head>` |
| Iconos en enlaces de navegación (`fa-utensils`, `fa-calculator`) | `<nav>` |
| Iconos en `<h2>` de cada paso (`fa-layer-group`, `fa-list-ul`, `fa-apple-whole`, `fa-right-left`) | `<main>` |
| Nueva sección `#seccion-historial` con grid, botón limpiar e ícono `fa-clock-rotate-left` | Final de `<main>` |
| Scripts cambiados a `../js/historial.js` y `../js/app.js` | Final de `<body>` |

---

#### `page/calculadora.html` — MODIFICADO

| Cambio | Ubicación en el archivo |
|---|---|
| Agrega `<link>` Google Fonts Poppins (preconnect + stylesheet) | `<head>` |
| Agrega `<link>` Font Awesome 6.5.1 CDN | `<head>` |
| Iconos en enlaces de navegación | `<nav>` |
| Iconos en labels del formulario (`fa-calendar-days`, `fa-weight-scale`, `fa-ruler-vertical`, `fa-person-running`) | `<form>` |
| Texto del botón submit actualizado con ícono `fa-fire-flame-curved` | `<form>` |
| Íconos en labels de resultado (`fa-fire-alt`, `fa-bolt`, `fa-circle-info`) | `#resultado` |
| Nueva sección `.hist-calculadora` con ícono `fa-clock-rotate-left` y botón limpiar | Después de `#resultado` |
| Scripts cambiados a `../js/historial.js` y `../js/script.js` | Final de `<body>` |

---

### 2026-04-27 21:19 · Commit `79b8d45`
**Fix: rutas relativas para abrir sin servidor web**

**Problema:** Al abrir los HTML directamente en el navegador con `file://`, las rutas absolutas como `/css/styles.css` fallaban con `ERR_FILE_NOT_FOUND` porque el navegador no tiene raíz de servidor.

**Solución:** Cambiar todas las rutas absolutas a relativas.

#### `page/index.html` — MODIFICADO

| Ruta anterior | Ruta nueva |
|---|---|
| `/css/styles.css` | `../css/styles.css` |
| `/page/index.html` | `./index.html` |
| `/page/calculadora.html` | `./calculadora.html` |
| `/js/historial.js` | `../js/historial.js` |
| `/js/app.js` | `../js/app.js` |

#### `page/calculadora.html` — MODIFICADO

| Ruta anterior | Ruta nueva |
|---|---|
| `/css/styles2.css` | `../css/styles2.css` |
| `/page/index.html` | `./index.html` |
| `/page/calculadora.html` | `./calculadora.html` |
| `/js/historial.js` | `../js/historial.js` |
| `/js/script.js` | `../js/script.js` |

---

### 2026-04-27 21:29 · Commit `9db187a`
**Docs: README completo**

#### `README.md` — REESCRITO

Reemplazó el placeholder de 4 líneas con documentación completa (266 líneas):

- Descripción del proyecto y tabla de páginas
- Lista de características técnicas
- Árbol de estructura de archivos
- Instrucciones para abrir sin servidor y con servidor local
- Dónde cambiar la URL base de la API
- Tabla de todos los endpoints REST esperados con ejemplos de JSON
- Documentación del módulo `Historial` (API, claves, límites, cuándo guarda)
- Fórmulas Harris-Benedict por sexo y tabla de factores de actividad
- Tabla de tecnologías y dependencias CDN
- Sección de decisiones técnicas: tokens de request, sanitización XSS, rutas relativas, localStorage

---

## [Sesión 1] — 2026-03-23 / 2026-03-24

Desarrollo inicial del proyecto por el equipo.

| Fecha | Commit | Descripción |
|---|---|---|
| 2026-03-18 | `e8a593c` | first commit — estructura inicial del proyecto |
| 2026-03-23 22:42 | `f3f75a1` | Cambios en frontend: navegación con `<nav>` |
| 2026-03-23 22:50 | `9c321c2` | Mejora de menú, quitar punto en `<li>` |
| 2026-03-23 22:54 | `5b26e02` | Mejoras adicionales al menú |
| 2026-03-23 22:54 | `7c7fc1f` | Creación de calculadora de requerimientos energéticos |
| 2026-03-23 22:57 | `a82bbd9` | Creación de calculadora (continuación) |
| 2026-03-23 22:59 | `7b8e5db` | Ordenar archivos por módulos: carpetas `css/`, `page/`, `js/` |
| 2026-03-23 23:04 | `42b4c9c` | Reorganización de módulos (continuación) |
| 2026-03-23 23:25 | `e9fa34e` | Reorganización final de módulos |
| 2026-03-23 23:28 | `183e401` | Mejora de los cálculos de Harris-Benedict |
| 2026-03-23 23:37 | `595817c` | Corrección en el envío de datos de la calculadora |
| 2026-03-23 23:40 | `071296a` | Agrega soporte para niño y niña en la calculadora |
| 2026-03-23 23:41 | `01f0ac9` | Agrega soporte para niño y niña (continuación) |
| 2026-03-23 23:48 | `f174fd7` | Calculadora: menú de regreso entre páginas |
| 2026-03-23 23:54 | `93df663` | Calculadora: menú de regreso (continuación) |
| 2026-03-23 23:55–00:02 | `d31cbd7`–`7915177` | Mejoras visuales de botones de la calculadora (10 commits) |

---

## Resumen de archivos por sesión

### Sesión 2 (2026-04-27) — archivos tocados

| Archivo | Tipo de cambio | Commits |
|---|---|---|
| `js/historial.js` | **Creado** | `a34ad3c` |
| `js/app.js` | Modificado — historial + stagger | `a34ad3c` |
| `js/script.js` | Modificado — historial + contador animado | `a34ad3c` |
| `css/styles.css` | Reescrito — rediseño completo | `a34ad3c` |
| `css/styles2.css` | Reescrito — rediseño completo | `a34ad3c` |
| `page/index.html` | Modificado — CDN + iconos + historial | `a34ad3c`, `79b8d45` |
| `page/calculadora.html` | Modificado — CDN + iconos + historial | `a34ad3c`, `79b8d45` |
| `README.md` | Reescrito — documentación completa | `9db187a` |

---

## Dependencias externas añadidas en Sesión 2

| Recurso | URL CDN | Versión | Usado en |
|---|---|---|---|
| Google Fonts — Poppins | `fonts.googleapis.com` | — | Ambas páginas |
| Font Awesome | `cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css` | 6.5.1 | Ambas páginas |

> Ambas dependencias se cargan vía `<link>` en el `<head>` de cada HTML. No requieren instalación ni proceso de build.

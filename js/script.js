const API_URL        = 'http://localhost:8080/api';
const HISTORIAL_KEY_CALC = 'calculadora_historial';

// Mapeo form → enum Sexo de la API (MASCULINO / FEMENINO)
const SEXO_API = {
    hombre: 'MASCULINO',
    niño:   'MASCULINO',
    mujer:  'FEMENINO',
    niña:   'FEMENINO'
};

const animarContador = (elemento, valorFinal, duracion = 900) => {
    const inicio = performance.now();
    const animar = (ahora) => {
        const progreso = Math.min((ahora - inicio) / duracion, 1);
        const eased = 1 - Math.pow(1 - progreso, 3);
        elemento.textContent = Math.round(eased * valorFinal);
        if (progreso < 1) requestAnimationFrame(animar);
    };
    requestAnimationFrame(animar);
};

const ACTIVIDAD_LABELS = {
    '1.2':   'Sedentario',
    '1.375': 'Actividad leve',
    '1.55':  'Actividad moderada',
    '1.725': 'Actividad intensa',
    '1.9':   'Actividad muy intensa'
};

const sanitizeCalc = (value) => String(value ?? '').replace(/[&<>'"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]
));

const mostrarErrorCalc = (msg) => {
    const el = document.getElementById('calc-error');
    el.textContent = msg;
    el.classList.add('show');
};

const ocultarErrorCalc = () => {
    document.getElementById('calc-error').classList.remove('show');
};

const renderHistorialCalculadora = () => {
    const contenedor = document.getElementById('historial-calc-container');
    const lista = Historial.obtener(HISTORIAL_KEY_CALC);
    if (lista.length === 0) {
        contenedor.innerHTML = '<div class="hist-empty">No hay cálculos recientes.</div>';
        return;
    }
    const fragment = document.createDocumentFragment();
    lista.forEach(({ inputs, resultados, fecha }) => {
        const actividadLabel = ACTIVIDAD_LABELS[String(inputs.actividad)] ?? String(inputs.actividad);
        const item = document.createElement('div');
        item.className = 'hist-item';
        item.innerHTML = `
            <div class="hist-fecha"><i class="fas fa-clock"></i> ${sanitizeCalc(Historial.formatearFecha(fecha))}</div>
            <div class="hist-info">
                ${sanitizeCalc(inputs.sexo)} · ${sanitizeCalc(String(inputs.edad))} años · ${sanitizeCalc(String(inputs.peso))} kg · ${sanitizeCalc(String(inputs.altura))} cm
            </div>
            <div class="hist-info">${sanitizeCalc(actividadLabel)}</div>
            <div class="hist-resultados">
                <span class="hist-badge">TMB: ${sanitizeCalc(String(resultados.tmb))} kcal</span>
                <span class="hist-badge">GET: ${sanitizeCalc(String(resultados.get))} kcal</span>
            </div>
        `;
        fragment.appendChild(item);
    });
    contenedor.innerHTML = '';
    contenedor.appendChild(fragment);
};

document.getElementById('calculadoraForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    ocultarErrorCalc();

    const sexo      = document.querySelector('input[name="sexo"]:checked').value;
    const edad      = parseInt(document.getElementById('edad').value, 10);
    const peso      = parseFloat(document.getElementById('peso').value);
    const altura    = parseFloat(document.getElementById('altura').value);
    const actividad = parseFloat(document.getElementById('actividad').value);

    const btn = this.querySelector('button[type="submit"]');
    const htmlOriginal = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculando...';

    try {
        const response = await fetch(`${API_URL}/requerimientos/calcular`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                peso,
                altura,
                edad,
                sexo: SEXO_API[sexo] ?? 'MASCULINO',
                factorActividad: actividad
            })
        });

        if (!response.ok) {
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const datos = await response.json();
        const tmbRedondeado = Math.round(datos.tmb);
        const getRedondeado = Math.round(datos.get);

        document.getElementById('resultado').classList.add('show');
        animarContador(document.getElementById('tmb'), tmbRedondeado);
        animarContador(document.getElementById('get'), getRedondeado, 1100);

        Historial.guardar(HISTORIAL_KEY_CALC, {
            inputs: { sexo, edad, peso, altura, actividad },
            resultados: { tmb: tmbRedondeado, get: getRedondeado }
        });
        renderHistorialCalculadora();

    } catch (err) {
        mostrarErrorCalc(
            'No se pudo conectar con la API. ' +
            'Verifica que el servidor esté corriendo en localhost:8080 ' +
            'y que el frontend esté servido desde http://localhost:4200.'
        );
    } finally {
        btn.disabled = false;
        btn.innerHTML = htmlOriginal;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    renderHistorialCalculadora();
    document.getElementById('btn-limpiar-calc').addEventListener('click', () => {
        Historial.limpiar(HISTORIAL_KEY_CALC);
        renderHistorialCalculadora();
    });
});
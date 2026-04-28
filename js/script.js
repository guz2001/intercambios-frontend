const HISTORIAL_KEY_CALC = 'calculadora_historial';

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
    '1.2': 'Sedentario',
    '1.375': 'Actividad leve',
    '1.55': 'Actividad moderada',
    '1.725': 'Actividad intensa',
    '1.9': 'Actividad muy intensa'
};

const sanitizeCalc = (value) => String(value ?? '').replace(/[&<>'"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]
));

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

document.getElementById('calculadoraForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const sexo = document.querySelector('input[name="sexo"]:checked').value;
    const edad = parseFloat(document.getElementById('edad').value);
    const peso = parseFloat(document.getElementById('peso').value);
    const altura = parseFloat(document.getElementById('altura').value);
    const actividad = parseFloat(document.getElementById('actividad').value);

    let tmb;
    if (sexo === 'hombre') {
        tmb = 66.4 + (13.700 * peso) + (5.000 * altura) - (6.800 * edad);
    } else if (sexo === 'mujer') {
        tmb = 655.1 + (9.563 * peso) + (1.850 * altura) - (4.676 * edad);
    } else if (sexo === 'niño') {
        tmb = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * edad);
    } else if (sexo === 'niña') {
        tmb = 655.1 + (9.563 * peso) + (1.850 * altura) - (4.676 * edad);
    }

    const get = tmb * actividad;
    const tmbRedondeado = Math.round(tmb);
    const getRedondeado = Math.round(get);

    document.getElementById('resultado').classList.add('show');
    animarContador(document.getElementById('tmb'), tmbRedondeado);
    animarContador(document.getElementById('get'), getRedondeado, 1100);

    Historial.guardar(HISTORIAL_KEY_CALC, {
        inputs: { sexo, edad, peso, altura, actividad },
        resultados: { tmb: tmbRedondeado, get: getRedondeado }
    });
    renderHistorialCalculadora();
});

document.addEventListener('DOMContentLoaded', () => {
    renderHistorialCalculadora();
    document.getElementById('btn-limpiar-calc').addEventListener('click', () => {
        Historial.limpiar(HISTORIAL_KEY_CALC);
        renderHistorialCalculadora();
    });
});
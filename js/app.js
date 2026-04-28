const API = 'http://localhost:8080/api';
const HISTORIAL_KEY = 'intercambios_historial';

const UI = {
    grupos: document.getElementById('grupos-container'),
    subgrupos: document.getElementById('subgrupos-container'),
    alimentos: document.getElementById('alimentos-container'),
    seleccionado: document.getElementById('seleccionado-container'),
    intercambios: document.getElementById('intercambios-container'),
    seccionSubgrupos: document.getElementById('seccion-subgrupos'),
    seccionAlimentos: document.getElementById('seccion-alimentos'),
    seccionIntercambios: document.getElementById('seccion-intercambios'),
    historialContainer: document.getElementById('historial-container'),
    btnLimpiarHistorial: document.getElementById('btn-limpiar-historial')
};

const requestState = {
    subgruposToken: 0,
    alimentosToken: 0,
    intercambiosToken: 0
};

const sanitize = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
}[char]));

const fetchJSON = async (path) => {
    const response = await fetch(`${API}${path}`);
    if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
    }
    return response.json();
};

const setLoading = (container, message = 'Cargando...') => {
    container.innerHTML = `<div class="loading">${sanitize(message)}</div>`;
};

const setError = (container, message = 'No fue posible cargar la información.') => {
    container.innerHTML = `<div class="error">${sanitize(message)}</div>`;
};

const clearActiveClass = (selector) => {
    document.querySelectorAll(selector).forEach((el) => el.classList.remove('activo'));
};

const showSection = (section) => section.classList.add('visible');

const hideAllSections = () => {
    [UI.seccionSubgrupos, UI.seccionAlimentos, UI.seccionIntercambios].forEach((section) => {
        section.classList.remove('visible');
    });
};

const resetStep = (section, container) => {
    section.classList.remove('visible');
    container.innerHTML = '';
};

const createButton = ({ className, html, onClick }) => {
    const button = document.createElement('button');
    button.className = className;
    button.type = 'button';
    button.innerHTML = html;
    button.addEventListener('click', onClick);
    return button;
};

const createCard = ({ className, html, onClick }) => {
    const article = document.createElement('article');
    article.className = className;
    article.innerHTML = html;
    if (onClick) {
        article.tabIndex = 0;
        article.setAttribute('role', 'button');
        article.addEventListener('click', onClick);
        article.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
            }
        });
    }
    return article;
};

const renderGrupos = (grupos) => {
    UI.grupos.innerHTML = '';
    const fragment = document.createDocumentFragment();

    grupos.forEach((grupo, index) => {
        const button = createButton({
            className: 'grupo-btn',
            html: sanitize(grupo.nombre),
            onClick: () => seleccionarGrupo(grupo.id, button)
        });
        button.style.animationDelay = `${index * 0.05}s`;
        fragment.appendChild(button);
    });

    UI.grupos.appendChild(fragment);
};

const renderSubgrupos = (subgrupos) => {
    UI.subgrupos.innerHTML = '';
    const fragment = document.createDocumentFragment();

    subgrupos.forEach((subgrupo, index) => {
        const button = createButton({
            className: 'subgrupo-btn',
            html: `<span>${sanitize(subgrupo.nombre)}</span><span class="badge">${sanitize(subgrupo.kcalPromedio)} kcal prom.</span>`,
            onClick: () => seleccionarSubgrupo(subgrupo.id, button)
        });
        button.style.animationDelay = `${index * 0.04}s`;
        fragment.appendChild(button);
    });

    UI.subgrupos.appendChild(fragment);
};

const renderAlimentos = (alimentos) => {
    UI.alimentos.innerHTML = '';
    const fragment = document.createDocumentFragment();

    alimentos.forEach((alimento, index) => {
        const card = createCard({
            className: 'alimento-card',
            html: `
                <div class="nombre">${sanitize(alimento.nombre)}</div>
                <div class="porcion">${sanitize(alimento.porcionGramos)}g · ${sanitize(alimento.descripcionMedida)}</div>
            `,
            onClick: () => seleccionarAlimento(alimento, card)
        });
        card.style.animationDelay = `${index * 0.04}s`;
        fragment.appendChild(card);
    });

    UI.alimentos.appendChild(fragment);
};

const buildNutrientesHTML = (nutrientes) => `
    <div class="kcal-badge">⚡ ${sanitize(nutrientes.kcal)} kcal</div>
    <div class="nutrientes">
        <div class="nutriente"><div class="valor">${sanitize(nutrientes.proteinaG)}g</div><div class="label">Proteína</div></div>
        <div class="nutriente"><div class="valor">${sanitize(nutrientes.grasaTotalG)}g</div><div class="label">Grasa</div></div>
        <div class="nutriente"><div class="valor">${sanitize(nutrientes.choG)}g</div><div class="label">CHO</div></div>
        <div class="nutriente"><div class="valor">${sanitize(nutrientes.calcioMg)}mg</div><div class="label">Calcio</div></div>
        <div class="nutriente"><div class="valor">${sanitize(nutrientes.hierroMg)}mg</div><div class="label">Hierro</div></div>
        <div class="nutriente"><div class="valor">${sanitize(nutrientes.vitaminaCMg)}mg</div><div class="label">Vit. C</div></div>
    </div>
`;

const renderSeleccionado = (alimento, totalIntercambios) => {
    UI.seleccionado.innerHTML = `
        <div class="seleccionado-info">
            <div>
                <div class="nombre">Alimento seleccionado: ${sanitize(alimento.nombre)}</div>
                <div class="porcion">${sanitize(alimento.porcionGramos)}g · ${sanitize(alimento.descripcionMedida)}</div>
            </div>
            <span class="meta-count">${sanitize(totalIntercambios)} intercambios</span>
        </div>
    `;
};

const renderIntercambios = async (intercambios, token) => {
    UI.intercambios.innerHTML = '';

    if (intercambios.length === 0) {
        UI.intercambios.innerHTML = '<div class="empty">No se encontraron intercambios para este alimento.</div>';
        return;
    }

    const intercambiosConNutrientes = await Promise.all(
        intercambios.map(async (alimento) => {
            try {
                const nutrientes = await fetchJSON(`/nutrientes/alimento/${alimento.id}`);
                return { alimento, nutrientes };
            } catch {
                return { alimento, nutrientes: null };
            }
        })
    );

    if (token !== requestState.intercambiosToken) {
        return;
    }

    const fragment = document.createDocumentFragment();
    intercambiosConNutrientes.forEach(({ alimento, nutrientes }, index) => {
        const card = createCard({
            className: 'intercambio-card',
            html: `
                <div class="nombre">${sanitize(alimento.nombre)}</div>
                <div class="porcion">${sanitize(alimento.porcionGramos)}g · ${sanitize(alimento.descripcionMedida)}</div>
                ${nutrientes ? buildNutrientesHTML(nutrientes) : '<div class="empty">Sin datos nutricionales</div>'}
            `
        });
        card.style.animationDelay = `${index * 0.06}s`;
        fragment.appendChild(card);
    });

    UI.intercambios.appendChild(fragment);
};

async function cargarGrupos() {
    setLoading(UI.grupos, 'Cargando grupos...');
    try {
        const grupos = await fetchJSON('/grupos');
        renderGrupos(grupos);
    } catch {
        setError(UI.grupos, 'No se pudieron cargar los grupos. Verifica el backend.');
    }
}

async function seleccionarGrupo(grupoId, button) {
    requestState.subgruposToken += 1;
    const token = requestState.subgruposToken;

    clearActiveClass('.grupo-btn');
    button.classList.add('activo');

    hideAllSections();
    resetStep(UI.seccionAlimentos, UI.alimentos);
    resetStep(UI.seccionIntercambios, UI.intercambios);
    UI.seleccionado.innerHTML = '';

    setLoading(UI.subgrupos);
    showSection(UI.seccionSubgrupos);

    try {
        const subgrupos = await fetchJSON(`/subgrupos/por-grupo/${grupoId}`);
        if (token !== requestState.subgruposToken) {
            return;
        }
        renderSubgrupos(subgrupos);
    } catch {
        if (token === requestState.subgruposToken) {
            setError(UI.subgrupos, 'No se pudieron cargar los subgrupos.');
        }
    }
}

async function seleccionarSubgrupo(subgrupoId, button) {
    requestState.alimentosToken += 1;
    const token = requestState.alimentosToken;

    clearActiveClass('.subgrupo-btn');
    button.classList.add('activo');

    resetStep(UI.seccionIntercambios, UI.intercambios);
    UI.seleccionado.innerHTML = '';

    setLoading(UI.alimentos);
    showSection(UI.seccionAlimentos);

    try {
        const alimentos = await fetchJSON(`/alimentos/por-subgrupo/${subgrupoId}`);
        if (token !== requestState.alimentosToken) {
            return;
        }
        renderAlimentos(alimentos);
    } catch {
        if (token === requestState.alimentosToken) {
            setError(UI.alimentos, 'No se pudieron cargar los alimentos.');
        }
    }
}

async function seleccionarAlimento(alimento, card) {
    requestState.intercambiosToken += 1;
    const token = requestState.intercambiosToken;

    clearActiveClass('.alimento-card');
    card.classList.add('activo');

    setLoading(UI.intercambios, 'Cargando intercambios...');
    showSection(UI.seccionIntercambios);

    try {
        const intercambios = await fetchJSON(`/alimentos/${alimento.id}/intercambios`);
        if (token !== requestState.intercambiosToken) {
            return;
        }
        renderSeleccionado(alimento, intercambios.length);
        await renderIntercambios(intercambios, token);
        Historial.guardar(HISTORIAL_KEY, {
            alimento: {
                id: alimento.id,
                nombre: alimento.nombre,
                porcionGramos: alimento.porcionGramos,
                descripcionMedida: alimento.descripcionMedida
            },
            totalIntercambios: intercambios.length
        });
        renderHistorialIntercambios();
    } catch {
        if (token === requestState.intercambiosToken) {
            setError(UI.intercambios, 'No se pudieron cargar los intercambios.');
        }
    }
}
const renderHistorialIntercambios = () => {
    const lista = Historial.obtener(HISTORIAL_KEY);
    if (lista.length === 0) {
        UI.historialContainer.innerHTML = '<div class="empty">No hay consultas recientes.</div>';
        return;
    }
    const fragment = document.createDocumentFragment();
    lista.forEach(({ alimento, totalIntercambios, fecha }) => {
        const item = document.createElement('div');
        item.className = 'historial-item';
        item.innerHTML = `
            <div class="historial-fecha"><i class="fas fa-clock"></i> ${sanitize(Historial.formatearFecha(fecha))}</div>
            <div class="historial-nombre">${sanitize(alimento.nombre)}</div>
            <div class="historial-detalle">${sanitize(String(alimento.porcionGramos))}g · ${sanitize(alimento.descripcionMedida)}</div>
            <span class="historial-badge">${sanitize(String(totalIntercambios))} intercambios</span>
        `;
        fragment.appendChild(item);
    });
    UI.historialContainer.innerHTML = '';
    UI.historialContainer.appendChild(fragment);
};

document.addEventListener('DOMContentLoaded', () => {
    cargarGrupos();
    renderHistorialIntercambios();
    UI.btnLimpiarHistorial.addEventListener('click', () => {
        Historial.limpiar(HISTORIAL_KEY);
        renderHistorialIntercambios();
    });
});

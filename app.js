const API = 'http://localhost:8080/api';

const UI = {
    grupos: document.getElementById('grupos-container'),
    subgrupos: document.getElementById('subgrupos-container'),
    alimentos: document.getElementById('alimentos-container'),
    seleccionado: document.getElementById('seleccionado-container'),
    intercambios: document.getElementById('intercambios-container'),
    seccionSubgrupos: document.getElementById('seccion-subgrupos'),
    seccionAlimentos: document.getElementById('seccion-alimentos'),
    seccionIntercambios: document.getElementById('seccion-intercambios')
};

const fetchJSON = async (path) => {
    const response = await fetch(`${API}${path}`);
    if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
    }
    return response.json();
};

const setLoading = (container, message = 'Cargando...') => {
    container.innerHTML = `<div class="loading">${message}</div>`;
};

const setError = (container, message = 'No fue posible cargar la información.') => {
    container.innerHTML = `<div class="error">${message}</div>`;
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

const createButton = ({ className, label, onClick, html }) => {
    const button = document.createElement('button');
    button.className = className;
    if (html) {
        button.innerHTML = html;
    } else {
        button.textContent = label;
    }
    button.addEventListener('click', onClick);
    return button;
};

const renderGrupos = (grupos) => {
    UI.grupos.innerHTML = '';
    grupos.forEach((grupo) => {
        const button = createButton({
            className: 'grupo-btn',
            label: grupo.nombre,
            onClick: () => seleccionarGrupo(grupo.id, button)
        });
        UI.grupos.appendChild(button);
    });
};

const renderSubgrupos = (subgrupos) => {
    UI.subgrupos.innerHTML = '';
    subgrupos.forEach((subgrupo) => {
        const button = createButton({
            className: 'subgrupo-btn',
            html: `<span>${subgrupo.nombre}</span><span class="badge">${subgrupo.kcalPromedio} kcal prom.</span>`,
            onClick: () => seleccionarSubgrupo(subgrupo.id, button)
        });
        UI.subgrupos.appendChild(button);
    });
};

const renderAlimentos = (alimentos) => {
    UI.alimentos.innerHTML = '';
    alimentos.forEach((alimento) => {
        const card = document.createElement('article');
        card.className = 'alimento-card';
        card.innerHTML = `
            <div class="nombre">${alimento.nombre}</div>
            <div class="porcion">${alimento.porcionGramos}g · ${alimento.descripcionMedida}</div>
        `;
        card.addEventListener('click', () => seleccionarAlimento(alimento, card));
        UI.alimentos.appendChild(card);
    });
};

const buildNutrientesHTML = (nutrientes) => `
    <div class="kcal-badge">⚡ ${nutrientes.kcal} kcal</div>
    <div class="nutrientes">
        <div class="nutriente"><div class="valor">${nutrientes.proteinaG}g</div><div class="label">Proteína</div></div>
        <div class="nutriente"><div class="valor">${nutrientes.grasaTotalG}g</div><div class="label">Grasa</div></div>
        <div class="nutriente"><div class="valor">${nutrientes.choG}g</div><div class="label">CHO</div></div>
        <div class="nutriente"><div class="valor">${nutrientes.calcioMg}mg</div><div class="label">Calcio</div></div>
        <div class="nutriente"><div class="valor">${nutrientes.hierroMg}mg</div><div class="label">Hierro</div></div>
        <div class="nutriente"><div class="valor">${nutrientes.vitaminaCMg}mg</div><div class="label">Vit. C</div></div>
    </div>
`;

const renderSeleccionado = (alimento, totalIntercambios) => {
    UI.seleccionado.innerHTML = `
        <div class="seleccionado-info">
            <div>
                <div class="nombre">Alimento seleccionado: ${alimento.nombre}</div>
                <div class="porcion">${alimento.porcionGramos}g · ${alimento.descripcionMedida}</div>
            </div>
            <span style="color:#718096;font-size:0.85rem">${totalIntercambios} intercambios</span>
        </div>
    `;
};

const renderIntercambios = async (intercambios) => {
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

    intercambiosConNutrientes.forEach(({ alimento, nutrientes }) => {
        const card = document.createElement('article');
        card.className = 'intercambio-card';
        card.innerHTML = `
            <div class="nombre">${alimento.nombre}</div>
            <div class="porcion">${alimento.porcionGramos}g · ${alimento.descripcionMedida}</div>
            ${nutrientes ? buildNutrientesHTML(nutrientes) : '<div class="empty">Sin datos nutricionales</div>'}
        `;
        UI.intercambios.appendChild(card);
    });
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
        renderSubgrupos(subgrupos);
    } catch {
        setError(UI.subgrupos, 'No se pudieron cargar los subgrupos.');
    }
}

async function seleccionarSubgrupo(subgrupoId, button) {
    clearActiveClass('.subgrupo-btn');
    button.classList.add('activo');

    resetStep(UI.seccionIntercambios, UI.intercambios);
    UI.seleccionado.innerHTML = '';

    setLoading(UI.alimentos);
    showSection(UI.seccionAlimentos);

    try {
        const alimentos = await fetchJSON(`/alimentos/por-subgrupo/${subgrupoId}`);
        renderAlimentos(alimentos);
    } catch {
        setError(UI.alimentos, 'No se pudieron cargar los alimentos.');
    }
}

async function seleccionarAlimento(alimento, card) {
    clearActiveClass('.alimento-card');
    card.classList.add('activo');

    setLoading(UI.intercambios, 'Cargando intercambios...');
    showSection(UI.seccionIntercambios);

    try {
        const intercambios = await fetchJSON(`/alimentos/${alimento.id}/intercambios`);
        renderSeleccionado(alimento, intercambios.length);
        await renderIntercambios(intercambios);
    } catch {
        setError(UI.intercambios, 'No se pudieron cargar los intercambios.');
    }
}

document.addEventListener('DOMContentLoaded', cargarGrupos);

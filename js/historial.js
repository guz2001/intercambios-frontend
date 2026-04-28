const HISTORIAL_MAX = 15;

const Historial = {
    obtener(key) {
        try {
            return JSON.parse(localStorage.getItem(key) ?? '[]');
        } catch {
            return [];
        }
    },

    guardar(key, datos) {
        const lista = this.obtener(key);
        lista.unshift({ id: Date.now(), fecha: new Date().toISOString(), ...datos });
        if (lista.length > HISTORIAL_MAX) lista.length = HISTORIAL_MAX;
        localStorage.setItem(key, JSON.stringify(lista));
    },

    limpiar(key) {
        localStorage.removeItem(key);
    },

    formatearFecha(iso) {
        return new Date(iso).toLocaleString('es-MX', {
            dateStyle: 'short',
            timeStyle: 'short'
        });
    }
};

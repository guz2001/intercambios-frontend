document.getElementById('calculadoraForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const sexo = document.querySelector('input[name="sexo"]:checked').value;
            const edad = parseFloat(document.getElementById('edad').value);
            const peso = parseFloat(document.getElementById('peso').value);
            const altura = parseFloat(document.getElementById('altura').value);
            const actividad = parseFloat(document.getElementById('actividad').value);

            let tmb;

            if (sexo === 'hombre') {
                tmb = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * edad);
            } else {
                tmb = 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * edad);
            }

            const get = tmb * actividad;

            document.getElementById('tmb').textContent = Math.round(tmb);
            document.getElementById('get').textContent = Math.round(get);
            document.getElementById('resultado').classList.add('show');
        });
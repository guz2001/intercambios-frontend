/*
Crecion de calculadora 
*/
document.getElementById('calculadoraForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const sexo = document.querySelector('input[name="sexo"]:checked').value;
            const edad = parseFloat(document.getElementById('edad').value);
            const peso = parseFloat(document.getElementById('peso').value);
            const altura = parseFloat(document.getElementById('altura').value);
            const actividad = parseFloat(document.getElementById('actividad').value);

            let tmb;
            //formulas para cada sexo o edad se agregan niños y niñas
            if (sexo === 'hombre') {
                tmb = 66.4 + (13.700 * peso) + (5.000 * altura) - ( 6.800 * edad);
            } else if( sexo === 'mujer'){
                tmb = 655.1 + (9.563 * peso) + (1.850 * altura) - (4.676* edad);
            } else if (sexo === 'niño') {
                tmb = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * edad);
            }else if (sexo === 'niña') {
                tmb = 655.1 + (9.563 * peso) + (1.850 * altura) - (4.676* edad);
            }

            const get = tmb * actividad;

            document.getElementById('tmb').textContent = Math.round(tmb);
            document.getElementById('get').textContent = Math.round(get);
            document.getElementById('resultado').classList.add('show');
        });
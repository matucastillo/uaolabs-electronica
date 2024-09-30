document.addEventListener('DOMContentLoaded', function() {  
    const termsCheck = document.getElementById('checkbox-terminos');  
    const storedDate = localStorage.getItem('termsAcceptedDate');  
    const today = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD  

    // Verifica si la fecha almacenada es del mismo día  
    if (storedDate === today) {  
        termsCheck.checked = localStorage.getItem('termsAccepted') === 'true';  
    } else {  
        termsCheck.checked = false; // Si no es el mismo día, desmarca el checkbox  
    }  

    // Guarda el estado del checkbox y la fecha actual  
    termsCheck.addEventListener('change', function() {  
        localStorage.setItem('termsAccepted', termsCheck.checked);  
        localStorage.setItem('termsAcceptedDate', today);  
    });  

    // Mostrar el aviso solo si el checkbox no está habilitado
    if (!termsCheck.checked) {
        Swal.fire({
            title: '¡AVISO IMPORTANTE!',
            html: 'Apreciado estudiante, tenga en cuenta que el horario de préstamo de equipos/elementos por parte del almacén de electrónica, incluyendo las jornadas nocturnas, es de <strong>lunes a viernes de 7:00 a.m. a 9:00 p.m.</strong> y <strong>los sábados de 7:00 a.m. a 4:30 p.m.</strong>. El sistema no permitirá hacer préstamos fuera de esos horarios sin excepción alguna.<p><p>¡Muchas gracias por su comprensión!</p>',
            icon: 'warning',
            confirmButtonText: 'Cerrar',
            customClass: {
                confirmButton: 'btn-confirmar', // Clase personalizada para el botón de confirmación
            },
        });
    }

    const laboratorioSelect = document.getElementById('modal-laboratorio');
    const elementoSelect = document.getElementById('modal-elemento');
    const cantidadSelect = document.getElementById('modal-cantidad');

    // Función para deshabilitar y limpiar el campo de cantidad
    function resetCantidadField() {
        cantidadSelect.disabled = true;
        cantidadSelect.innerHTML = '<option value="" selected disabled>Seleccione una cantidad</option>';
    }

    // Función para llenar el select de equipos
    function loadEquipos(laboratorioId) {
        fetch(`/get_equipos/${laboratorioId}`)
            .then(response => response.json())
            .then(data => {
                console.log(data); // Verifica qué datos se están obteniendo
                if (data.error) {
                    console.error('Error al obtener equipos:', data.error);
                    return;
                }

                // Elimina duplicados y ordena alfabéticamente
                const uniqueEquipos = Array.from(new Set(data.map(equipo => equipo.nombre)))
                    .map(nombre => data.find(equipo => equipo.nombre === nombre))
                    .sort((a, b) => a.nombre.localeCompare(b.nombre));

                // Limpia el select de cualquier opción previa
                elementoSelect.innerHTML = '<option value="" selected disabled>Seleccione un elemento</option>';

                // Llena el select con los equipos obtenidos
                uniqueEquipos.forEach(equipo => {
                    const option = document.createElement('option');
                    //option.value = equipo.id;  // Asegúrate de que este campo coincida con el campo clave de tu tabla de equipos
                    option.textContent = equipo.nombre;  // Asegúrate de que este campo coincida con el nombre del equipo en tu tabla
                    elementoSelect.appendChild(option);
                });

                // Habilita el campo EQUIPO/ELEMENTO cuando se selecciona un laboratorio
                elementoSelect.disabled = uniqueEquipos.length === 0;
            })
            .catch(error => {
                console.error('Error al realizar la solicitud:', error);
            });
    }

    // Función para cargar la cantidad máxima permitida para un equipo
    function loadCantidad(equipoNombre) {
        fetch(`/get_cantidad_prestamo/${encodeURIComponent(equipoNombre)}`)
            .then(response => response.json())
            .then(data => {
                console.log(data); // Verifica qué datos se están obteniendo
                if (data.error) {
                    console.error('Error al obtener cantidad:', data.error);
                    cantidadSelect.innerHTML = '<option value="" selected disabled>Error al obtener cantidad</option>';
                    return;
                }

                // Limpia el select de cualquier opción previa
                cantidadSelect.innerHTML = '<option value="" selected disabled>Seleccione una cantidad</option>';

                // Llena el select con la cantidad máxima permitida
                for (let i = 1; i <= data.cantidad_maxima_prestamo; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = i;
                    cantidadSelect.appendChild(option);
                }

                // Habilita el campo CANTIDAD
                cantidadSelect.disabled = false;
            })
            .catch(error => {
                console.error('Error al realizar la solicitud:', error);
                cantidadSelect.innerHTML = '<option value="" selected disabled>Error al obtener cantidad</option>';
            });
    }

    // Escucha el cambio en el select de laboratorio
    laboratorioSelect.addEventListener('change', function() {
        // Obtén el laboratorio seleccionado
        const laboratorioId = laboratorioSelect.value;

        // Carga los equipos para el laboratorio seleccionado
        loadEquipos(laboratorioId);

        // Resetea el campo CANTIDAD y deshabilítalo
        resetCantidadField();
    });

    // Escucha el cambio en el select de elemento
    elementoSelect.addEventListener('change', function() {
        // Obtén el nombre del equipo seleccionado
        const equipoNombre = elementoSelect.options[elementoSelect.selectedIndex].textContent;

        // Carga la cantidad máxima permitida para el equipo seleccionado
        loadCantidad(equipoNombre);
    });

    // Función para obtener laboratorios y llenar el select
    function loadLaboratorios() {
        fetch('/get_laboratorios')
            .then(response => response.json())
            .then(data => {
                console.log(data); // Verifica qué datos se están obteniendo
                if (data.error) {
                    console.error('Error al obtener laboratorios:', data.error);
                    return;
                }

                // Limpia el select de cualquier opción previa
                laboratorioSelect.innerHTML = '<option value="" selected disabled>Seleccione un laboratorio</option>';

                // Llena el select con los laboratorios obtenidos
                data.forEach(lab => {
                    const option = document.createElement('option');
                    option.value = lab.id;  // Asegúrate de que este campo coincida con el campo clave de tu tabla de laboratorios
                    option.textContent = lab.nombre;  // Asegúrate de que este campo coincida con el nombre del laboratorio en tu tabla
                    laboratorioSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error al realizar la solicitud:', error);
            });
    }

    // Llama a la función para cargar los laboratorios cuando se carga la página
    loadLaboratorios();

    // Maneja el clic en el botón
    document.getElementById('guardarItemBtn').addEventListener('click', function(event) {
    event.preventDefault();

    // Validar que el checkbox esté marcado
    if (!$('#checkbox-terminos').is(':checked')) {
        console.log('Checkbox de términos y condiciones no está marcado.');
        Swal.fire({
            icon: 'warning',
            title: '¡Advertencia!',
            text: 'Debes aceptar los términos y condiciones para guardar.',
            customClass: {
                confirmButton: 'btn-confirmar', // Clase personalizada para el botón de confirmación
            },
        });
        return;
    }

    // Obtener los valores seleccionados de los campos <select>
    var laboratorio = $('#modal-laboratorio').val();
    var nombreEquipo = $('#modal-elemento option:selected').text();
    var cantidad = $('#modal-cantidad').val();

    console.log('Valores capturados:', {
        laboratorio: laboratorio,
        nombreEquipo: nombreEquipo,
        cantidad: cantidad,
    });

    // Validar que los campos de equipo y cantidad no estén vacíos
    if (!nombreEquipo || !cantidad || !laboratorio) {
        console.log('Falta información: nombreEquipo, cantidad o laboratorio.');
        Swal.fire({
            icon: 'warning',
            title: '¡Advertencia!',
            text: 'Debes seleccionar un equipo/elemento y una cantidad.',
            customClass: {
                confirmButton: 'btn-confirmar', // Clase personalizada para el botón de confirmación
            },
        });
        return;
    }

    // Mostrar los datos que se van a enviar
    var formData = $('#item-form').serialize();
    console.log('Datos que se enviarán:', formData);

    // Enviar datos del formulario por AJAX
    $.ajax({
        url: '/guardar_item_usuario',
        type: 'POST',
        data: formData,
        beforeSend: function() {
            console.log('Enviando datos del formulario...');
        },
        success: function(response) {
            console.log('Respuesta del servidor:', response);
            if (response.status === 'success') {
                // Limpiar los campos del formulario
                $('#modal-laboratorio').val('');
                $('#modal-elemento').val('');
                $('#modal-cantidad').val('');

                // Agregar la nueva fila a la tabla
                $('#tabla-items').append(
                    `<tr id="item-${response.item.id}">
                        <td class="text-center">
                            <button class="btn btn-danger btn-sm btn-eliminar" data-id="${response.item.id}" data-equipo="${response.item.nombre_equipo}">
                                QUITAR
                            </button>
                        </td>
                        <td class="text-left">${response.item.nombre_equipo}</td>
                        <td class="text-center">${response.item.cantidad}</td>
                        <td class="text-center">${response.item.laboratorio}</td>
                        
                    </tr>`
                );
                console.log('Ítem agregado a la tabla.');
            } else {
                console.log('Error al guardar el ítem:', response);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al guardar el ítem',
                    customClass: {
                        confirmButton: 'btn-confirmar', // Clase personalizada para el botón de confirmación
                    },
                });
            }
        },
        error: function(xhr, status, error) {
            console.log('Error en la solicitud AJAX:', {
                xhr: xhr,
                status: status,
                error: error,
            });
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error en la solicitud',
                customClass: {
                    confirmButton: 'btn-confirmar', // Clase personalizada para el botón de confirmación
                },
            });
        }
    });        

});


});

$(document).ready(function() {

    // Manejar clic en el botón de eliminar
    $('#tabla-items').on('click', '.btn-eliminar', function() {
        var button = $(this);
        var id = button.data('id');
        var equipo = button.data('equipo');

        Swal.fire({
            title: '¿Estás seguro?',
            html: `¿Deseas quitar el equipo/elemento <strong>${equipo}</strong> de la solicitud de préstamo?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, quitar',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'btn-confirmar',
                cancelButton: 'btn-cancelar'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `/eliminar_item_usuario/${id}`,
                    type: 'POST',
                    success: function(response) {
                        if (response.status === 'success') {
                            Swal.fire({
                                title: 'Eliminado',
                                text: 'El equipo/elemento ha sido eliminado de la solicitud de préstamo.',
                                icon: 'success'
                            });
                            // Eliminar la fila de la tabla
                            button.closest('tr').remove();

                        } else {
                            Swal.fire({
                                title: 'Error',
                                text: response.message,
                                icon: 'error'
                            });
                        }
                    },
                    error: function(xhr, status, error) {
                        Swal.fire({
                            title: 'Error',
                            text: 'Ocurrió un error al eliminar el ítem. Por favor, intenta de nuevo.',
                            icon: 'error'
                        });
                    }
                });
            }
        });
    });
});




$(document).ready(function () {
    // Llamar a la función buscarCodigo cuando se envíe el formulario
    $('#form-buscar-codigo').submit(function (event) {
        event.preventDefault();
        buscarCodigo();
    });

    // Escuchar el cambio del toggle
    $('#toggle').change(function () {
        buscarCodigo(); // Regenerar la tabla cuando se cambia el toggle
    });

    // Función para buscar el código del estudiante y generar la tabla
    function buscarCodigo() {
        var codigo = $('#codigo_estudiante').val();
        $.ajax({
            type: 'POST',
            url: '/buscar_codigo',
            data: { codigo_estudiante: codigo },
            success: function (response) {

                if (response.error) {
                    // Mostrar el error si el código de estudiante no se encuentra
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: response.error,
                        confirmButtonText: 'Aceptar',
                        customClass: {
                            confirmButton: 'btn-confirmar', // Clase personalizada para el botón de confirmación
                        },
                    });
                    $('#tabla-dinamica').html(''); // Limpiar la tabla si hay error
                    return;
                }

                // Acceso a los datos de la respuesta
                var nombreCompleto = response.nombre_completo;
                var items = response.items;
                var toggleChecked = $('#toggle').is(':checked'); // Verificar el estado del toggle

                // Generar la tabla
                var tabla = '<table class="table table-bordered">';
                tabla += '<thead><tr>';
                tabla += '<th scope="col" colspan="5" class="text-center"><strong>Nombre del Estudiante: ' + nombreCompleto.toUpperCase() + '</strong></th>';
                tabla += '</tr>';
                tabla += '<tr>';
                tabla += '<th scope="col" class="text-center">ITEM #</th>';
                tabla += '<th scope="col" class="text-left">EQUIPO/ELEMENTO</th>';
                tabla += '<th scope="col" class="text-center">No. ACTIVO</th>';
                tabla += '<th scope="col" class="text-center">CANTIDAD</th>';
                tabla += '<th scope="col" class="text-center">TIPO DE PRÉSTAMO</th>';
                tabla += '</tr></thead>';
                tabla += '<tbody>';
                
                // Construir las filas de la tabla
                $.each(items, function (index, item) {
                    tabla += '<tr id="item-' + item.id + '">';
                    tabla += '<td class="text-center">' + (index + 1) + '</td>';
                    tabla += '<td class="text-left"><input type="text" class="form-control" id="nombre_equipo_' + item.id + '" value="' + item.nombre_equipo + '" readonly></td>';
                    tabla += '<td class="text-center"><input type="text" class="form-control text-center" id="numero_activo_' + item.id + '" value=""></td>';
                    tabla += '<td class="text-center"><input type="number" class="form-control text-center" id="cantidad_' + item.id + '" value="' + item.cantidad + '" min="1"></td>';
                    tabla += '<td class="text-center">';
                    tabla += '<select class="form-control text-center" id="tipo_prestamo_' + item.id + '">';
                    tabla += '<option value="DIARIO"' + (item.tipo_prestamo === 'DIARIO' ? ' selected' : '') + '>DIARIO</option>';
                    tabla += '<option value="NOCTURNO"' + (item.tipo_prestamo === 'NOCTURNO' ? ' selected' : '') + '>NOCTURNO</option>';
                    tabla += '<option value="EXTERNO"' + (item.tipo_prestamo === 'EXTERNO' ? ' selected' : '') + '>EXTERNO</option>';
                    tabla += '</select>';
                    tabla += '</td>';
                    tabla += '<td class="text-center">';
                    // Solo agregar los botones si el toggle está desactivado (MANUAL)
                    if (!toggleChecked) {
                        tabla += '<td class="text-center"><button class="btn btn-success btn-sm" onclick="actualizarItem(' + item.id + ')">ENTREGAR</button></td>';
                    }
                    tabla += '<td class="text-center"><button class="btn btn-danger btn-sm" onclick="confirmarEliminar(' + item.id + ')">ELIMINAR</button>';
                    tabla += '</td>';
                    tabla += '</tr>';
                });
                tabla += '</tbody></table>';
                
                // Insertar la tabla en el contenedor
                $('#tabla-dinamica').html(tabla);


            },
            error: function (xhr) {
                // Verifica si hay un mensaje de error en la respuesta del servidor
                let errorMessage = xhr.responseJSON && xhr.responseJSON.error ? xhr.responseJSON.error : 'Ocurrió un error inesperado';
            
                // Mostrar el mensaje de error en SweetAlert
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: errorMessage, // Mostrar el mensaje exacto enviado desde Flask
                    confirmButtonText: 'Aceptar',
                    customClass: {
                        confirmButton: 'btn-confirmar', // Clase personalizada para el botón de confirmación
                    },
                });
            
                // Borrar la tabla después del error
                $('#tabla-dinamica').empty(); // Aquí debes ajustar el selector según el ID o clase de tu tabla
            }
        });
    };
    // Función para actualizar un ítem
    window.actualizarItem = function (id) {
        var nombreEquipo = $('#nombre_equipo_' + id).val();
        var numeroActivo = $('#numero_activo_' + id).val();
        var tipoPrestamo = $('#tipo_prestamo_' + id).val();
        var cantidad = $('#cantidad_' + id).val();

        if (cantidad < 1) {
            
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'La cantidad mínima es 1.',
                confirmButtonText: 'Aceptar',
                customClass: {
                    confirmButton: 'btn-confirmar', // Clase personalizada para el botón de confirmación
                },
            });

            return;
        }

        $.ajax({
            type: 'POST',
            url: '/entregar_item/' + id,
            data: {
                nombre_equipo: nombreEquipo,
                numero_activo: numeroActivo,
                tipo_prestamo: tipoPrestamo,
                cantidad: cantidad
            },
            success: function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Entregado!',
                    text: 'El ítem ha sido entregado.',
                    customClass: {
                    confirmButton: 'btn-confirmar', // Clase personalizada para el botón de confirmación
                },
                });
                buscarCodigo();
            }
        });
    };

    // Función para confirmar la eliminación de un ítem con SweetAlert
    window.confirmarEliminar = function (id) {
        var nombreItem = $('#nombre_equipo_' + id).val();

        Swal.fire({
            title: '¿Estás seguro?',
            text: "Vas a eliminar el ítem: " + nombreItem,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#c5161d',
            confirmButtonText: 'Sí, eliminarlo!',
            cancelButtonText: 'Cancelar',
            reverseButtons: true,
            customClass: {
                confirmButton: 'btn-confirmar', // Clase personalizada para el botón de confirmación
                cancelButton: 'btn-cancelar' // Clase personalizada para el botón de cancelación
            },
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarItem(id);
            }
        });
    };

    // Función para eliminar un ítem
    window.eliminarItem = function (id) {
        $.ajax({
            type: 'DELETE',
            url: '/delete_item_usuario/' + id,
            success: function (data) {
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado!',
                    text: 'El ítem ha sido eliminado.',
                    confirmButtonText: 'Aceptar',
                    customClass: {
                        confirmButton: 'btn-confirmar', // Clase personalizada para el botón de confirmación
                    },
                });

                buscarCodigo();
            }
        });
    };
});

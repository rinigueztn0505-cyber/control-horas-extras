// =========================================
// IMPORTACIÓN DE SUPABASE
// =========================================

import { supabase } from "./supabase.js";


// =========================================
// ELEMENTOS DE LA INTERFAZ
// =========================================

// Inicio de sesión
const loginContainer = document.getElementById("login-container");
const dashboardContainer = document.getElementById("dashboard-container");
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("login-message");
const loginButton = document.getElementById("login-button");
const logoutButton = document.getElementById("logout-button");

// Bienvenida
const welcomeName = document.getElementById("welcome-name");
const welcomeRole = document.getElementById("welcome-role");

// Cambio de contraseña
const changePasswordContainer = document.getElementById("change-password-container");
const changePasswordForm = document.getElementById("change-password-form");
const newPasswordInput = document.getElementById("new-password");
const confirmPasswordInput = document.getElementById("confirm-password");
const changePasswordButton = document.getElementById("change-password-button");
const passwordChangeMessage = document.getElementById("password-change-message");

// Gestión de técnicos
const technicianManagementSection = document.getElementById("technician-management-section");
const techniciansTableBody = document.getElementById("technicians-table-body");
const showTechnicianFormButton = document.getElementById("show-technician-form");
const technicianFormContainer = document.getElementById("technician-form-container");
const technicianForm = document.getElementById("technician-form");
const technicianNameInput = document.getElementById("technician-name");
const technicianUsernameInput = document.getElementById("technician-username");
const saveTechnicianButton = document.getElementById("save-technician-button");
const cancelTechnicianButton = document.getElementById("cancel-technician-button");
const technicianMessage = document.getElementById("technician-message");

// Módulo de horas extras
const hoursModule = document.getElementById("hours-module");
const hoursFormContainer = document.getElementById("hours-form-container");
const hoursForm = document.getElementById("hours-form");

const technicianSelectContainer = document.getElementById("technician-select-container");
const hoursTechnicianSelect = document.getElementById("hours-technician");

const caseNumberInput = document.getElementById("case-number");
const caseGenerationDateInput = document.getElementById("case-generation-date");
const hoursDeadlineMessage = document.getElementById("hours-deadline-message");

const activityDateInput = document.getElementById("activity-date");
const startTimeInput = document.getElementById("start-time");
const endTimeInput = document.getElementById("end-time");
const activityDescriptionInput = document.getElementById("activity-description");
const activityObservationsInput = document.getElementById("activity-observations");

const saveHoursButton = document.getElementById("save-hours-button");
const resetHoursButton = document.getElementById("reset-hours-button");
const hoursMessage = document.getElementById("hours-message");
const hoursTableBody = document.getElementById("hours-table-body");
const hoursModuleDescription = document.getElementById("hours-module-description");
const hoursListTitle = document.getElementById("hours-list-title");

// Resumen mensual del administrador
const adminHoursSummary = document.getElementById("admin-hours-summary");
const summaryMonthInput = document.getElementById("summary-month");
const adminSummaryTableBody = document.getElementById("admin-summary-table-body");
const adminSummaryTotal = document.getElementById("admin-summary-total");

// Resumen mensual del técnico
const technicianHoursSummary = document.getElementById("technician-hours-summary");
const technicianSummaryMonthInput = document.getElementById("technician-summary-month");
const technicianHoursTotal = document.getElementById("technician-hours-total");
const technicianHoursTotalValue = document.getElementById("technician-hours-total-value");

// Filtro de registros
const hoursTechnicianFilterContainer = document.getElementById("hours-technician-filter-container");
const hoursTechnicianFilter = document.getElementById("hours-technician-filter");

// Usuario y perfil actuales
let usuarioActual = null;
let perfilActual = null;

// Datos utilizados por los resúmenes y filtros
let tecnicosCargados = [];
let registrosCargados = [];
let nombresUsuarios = new Map();

// Registro que se está editando
let registroEnEdicion = null;

// Botón para cancelar la edición
let cancelEditButton = null;


// =========================================
// FUNCIONES AUXILIARES
// =========================================

function obtenerFechaLocal() {

    const fecha = new Date();

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}


function obtenerMesActual() {

    const fecha = new Date();

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");

    return `${anio}-${mes}`;
}


function mostrarMensaje(elemento, mensaje, tipo = "error") {

    elemento.textContent = mensaje;
    elemento.className = `form-message ${tipo}`;
}


function crearCelda(fila, contenido) {

    const celda = document.createElement("td");

    celda.textContent = contenido ?? "";

    fila.appendChild(celda);

    return celda;
}


function formatearFecha(fecha) {

    if (!fecha) {
        return "—";
    }

    const [anio, mes, dia] = fecha.split("-");

    return `${dia}/${mes}/${anio}`;
}


function calcularHoras(inicio, fin) {

    const [horaInicio, minutoInicio] = inicio.split(":").map(Number);
    const [horaFin, minutoFin] = fin.split(":").map(Number);

    let minutosInicio = horaInicio * 60 + minutoInicio;
    let minutosFin = horaFin * 60 + minutoFin;

    if (minutosFin < minutosInicio) {
        minutosFin += 24 * 60;
    }

    const diferencia = minutosFin - minutosInicio;

    if (diferencia <= 0) {
        return 0;
    }

    return Number((diferencia / 60).toFixed(2));
}


// =========================================
// PREPARAR COLUMNAS DE REVISIÓN Y ACCIONES
// =========================================

function prepararColumnaAcciones() {

    const tabla = hoursTableBody.closest("table");

    if (!tabla) {
        return;
    }

    const encabezado = tabla.querySelector("thead tr");

    if (!encabezado) {
        return;
    }

    const columnas = Array.from(encabezado.cells);

    const columnaRevisionExiste = columnas.some(
        celda => celda.textContent.trim().toLowerCase() === "revisión"
    );

    const columnaAcciones = columnas.find(
        celda => celda.textContent.trim().toLowerCase() === "acciones"
    );

    if (!columnaRevisionExiste) {

        const nuevaColumna = document.createElement("th");

        nuevaColumna.textContent = "Revisión";

        if (columnaAcciones) {
            encabezado.insertBefore(nuevaColumna, columnaAcciones);
        } else {
            encabezado.appendChild(nuevaColumna);
        }
    }

    const columnaAccionesExiste = Array.from(encabezado.cells).some(
        celda => celda.textContent.trim().toLowerCase() === "acciones"
    );

    if (!columnaAccionesExiste) {

        const nuevaColumna = document.createElement("th");

        nuevaColumna.textContent = "Acciones";

        encabezado.appendChild(nuevaColumna);
    }
}


// =========================================
// PREPARAR BOTÓN CANCELAR EDICIÓN
// =========================================

function prepararBotonCancelarEdicion() {

    if (cancelEditButton) {
        return;
    }

    cancelEditButton = document.createElement("button");

    cancelEditButton.type = "button";
    cancelEditButton.id = "cancel-edit-button";
    cancelEditButton.textContent = "Cancelar edición";
    cancelEditButton.hidden = true;

    cancelEditButton.addEventListener("click", function () {

        cancelarEdicionRegistro();
    });

    saveHoursButton.insertAdjacentElement(
        "afterend",
        cancelEditButton
    );
}


// =========================================
// RESTABLECER FORMULARIO DE HORAS
// =========================================

function restablecerFormularioHoras(mostrarFecha = true) {

    hoursForm.reset();

    registroEnEdicion = null;

    saveHoursButton.textContent = "Registrar horas extras";

    if (cancelEditButton) {
        cancelEditButton.hidden = true;
    }

    hoursMessage.textContent = "";
    hoursDeadlineMessage.textContent = "";

    if (mostrarFecha) {
        activityDateInput.value = obtenerFechaLocal();
    }
}


// =========================================
// FUNCIONES DEL RESUMEN DE HORAS
// =========================================

function obtenerRangoMes(mesSeleccionado) {

    const [anio, mes] = mesSeleccionado.split("-").map(Number);

    const fechaInicio = `${anio}-${String(mes).padStart(2, "0")}-01`;

    const siguienteAnio = mes === 12 ? anio + 1 : anio;
    const siguienteMes = mes === 12 ? 1 : mes + 1;

    const fechaFin = `${siguienteAnio}-${String(siguienteMes).padStart(2, "0")}-01`;

    return {
        fechaInicio,
        fechaFin
    };
}


function obtenerClaseHoras(total) {

    if (total >= 20) {
        return "hours-danger";
    }

    if (total >= 15 && total <= 17) {
        return "hours-warning";
    }

    return "hours-normal";
}


function formatearHoras(total) {

    return `${Number(total || 0).toFixed(2)} h`;
}


async function obtenerRegistrosDelMes(mesSeleccionado) {

    const { fechaInicio, fechaFin } = obtenerRangoMes(mesSeleccionado);

    const { data, error } = await supabase
        .from("registros_horas_extras")
        .select("id, tecnico_id, total_horas, fecha_actividad, estado")
        .eq("estado", "registrada")
        .gte("fecha_actividad", fechaInicio)
        .lt("fecha_actividad", fechaFin);

    if (error) {

        console.error(
            "Error consultando el resumen mensual:",
            error
        );

        throw error;
    }

    return data || [];
}


// =========================================
// RESUMEN MENSUAL DEL ADMINISTRADOR
// =========================================

async function cargarResumenAdministrador() {

    const mesSeleccionado = summaryMonthInput.value;

    if (!mesSeleccionado) {
        return;
    }

    adminSummaryTableBody.innerHTML = "";

    crearCelda(
        adminSummaryTableBody.insertRow(),
        "Calculando resumen..."
    ).colSpan = 3;

    try {

        const registrosMes = await obtenerRegistrosDelMes(mesSeleccionado);

        const acumulados = new Map();

        tecnicosCargados.forEach(function (tecnico) {

            acumulados.set(tecnico.id, 0);
        });

        registrosMes.forEach(function (registro) {

            const horasActuales = acumulados.get(registro.tecnico_id) || 0;

            acumulados.set(
                registro.tecnico_id,
                horasActuales + Number(registro.total_horas || 0)
            );
        });

        adminSummaryTableBody.innerHTML = "";

        let totalGeneral = 0;

        if (tecnicosCargados.length === 0) {

            const fila = adminSummaryTableBody.insertRow();

            crearCelda(fila, "No hay técnicos registrados.").colSpan = 3;

        } else {

            tecnicosCargados.forEach(function (tecnico) {

                const total = Number(
                    (acumulados.get(tecnico.id) || 0).toFixed(2)
                );

                totalGeneral += total;

                const fila = adminSummaryTableBody.insertRow();

                crearCelda(fila, tecnico.nombre_completo);
                crearCelda(fila, tecnico.usuario);

                const celdaTotal = crearCelda(
                    fila,
                    formatearHoras(total)
                );

                celdaTotal.classList.add("hours-total-cell");
                celdaTotal.classList.add(obtenerClaseHoras(total));
            });
        }

        adminSummaryTotal.textContent = formatearHoras(totalGeneral);

        adminSummaryTotal.className =
            `hours-total-cell ${obtenerClaseHoras(totalGeneral)}`;

    } catch (error) {

        console.error(
            "Error al generar resumen del administrador:",
            error
        );

        adminSummaryTableBody.innerHTML = "";

        const fila = adminSummaryTableBody.insertRow();

        crearCelda(
            fila,
            "No se pudo cargar el resumen mensual."
        ).colSpan = 3;

        adminSummaryTotal.textContent = "0.00 h";
    }
}


// =========================================
// RESUMEN MENSUAL DEL TÉCNICO
// =========================================

async function cargarResumenTecnico() {

    const mesSeleccionado = technicianSummaryMonthInput.value;

    if (!mesSeleccionado || !usuarioActual) {
        return;
    }

    technicianHoursTotalValue.textContent = "Calculando...";

    try {

        const registrosMes = await obtenerRegistrosDelMes(mesSeleccionado);

        let total = 0;

        registrosMes.forEach(function (registro) {

            if (registro.tecnico_id === usuarioActual.id) {

                total += Number(registro.total_horas || 0);
            }
        });

        total = Number(total.toFixed(2));

        technicianHoursTotalValue.textContent =
            formatearHoras(total);

        technicianHoursTotal.className =
            `hours-total-box ${obtenerClaseHoras(total)}`;

    } catch (error) {

        console.error(
            "Error cargando el resumen del técnico:",
            error
        );

        technicianHoursTotalValue.textContent = "No disponible";

        technicianHoursTotal.className =
            "hours-total-box";
    }
}


// =========================================
// ACTUALIZAR RESÚMENES
// =========================================

async function actualizarResumenHoras() {

    if (!perfilActual) {
        return;
    }

    if (perfilActual.rol === "administrador") {

        await cargarResumenAdministrador();

    } else if (perfilActual.rol === "tecnico") {

        await cargarResumenTecnico();
    }
}


// =========================================
// CALCULAR PLAZO DEL CASO
// =========================================

function calcularFechaLimite(fechaGeneracion) {

    if (!fechaGeneracion) {
        return null;
    }

    const [anio, mes, dia] = fechaGeneracion.split("-").map(Number);

    return new Date(anio, mes - 1, dia + 2);
}


function calcularInicioVencimiento(fechaGeneracion) {

    if (!fechaGeneracion) {
        return null;
    }

    const [anio, mes, dia] = fechaGeneracion.split("-").map(Number);

    return new Date(anio, mes - 1, dia + 3);
}


function convertirFechaISO(fecha) {

    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}


function actualizarMensajePlazo() {

    const fechaGeneracion = caseGenerationDateInput.value;

    hoursDeadlineMessage.textContent = "";

    if (!fechaGeneracion) {
        return;
    }

    const hoy = obtenerFechaLocal();

    if (fechaGeneracion > hoy) {

        mostrarMensaje(
            hoursDeadlineMessage,
            "La fecha de generación del caso no puede ser futura."
        );

        return;
    }

    const fechaLimite = calcularFechaLimite(fechaGeneracion);
    const fechaBloqueo = calcularInicioVencimiento(fechaGeneracion);

    const fechaLimiteTexto = fechaLimite.toLocaleDateString("es-EC");

    if (perfilActual?.rol === "administrador") {

        mostrarMensaje(
            hoursDeadlineMessage,
            `Fecha límite ordinaria: ${fechaLimiteTexto}. Como administrador puede registrar el caso incluso si está vencido.`,
            "info"
        );

        return;
    }

    const bloqueoISO = convertirFechaISO(fechaBloqueo);

    if (hoy >= bloqueoISO) {

        mostrarMensaje(
            hoursDeadlineMessage,
            `El plazo para este caso ha vencido. La fecha límite fue ${fechaLimiteTexto}. Solicite al administrador que realice el registro.`
        );

        return;
    }

    mostrarMensaje(
        hoursDeadlineMessage,
        `Puede registrar este caso hasta el ${fechaLimiteTexto}, a las 23:59.`,
        "info"
    );
}


caseGenerationDateInput.addEventListener(
    "change",
    actualizarMensajePlazo
);


// =========================================
// CARGAR TÉCNICOS
// =========================================

async function cargarTecnicos() {

    techniciansTableBody.textContent = "";

    const { data: tecnicos, error } = await supabase
        .from("perfiles")
        .select("id, nombre_completo, usuario, activo")
        .eq("rol", "tecnico")
        .order("nombre_completo", { ascending: true });

    if (error) {

        console.error("Error consultando técnicos:", error);

        const fila = document.createElement("tr");

        crearCelda(
            fila,
            "No se pudieron cargar los técnicos."
        ).colSpan = 4;

        techniciansTableBody.appendChild(fila);

        return;
    }

    tecnicosCargados = tecnicos || [];

    if (tecnicosCargados.length === 0) {

        const fila = document.createElement("tr");

        crearCelda(
            fila,
            "Todavía no hay técnicos registrados."
        ).colSpan = 4;

        techniciansTableBody.appendChild(fila);

        return;
    }

    tecnicosCargados.forEach(function (tecnico) {

        const fila = document.createElement("tr");

        crearCelda(fila, tecnico.nombre_completo);
        crearCelda(fila, tecnico.usuario);
        crearCelda(fila, tecnico.activo ? "Activo" : "Inactivo");
        crearCelda(fila, "Próximamente");

        techniciansTableBody.appendChild(fila);
    });

    actualizarFiltroTecnicos();
}


// =========================================
// CARGAR TÉCNICOS PARA EL FORMULARIO
// =========================================

async function cargarTecnicosParaRegistro() {

    hoursTechnicianSelect.innerHTML =
        '<option value="">Seleccione un técnico</option>';

    const { data: tecnicos, error } = await supabase
        .from("perfiles")
        .select("id, nombre_completo, usuario")
        .eq("rol", "tecnico")
        .eq("activo", true)
        .order("nombre_completo", { ascending: true });

    if (error) {

        console.error(
            "Error cargando técnicos para registro:",
            error
        );

        mostrarMensaje(
            hoursMessage,
            "No se pudo cargar la lista de técnicos."
        );

        return false;
    }

    (tecnicos || []).forEach(function (tecnico) {

        const opcion = document.createElement("option");

        opcion.value = tecnico.id;

        opcion.textContent =
            `${tecnico.nombre_completo} (${tecnico.usuario})`;

        hoursTechnicianSelect.appendChild(opcion);
    });

    return true;
}


// =========================================
// FILTRO DE TÉCNICOS EN LOS REGISTROS
// =========================================

function actualizarFiltroTecnicos() {

    if (perfilActual?.rol !== "administrador") {
        return;
    }

    const valorAnterior = hoursTechnicianFilter.value;

    hoursTechnicianFilter.innerHTML =
        '<option value="">Todos los técnicos</option>';

    tecnicosCargados.forEach(function (tecnico) {

        const opcion = document.createElement("option");

        opcion.value = tecnico.id;

        opcion.textContent =
            `${tecnico.nombre_completo} (${tecnico.usuario})`;

        hoursTechnicianFilter.appendChild(opcion);
    });

    if (
        valorAnterior &&
        tecnicosCargados.some(tecnico => tecnico.id === valorAnterior)
    ) {
        hoursTechnicianFilter.value = valorAnterior;
    }
}


// =========================================
// FORMULARIO DE TÉCNICOS
// =========================================

showTechnicianFormButton.addEventListener("click", function () {

    technicianFormContainer.hidden = false;
    technicianMessage.textContent = "";

    technicianNameInput.focus();
});


cancelTechnicianButton.addEventListener("click", function () {

    technicianForm.reset();

    technicianFormContainer.hidden = true;
    technicianMessage.textContent = "";
});


// =========================================
// REGISTRAR NUEVO TÉCNICO
// =========================================

technicianForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const nombre_completo = technicianNameInput.value.trim();

    const usuario = technicianUsernameInput.value
        .trim()
        .toLowerCase();

    if (!nombre_completo || !usuario) {

        mostrarMensaje(
            technicianMessage,
            "Complete todos los campos."
        );

        return;
    }

    saveTechnicianButton.disabled = true;
    saveTechnicianButton.textContent = "Registrando...";

    mostrarMensaje(
        technicianMessage,
        "Creando cuenta del técnico...",
        "info"
    );

    try {

        const { data, error } = await supabase.functions.invoke(
            "crear-tecnico",
            {
                body: {
                    nombre_completo,
                    usuario
                }
            }
        );

        if (error) {

            throw new Error(
                data?.error ||
                error.message ||
                "No se pudo completar el registro."
            );
        }

        if (!data || !data.password_temporal) {

            throw new Error(
                data?.error ||
                "No se recibió la contraseña temporal."
            );
        }

        mostrarMensaje(
            technicianMessage,
            `Técnico registrado correctamente. Usuario: ${data.usuario} | Contraseña temporal: ${data.password_temporal} | Debe cambiarla en su primer ingreso.`,
            "success"
        );

        technicianForm.reset();

        await cargarTecnicos();
        await cargarTecnicosParaRegistro();
        await actualizarResumenHoras();

    } catch (error) {

        console.error("Error durante el registro:", error);

        mostrarMensaje(
            technicianMessage,
            error.message ||
            "Ocurrió un error al registrar el técnico."
        );

    } finally {

        saveTechnicianButton.disabled = false;
        saveTechnicianButton.textContent = "Registrar técnico";
    }
});


// =========================================
// CAMBIO OBLIGATORIO DE CONTRASEÑA
// =========================================

changePasswordForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const nuevaClave = newPasswordInput.value;
    const confirmarClave = confirmPasswordInput.value;

    if (nuevaClave !== confirmarClave) {

        mostrarMensaje(
            passwordChangeMessage,
            "Las contraseñas no coinciden."
        );

        return;
    }

    const claveValida =
        nuevaClave.length >= 10 &&
        nuevaClave.length <= 128 &&
        /[a-z]/.test(nuevaClave) &&
        /[A-Z]/.test(nuevaClave) &&
        /[0-9]/.test(nuevaClave) &&
        /[^a-zA-Z0-9]/.test(nuevaClave);

    if (!claveValida) {

        mostrarMensaje(
            passwordChangeMessage,
            "La contraseña debe tener al menos 10 caracteres, una mayúscula, una minúscula, un número y un símbolo."
        );

        return;
    }

    changePasswordButton.disabled = true;
    changePasswordButton.textContent = "Actualizando...";

    passwordChangeMessage.textContent = "";

    try {

        const { data, error } = await supabase.functions.invoke(
            "cambiar-clave",
            {
                body: {
                    password: nuevaClave
                }
            }
        );

        if (error) {

            throw new Error(
                data?.error ||
                error.message ||
                "No se pudo actualizar la contraseña."
            );
        }

        if (!data || !data.mensaje) {

            throw new Error(
                data?.error ||
                "No se recibió confirmación de Supabase."
            );
        }

        changePasswordForm.reset();

        mostrarMensaje(
            passwordChangeMessage,
            "Contraseña actualizada correctamente.",
            "success"
        );

        await mostrarPanel();

    } catch (error) {

        console.error(
            "Error durante el cambio de contraseña:",
            error
        );

        mostrarMensaje(
            passwordChangeMessage,
            error.message ||
            "Ocurrió un error al cambiar la contraseña."
        );

    } finally {

        changePasswordButton.disabled = false;
        changePasswordButton.textContent = "Cambiar contraseña";
    }
});


// =========================================
// CONFIGURAR MÓDULO SEGÚN EL ROL
// =========================================

async function configurarModuloHoras() {

    hoursModule.hidden = false;

    if (perfilActual.rol === "tecnico") {

        hoursFormContainer.hidden = false;

        technicianSelectContainer.hidden = true;
        hoursTechnicianSelect.required = false;

        adminHoursSummary.hidden = true;
        technicianHoursSummary.hidden = false;

        hoursTechnicianFilterContainer.hidden = true;

        hoursModuleDescription.textContent =
            "Registre sus actividades y horas extras. El plazo se calcula desde la fecha de generación del caso.";

        hoursListTitle.textContent =
            "Mis registros de horas extras";

        activityDateInput.value = obtenerFechaLocal();

        technicianSummaryMonthInput.value = obtenerMesActual();

    } else if (perfilActual.rol === "administrador") {

        hoursFormContainer.hidden = false;

        technicianSelectContainer.hidden = false;
        hoursTechnicianSelect.required = true;

        adminHoursSummary.hidden = false;
        technicianHoursSummary.hidden = true;

        hoursTechnicianFilterContainer.hidden = false;

        hoursModuleDescription.textContent =
            "Puede registrar horas extras a nombre de cualquier técnico activo, incluso cuando el plazo ordinario del caso haya vencido.";

        hoursListTitle.textContent =
            "Registros de todos los técnicos";

        activityDateInput.value = obtenerFechaLocal();

        summaryMonthInput.value = obtenerMesActual();

        await cargarTecnicosParaRegistro();

    } else {

        hoursModule.hidden = true;
        hoursFormContainer.hidden = true;
    }

    actualizarMensajePlazo();

    console.log("Rol detectado:", perfilActual.rol);

    console.log(
        "Formulario de horas visible:",
        !hoursFormContainer.hidden
    );
}


// =========================================
// EVENTOS DE LOS RESÚMENES
// =========================================

summaryMonthInput.addEventListener("change", async function () {

    await cargarResumenAdministrador();
});


technicianSummaryMonthInput.addEventListener("change", async function () {

    await cargarResumenTecnico();
});


// =========================================
// EVENTO DEL FILTRO DE TÉCNICOS
// =========================================

hoursTechnicianFilter.addEventListener("change", function () {

    mostrarRegistrosEnTabla();
});


// =========================================
// EDITAR REGISTRO
// =========================================

async function iniciarEdicionRegistro(registro) {

    const esAdministrador =
        perfilActual?.rol === "administrador";

    const esTecnico =
        perfilActual?.rol === "tecnico";

    if (!esAdministrador && !esTecnico) {
        return;
    }

    // El técnico solo puede editar sus propios registros
    // registrados y que todavía no hayan sido revisados.
    if (
        esTecnico &&
        (
            registro.tecnico_id !== usuarioActual.id ||
            registro.estado !== "registrada" ||
            registro.revisado === true
        )
    ) {

        mostrarMensaje(
            hoursMessage,
            "No tiene permisos para editar este registro."
        );

        return;
    }

    registroEnEdicion = registro;

    // Cargar los datos del registro en el formulario.
    caseNumberInput.value = registro.numero_caso || "";
    caseGenerationDateInput.value =
        registro.fecha_generacion_caso || "";

    activityDateInput.value =
        registro.fecha_actividad || "";

    startTimeInput.value =
        String(registro.hora_inicio || "").slice(0, 5);

    endTimeInput.value =
        String(registro.hora_fin || "").slice(0, 5);

    activityDescriptionInput.value =
        registro.actividad || "";

    activityObservationsInput.value =
        registro.observaciones || "";

    // El administrador puede cambiar el técnico destinatario.
    if (esAdministrador) {

        const tecnicoExiste = Array.from(
            hoursTechnicianSelect.options
        ).some(opcion => opcion.value === registro.tecnico_id);

        // Si el técnico está inactivo, se agrega temporalmente
        // para permitir editar su registro.
        if (!tecnicoExiste) {

            const opcion = document.createElement("option");

            opcion.value = registro.tecnico_id;

            opcion.textContent =
                nombresUsuarios.get(registro.tecnico_id) ||
                "Técnico del registro";

            hoursTechnicianSelect.appendChild(opcion);
        }

        hoursTechnicianSelect.value = registro.tecnico_id;
    }

    saveHoursButton.textContent = "Guardar cambios";

    prepararBotonCancelarEdicion();

    cancelEditButton.hidden = false;

    actualizarMensajePlazo();

    mostrarMensaje(
        hoursMessage,
        `Editando el registro del caso ${registro.numero_caso || "sin número"}.`,
        "info"
    );

    hoursFormContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// =========================================
// CANCELAR EDICIÓN
// =========================================

function cancelarEdicionRegistro() {

    restablecerFormularioHoras();

    mostrarMensaje(
        hoursMessage,
        "Edición cancelada. El registro original no fue modificado.",
        "info"
    );
}


// =========================================
// ELIMINAR REGISTRO
// =========================================

async function eliminarRegistro(registro) {

    const esAdministrador =
        perfilActual?.rol === "administrador";

    const esTecnico =
        perfilActual?.rol === "tecnico";

    if (!esAdministrador && !esTecnico) {
        return;
    }

    // El técnico solo puede eliminar sus propios registros
    // registrados y que todavía no hayan sido revisados.
    if (
        esTecnico &&
        (
            registro.tecnico_id !== usuarioActual.id ||
            registro.estado !== "registrada" ||
            registro.revisado === true
        )
    ) {

        mostrarMensaje(
            hoursMessage,
            "No tiene permisos para eliminar este registro."
        );

        return;
    }

    const confirmacion = confirm(
        `¿Está seguro de eliminar el registro del caso ${registro.numero_caso || "sin número"}?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) {
        return;
    }

    try {

        mostrarMensaje(
            hoursMessage,
            "Eliminando registro...",
            "info"
        );

        let consulta = supabase
            .from("registros_horas_extras")
            .delete()
            .eq("id", registro.id);

        // Filtro adicional de seguridad para el técnico.
        if (esTecnico) {

            consulta = consulta
                .eq("tecnico_id", usuarioActual.id)
                .eq("estado", "registrada")
                .eq("revisado", false);
        }

        const { data, error } = await consulta
            .select("id");

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {

            throw new Error(
                "No se eliminó el registro. Verifique sus permisos o si el registro ya fue eliminado."
            );
        }

        // Si se estaba editando el registro eliminado, limpiar formulario.
        if (registroEnEdicion?.id === registro.id) {

            restablecerFormularioHoras();
        }

        await cargarRegistrosHoras();

        await actualizarResumenHoras();

        mostrarMensaje(
            hoursMessage,
            `El registro del caso ${registro.numero_caso || "sin número"} fue eliminado correctamente.`,
            "success"
        );

    } catch (error) {

        console.error(
            "Error eliminando registro:",
            error
        );

        mostrarMensaje(
            hoursMessage,
            error.message ||
            "No se pudo eliminar el registro."
        );
    }
}


// =========================================
// REVISAR REGISTRO
// =========================================

async function revisarRegistro(registro) {

    // Esta función solo puede ejecutarla el administrador.
    if (perfilActual?.rol !== "administrador") {
        return;
    }

    if (registro.revisado === true) {

        mostrarMensaje(
            hoursMessage,
            "Este registro ya fue revisado.",
            "info"
        );

        return;
    }

    const confirmacion = confirm(
        `¿Confirma que desea marcar como revisado el registro del caso ${registro.numero_caso || "sin número"}?`
    );

    if (!confirmacion) {
        return;
    }

    try {

        mostrarMensaje(
            hoursMessage,
            "Procesando revisión...",
            "info"
        );

        const { data, error } = await supabase
            .from("registros_horas_extras")
            .update({
                revisado: true
            })
            .eq("id", registro.id)
            .eq("revisado", false)
            .select("id")
            .single();

        if (error) {
            throw error;
        }

        if (!data?.id) {

            throw new Error(
                "No se pudo confirmar la revisión del registro."
            );
        }

        await cargarRegistrosHoras();

        mostrarMensaje(
            hoursMessage,
            `El registro del caso ${registro.numero_caso || "sin número"} fue revisado correctamente.`,
            "success"
        );

    } catch (error) {

        console.error(
            "Error revisando registro:",
            error
        );

        mostrarMensaje(
            hoursMessage,
            error.message || "No se pudo revisar el registro."
        );
    }
}


// =========================================
// REGISTRAR O ACTUALIZAR HORAS EXTRAS
// =========================================

hoursForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (!usuarioActual || !perfilActual) {

        mostrarMensaje(
            hoursMessage,
            "No se pudo verificar el usuario actual."
        );

        return;
    }

    const esAdministrador =
        perfilActual.rol === "administrador";

    const esTecnico =
        perfilActual.rol === "tecnico";

    const estaEditando = registroEnEdicion !== null;

    if (!esAdministrador && !esTecnico) {

        mostrarMensaje(
            hoursMessage,
            "No tiene permisos para registrar horas extras."
        );

        return;
    }

    // Verificar nuevamente los permisos de edición.
    if (estaEditando) {

        if (
            esTecnico &&
            (
                registroEnEdicion.tecnico_id !== usuarioActual.id ||
                registroEnEdicion.estado !== "registrada" ||
                registroEnEdicion.revisado === true
            )
        ) {

            mostrarMensaje(
                hoursMessage,
                "No tiene permisos para modificar este registro."
            );

            return;
        }
    }

    const numeroCaso = caseNumberInput.value.trim();
    const fechaGeneracion = caseGenerationDateInput.value;

    const fechaActividad = activityDateInput.value;
    const horaInicio = startTimeInput.value;
    const horaFin = endTimeInput.value;
    const actividad = activityDescriptionInput.value.trim();
    const observaciones = activityObservationsInput.value.trim();

    const tecnicoId = esAdministrador
        ? hoursTechnicianSelect.value
        : usuarioActual.id;

    if (
        !numeroCaso ||
        !fechaGeneracion ||
        !fechaActividad ||
        !horaInicio ||
        !horaFin ||
        !actividad ||
        !tecnicoId
    ) {

        mostrarMensaje(
            hoursMessage,
            "Complete todos los campos obligatorios."
        );

        return;
    }

    const hoy = obtenerFechaLocal();

    if (fechaGeneracion > hoy) {

        mostrarMensaje(
            hoursMessage,
            "La fecha de generación del caso no puede ser futura."
        );

        return;
    }

    // Validación del plazo para nuevos registros de técnicos.
    // Al editar se permite modificar un registro ya existente,
    // aunque el plazo original haya vencido.
    if (esTecnico && !estaEditando) {

        const fechaBloqueo =
            calcularInicioVencimiento(fechaGeneracion);

        const bloqueoISO =
            convertirFechaISO(fechaBloqueo);

        if (hoy >= bloqueoISO) {

            mostrarMensaje(
                hoursMessage,
                "El plazo para registrar este caso ha vencido. Solicite al administrador que realice el registro."
            );

            return;
        }
    }

    const totalHoras = calcularHoras(horaInicio, horaFin);

    if (totalHoras <= 0) {

        mostrarMensaje(
            hoursMessage,
            "La hora de finalización debe ser diferente a la hora de inicio."
        );

        return;
    }

    if (totalHoras > 24) {

        mostrarMensaje(
            hoursMessage,
            "El tiempo registrado no puede superar 24 horas."
        );

        return;
    }

    saveHoursButton.disabled = true;

    saveHoursButton.textContent = estaEditando
        ? "Actualizando..."
        : "Guardando...";

    mostrarMensaje(
        hoursMessage,
        estaEditando
            ? "Actualizando registro..."
            : "Guardando registro...",
        "info"
    );

    try {

        const nuevoRegistro = {

            tecnico_id: tecnicoId,

            numero_caso: numeroCaso,
            fecha_generacion_caso: fechaGeneracion,

            fecha_actividad: fechaActividad,
            hora_inicio: horaInicio,
            hora_fin: horaFin,
            total_horas: totalHoras,

            tipo_jornada: registroEnEdicion?.tipo_jornada ||
                "fuera_horario",

            actividad,
            ubicacion: registroEnEdicion?.ubicacion || null,
            observaciones: observaciones || null,

            // Conservar el estado original al editar.
            estado: estaEditando
                ? registroEnEdicion.estado
                : "registrada"
        };

        if (estaEditando) {

            // =====================================
            // ACTUALIZAR REGISTRO EXISTENTE
            // =====================================

            let consulta = supabase
                .from("registros_horas_extras")
                .update(nuevoRegistro)
                .eq("id", registroEnEdicion.id);

            // Seguridad adicional para el técnico.
            if (esTecnico) {

                consulta = consulta
                    .eq("tecnico_id", usuarioActual.id)
                    .eq("estado", "registrada")
                    .eq("revisado", false);
            }

            const { data: registroActualizado, error } = await consulta
                .select("id")
                .single();

            if (error) {
                throw error;
            }

            if (!registroActualizado?.id) {

                throw new Error(
                    "No se recibió confirmación de la actualización."
                );
            }

            restablecerFormularioHoras();

            await cargarRegistrosHoras();

            await actualizarResumenHoras();

            mostrarMensaje(
                hoursMessage,
                `El registro del caso ${numeroCaso} fue actualizado correctamente. No se generaron notificaciones nuevas.`,
                "success"
            );

        } else {

            // =====================================
            // INSERTAR NUEVO REGISTRO
            // =====================================

            const { data: registroGuardado, error } = await supabase
                .from("registros_horas_extras")
                .insert(nuevoRegistro)
                .select("id")
                .single();

            if (error) {
                throw error;
            }

            if (!registroGuardado?.id) {

                throw new Error(
                    "El registro se guardó, pero no se recibió su identificador."
                );
            }

            // Procesar las notificaciones solamente
            // cuando se crea un registro nuevo.
            const respuestaAlertas = await supabase.functions.invoke(
                "procesar-alertas-horas",
                {
                    body: {
                        registro_id: registroGuardado.id
                    }
                }
            );

            const resultadoAlertas = respuestaAlertas.data;
            const errorProcesamientoAlertas = respuestaAlertas.error;

            restablecerFormularioHoras();

            await cargarRegistrosHoras();

            await actualizarResumenHoras();

            if (errorProcesamientoAlertas) {

                console.error(
                    "El registro se guardó, pero no se procesaron las alertas:",
                    errorProcesamientoAlertas
                );

                mostrarMensaje(
                    hoursMessage,
                    `El registro ${numeroCaso} se guardó correctamente con ${totalHoras.toFixed(2)} horas, pero no se pudieron procesar las notificaciones. Informe al administrador.`,
                    "info"
                );

            } else if (resultadoAlertas?.success === true) {

                let mensajeFinal =
                    `Registro guardado correctamente. Caso: ${numeroCaso}. Total: ${totalHoras.toFixed(2)} horas.`;

                if (
                    esAdministrador &&
                    resultadoAlertas.telegram
                ) {

                    if (
                        typeof resultadoAlertas.telegram.enviados === "number"
                    ) {

                        mensajeFinal +=
                            ` Mensajes de Telegram enviados: ${resultadoAlertas.telegram.enviados}.`;

                        if (resultadoAlertas.telegram.errores > 0) {

                            mensajeFinal +=
                                ` Mensajes con error: ${resultadoAlertas.telegram.errores}.`;
                        }

                    } else if (
                        typeof resultadoAlertas.telegram === "string"
                    ) {

                        mensajeFinal +=
                            ` Telegram: ${resultadoAlertas.telegram}`;
                    }
                }

                mostrarMensaje(
                    hoursMessage,
                    mensajeFinal,
                    "success"
                );

                console.log(
                    "Resultado del procesamiento de alertas:",
                    resultadoAlertas
                );

            } else {

                console.error(
                    "Respuesta inesperada al procesar alertas:",
                    resultadoAlertas
                );

                mostrarMensaje(
                    hoursMessage,
                    `El registro ${numeroCaso} se guardó, pero no se recibió una confirmación válida del procesamiento de alertas.`,
                    "info"
                );
            }
        }

    } catch (error) {

        console.error(
            "Error guardando o actualizando horas extras:",
            error
        );

        mostrarMensaje(
            hoursMessage,
            error.message ||
            "No se pudo completar la operación."
        );

    } finally {

        saveHoursButton.disabled = false;

        saveHoursButton.textContent = registroEnEdicion
            ? "Guardar cambios"
            : "Registrar horas extras";
    }
});


// =========================================
// BOTÓN LIMPIAR FORMULARIO
// =========================================

if (resetHoursButton) {

    resetHoursButton.addEventListener("click", function () {

        registroEnEdicion = null;

        saveHoursButton.textContent = "Registrar horas extras";

        if (cancelEditButton) {
            cancelEditButton.hidden = true;
        }

        hoursMessage.textContent = "";
        hoursDeadlineMessage.textContent = "";

        // Esperar a que el navegador termine el reset nativo.
        setTimeout(function () {

            activityDateInput.value = obtenerFechaLocal();

        }, 0);
    });
}


// =========================================
// CARGAR REGISTROS DE HORAS EXTRAS
// =========================================

async function cargarRegistrosHoras() {

    hoursTableBody.textContent = "";

    const { data: registros, error } = await supabase
        .from("registros_horas_extras")
        .select(`
            id,
            tecnico_id,
            registrado_por,
            numero_caso,
            fecha_generacion_caso,
            fecha_actividad,
            hora_inicio,
            hora_fin,
            total_horas,
            tipo_jornada,
            ubicacion,
            actividad,
            observaciones,
            estado,
            revisado
        `)
        .order("fecha_actividad", { ascending: false })
        .order("hora_inicio", { ascending: false });

    if (error) {

        console.error(
            "Error consultando registros:",
            error
        );

        const fila = document.createElement("tr");

        crearCelda(
            fila,
            "No se pudieron cargar los registros."
        ).colSpan = 12;

        hoursTableBody.appendChild(fila);

        return;
    }

    registrosCargados = registros || [];

    if (registrosCargados.length === 0) {

        nombresUsuarios.clear();

        const fila = document.createElement("tr");

        const mensaje = perfilActual.rol === "tecnico"
            ? "Todavía no tienes registros de horas extras."
            : "Todavía no existen registros de horas extras.";

        crearCelda(fila, mensaje).colSpan = 12;

        hoursTableBody.appendChild(fila);

        return;
    }

    const idsUsuarios = [
        ...new Set(
            registrosCargados.flatMap(registro => [
                registro.tecnico_id,
                registro.registrado_por
            ]).filter(Boolean)
        )
    ];

    const { data: perfiles, error: errorPerfiles } = await supabase
        .from("perfiles")
        .select("id, nombre_completo, usuario")
        .in("id", idsUsuarios);

    if (errorPerfiles) {

        console.error(
            "Error consultando perfiles:",
            errorPerfiles
        );
    }

    nombresUsuarios = new Map();

    (perfiles || []).forEach(function (perfil) {

        nombresUsuarios.set(
            perfil.id,
            perfil.nombre_completo
        );
    });

    mostrarRegistrosEnTabla();
}


// =========================================
// MOSTRAR REGISTROS EN LA TABLA
// =========================================

function mostrarRegistrosEnTabla() {

    prepararColumnaAcciones();

    hoursTableBody.innerHTML = "";

    let registros = [...registrosCargados];

    // El técnico solo visualiza sus propios registros.
    if (perfilActual?.rol === "tecnico") {

        registros = registros.filter(function (registro) {

            return registro.tecnico_id === usuarioActual.id;
        });
    }

    // El administrador puede filtrar por técnico.
    if (perfilActual?.rol === "administrador") {

        const tecnicoSeleccionado = hoursTechnicianFilter.value;

        if (tecnicoSeleccionado) {

            registros = registros.filter(function (registro) {

                return registro.tecnico_id === tecnicoSeleccionado;
            });
        }
    }

    if (registros.length === 0) {

        const fila = document.createElement("tr");

        const mensaje = perfilActual?.rol === "tecnico"
            ? "Todavía no tienes registros de horas extras."
            : "No hay registros para el técnico seleccionado.";

        crearCelda(fila, mensaje).colSpan = 12;

        hoursTableBody.appendChild(fila);

        return;
    }

    registros.forEach(function (registro) {

        const fila = document.createElement("tr");

        crearCelda(fila, registro.numero_caso || "—");

        crearCelda(
            fila,
            formatearFecha(registro.fecha_generacion_caso)
        );

        crearCelda(
            fila,
            formatearFecha(registro.fecha_actividad)
        );

        crearCelda(
            fila,
            nombresUsuarios.get(registro.tecnico_id) ||
            "No disponible"
        );

        crearCelda(
            fila,
            `${String(registro.hora_inicio).slice(0, 5)} - ${String(registro.hora_fin).slice(0, 5)}`
        );

        crearCelda(
            fila,
            `${Number(registro.total_horas).toFixed(2)} h`
        );

        crearCelda(
            fila,
            registro.actividad || "—"
        );

        crearCelda(
            fila,
            registro.observaciones || "—"
        );

        crearCelda(
            fila,
            nombresUsuarios.get(registro.registrado_por) ||
            "No disponible"
        );

        crearCelda(
            fila,
            registro.estado || "—"
        );

        // =====================================
        // ESTADO DE REVISIÓN
        // =====================================

        crearCelda(
            fila,
            registro.revisado === true
                ? "Revisada"
                : "Pendiente"
        );

        // =====================================
        // BOTONES DE ACCIONES
        // =====================================

        const celdaAcciones = document.createElement("td");

        const esAdministrador =
            perfilActual?.rol === "administrador";

        const esTecnicoPropietario =
            perfilActual?.rol === "tecnico" &&
            registro.tecnico_id === usuarioActual.id;

        const puedeModificar =
            esAdministrador ||
            (
                esTecnicoPropietario &&
                registro.estado === "registrada" &&
                registro.revisado !== true
            );

        // El administrador puede revisar cualquier registro
        // que todavía esté pendiente de revisión.
        if (esAdministrador && registro.revisado !== true) {

            const botonRevisar = document.createElement("button");

            botonRevisar.type = "button";
            botonRevisar.textContent = "Revisar";
            botonRevisar.className = "action-button edit-button";

            botonRevisar.addEventListener("click", function () {

                revisarRegistro(registro);
            });

            celdaAcciones.appendChild(botonRevisar);
        }

        // El administrador conserva Editar y Eliminar,
        // incluso después de marcar un registro como revisado.
        if (puedeModificar) {

            const botonEditar = document.createElement("button");

            botonEditar.type = "button";
            botonEditar.textContent = "Editar";
            botonEditar.className = "action-button edit-button";

            botonEditar.addEventListener("click", function () {

                iniciarEdicionRegistro(registro);
            });

            celdaAcciones.appendChild(botonEditar);

            const botonEliminar = document.createElement("button");

            botonEliminar.type = "button";
            botonEliminar.textContent = "Eliminar";
            botonEliminar.className = "action-button delete-button";

            botonEliminar.addEventListener("click", function () {

                eliminarRegistro(registro);
            });

            celdaAcciones.appendChild(botonEliminar);
        }

        if (celdaAcciones.children.length === 0) {

            celdaAcciones.textContent = "—";
        }

        fila.appendChild(celdaAcciones);

        hoursTableBody.appendChild(fila);
    });
}


// =========================================
// MOSTRAR EL PANEL DEL USUARIO
// =========================================

async function mostrarPanel() {

    const { data: userData, error: userError } =
        await supabase.auth.getUser();

    if (userError || !userData.user) {

        console.error(
            "Error obteniendo usuario:",
            userError
        );

        await supabase.auth.signOut();

        usuarioActual = null;
        perfilActual = null;

        mostrarLogin();

        return;
    }

    usuarioActual = userData.user;

    const { data: perfil, error: perfilError } = await supabase
        .from("perfiles")
        .select("nombre_completo, rol, activo, debe_cambiar_clave")
        .eq("id", usuarioActual.id)
        .single();

    if (perfilError || !perfil || !perfil.activo) {

        console.error(
            "Error consultando perfil:",
            perfilError
        );

        await supabase.auth.signOut();

        usuarioActual = null;
        perfilActual = null;

        mostrarLogin();

        loginMessage.textContent =
            "No se pudo verificar el perfil o la cuenta está inactiva.";

        return;
    }

    perfilActual = perfil;

    if (perfil.debe_cambiar_clave) {

        loginContainer.hidden = true;
        dashboardContainer.hidden = true;
        changePasswordContainer.hidden = false;

        passwordChangeMessage.textContent =
            "Debe cambiar su contraseña para continuar.";

        return;
    }

    changePasswordContainer.hidden = true;

    welcomeName.textContent =
        `Bienvenido, ${perfil.nombre_completo}`;

    welcomeRole.textContent =
        perfil.rol === "administrador"
            ? "Rol: Administrador"
            : "Rol: Técnico";

    loginContainer.hidden = true;
    dashboardContainer.hidden = false;

    const dashboardSubtitle =
        dashboardContainer.querySelector(".dashboard-header p");

    dashboardSubtitle.textContent =
        perfil.rol === "administrador"
            ? "Panel de administración"
            : "Panel del técnico";

    if (perfil.rol === "administrador") {

        technicianManagementSection.hidden = false;

        await cargarTecnicos();

    } else {

        technicianManagementSection.hidden = true;
    }

    prepararColumnaAcciones();

    prepararBotonCancelarEdicion();

    await configurarModuloHoras();

    await cargarRegistrosHoras();

    await actualizarResumenHoras();
}


// =========================================
// MOSTRAR FORMULARIO DE ACCESO
// =========================================

function mostrarLogin() {

    dashboardContainer.hidden = true;
    changePasswordContainer.hidden = true;
    loginContainer.hidden = false;
}


// =========================================
// INICIO DE SESIÓN
// =========================================

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const usuario = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!usuario || !password) {

        loginMessage.textContent =
            "Ingrese su usuario y contraseña.";

        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Verificando...";

    loginMessage.textContent = "";

    try {

        const { data, error } = await supabase.functions.invoke(
            "iniciar-sesion",
            {
                body: {
                    usuario,
                    password
                }
            }
        );

        if (error) {

            throw new Error(
                data?.error ||
                error.message ||
                "No se pudo iniciar sesión."
            );
        }

        if (!data || !data.access_token || !data.refresh_token) {

            throw new Error(
                data?.error ||
                "No se recibió una sesión válida."
            );
        }

        const { error: sessionError } =
            await supabase.auth.setSession({
                access_token: data.access_token,
                refresh_token: data.refresh_token
            });

        if (sessionError) {
            throw sessionError;
        }

        await mostrarPanel();

        passwordInput.value = "";

    } catch (error) {

        console.error(
            "Error de inicio de sesión:",
            error
        );

        loginMessage.textContent =
            error.message ||
            "No se pudo iniciar sesión.";

    } finally {

        loginButton.disabled = false;
        loginButton.textContent = "Iniciar sesión";
    }
});


// =========================================
// CERRAR SESIÓN
// =========================================

logoutButton.addEventListener("click", async function () {

    const { error } = await supabase.auth.signOut();

    if (error) {

        console.error(
            "Error al cerrar sesión:",
            error
        );

        return;
    }

    usuarioActual = null;
    perfilActual = null;

    tecnicosCargados = [];
    registrosCargados = [];
    nombresUsuarios.clear();

    registroEnEdicion = null;

    mostrarLogin();

    loginForm.reset();
    loginMessage.textContent = "";

    technicianForm.reset();

    technicianFormContainer.hidden = true;
    technicianMessage.textContent = "";

    changePasswordForm.reset();
    passwordChangeMessage.textContent = "";

    hoursForm.reset();

    hoursFormContainer.hidden = true;
    hoursModule.hidden = true;

    adminHoursSummary.hidden = true;
    technicianHoursSummary.hidden = true;
    hoursTechnicianFilterContainer.hidden = true;

    hoursMessage.textContent = "";
    hoursDeadlineMessage.textContent = "";
    hoursTableBody.textContent = "";

    saveHoursButton.textContent = "Registrar horas extras";

    if (cancelEditButton) {
        cancelEditButton.hidden = true;
    }

    adminSummaryTableBody.innerHTML = "";
    adminSummaryTotal.textContent = "0.00 h";

    technicianHoursTotalValue.textContent = "0.00 h";

    hoursTechnicianFilter.innerHTML =
        '<option value="">Todos los técnicos</option>';
});


// =========================================
// RESTAURAR SESIÓN AL RECARGAR
// =========================================

async function iniciarAplicacion() {

    console.log(
        "Comprobando si existe una sesión activa..."
    );

    const { data, error } =
        await supabase.auth.getSession();

    if (error) {

        console.error(
            "Error recuperando sesión:",
            error
        );

        return;
    }

    if (data.session) {

        await mostrarPanel();

    } else {

        console.log("No existe una sesión activa.");
    }
}


iniciarAplicacion();
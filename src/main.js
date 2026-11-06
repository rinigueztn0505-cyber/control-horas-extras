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

// Secciones del dashboard
const allTechniciansRecordsSection = document.getElementById("all-technicians-records-section");
const hoursRecordsSection = document.getElementById("hours-records-section");
const newActivitySection = document.getElementById("new-activity-section");
const techniciansListSection = document.getElementById("technicians-list-section");
const technicianManagementSection = document.getElementById("technician-management-section");

// Exportación CSV
const exportAreaFilter = document.getElementById("export-area-filter");
const exportHoursCsvButton = document.getElementById("export-hours-csv-button");
const exportMessage = document.getElementById("export-message");

// Listado general de técnicos y paginación
const techniciansListTableBody = document.getElementById("technicians-list-table-body");
const techniciansPagination = document.getElementById("technicians-pagination");
const techniciansPrevPageButton = document.getElementById("technicians-prev-page");
const techniciansNextPageButton = document.getElementById("technicians-next-page");
const techniciansPageInfo = document.getElementById("technicians-page-info");

// Gestión de técnicos
const techniciansTableBody = document.getElementById("technicians-table-body");
const showTechnicianFormButton = document.getElementById("show-technician-form");
const technicianFormContainer = document.getElementById("technician-form-container");
const technicianForm = document.getElementById("technician-form");
const technicianFormTitle = document.getElementById("technician-form-title");
const technicianNameInput = document.getElementById("technician-name");
const technicianUsernameInput = document.getElementById("technician-username");
const technicianAreaInput = document.getElementById("technician-area");
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

// Resúmenes
const adminHoursSummary = document.getElementById("admin-hours-summary");
const summaryMonthInput = document.getElementById("summary-month");
const summaryAreaFilter = document.getElementById("summary-area-filter");
const adminSummaryTableBody = document.getElementById("admin-summary-table-body");
const adminSummaryTotal = document.getElementById("admin-summary-total");

const technicianHoursSummary = document.getElementById("technician-hours-summary");
const technicianSummaryMonthInput = document.getElementById("technician-summary-month");
const technicianHoursTotal = document.getElementById("technician-hours-total");
const technicianHoursTotalValue = document.getElementById("technician-hours-total-value");

// Filtros de registros
const hoursAreaFilterContainer = document.getElementById("hours-area-filter-container");
const hoursAreaFilter = document.getElementById("hours-area-filter");

const hoursTechnicianFilterContainer = document.getElementById("hours-technician-filter-container");
const hoursTechnicianFilter = document.getElementById("hours-technician-filter");

// =========================================
// ESTADO DE LA APLICACIÓN
// =========================================

let usuarioActual = null;
let perfilActual = null;
let tecnicosCargados = [];
let perfilesExportacion = [];
let registrosCargados = [];
let nombresUsuarios = new Map();
let perfilesCargados = new Map();
let registroEnEdicion = null;
let tecnicoEnEdicion = null;
let cancelEditButton = null;
let paginaTecnicosActual = 1;

const TECNICOS_POR_PAGINA = 15;

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
    if (!elemento) return;
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
    if (!fecha) return "—";
    const [anio, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${anio}`;
}

function convertirHoraAMinutos(hora) {
    if (!hora) return 0;
    const [horas, minutos] = String(hora).slice(0, 5).split(":").map(Number);
    return horas * 60 + minutos;
}

function calcularHoras(inicio, fin) {
    if (!inicio || !fin) return 0;

    const minutosInicio = convertirHoraAMinutos(inicio);
    let minutosFin = convertirHoraAMinutos(fin);

    if (minutosFin < minutosInicio) minutosFin += 24 * 60;

    const diferencia = minutosFin - minutosInicio;
    if (diferencia <= 0) return 0;

    return Number((diferencia / 60).toFixed(2));
}

function escaparCSV(valor) {
    if (valor === null || valor === undefined) valor = "";
    return `"${String(valor).replace(/"/g, '""')}"`;
}

// =========================================
// PREPARAR COLUMNAS DE REVISIÓN Y ACCIONES
// =========================================

function prepararColumnaAcciones() {
    if (!hoursTableBody) return;

    const tabla = hoursTableBody.closest("table");
    const encabezado = tabla?.querySelector("thead tr");
    if (!encabezado) return;

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
        if (columnaAcciones) encabezado.insertBefore(nuevaColumna, columnaAcciones);
        else encabezado.appendChild(nuevaColumna);
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
    if (cancelEditButton || !saveHoursButton) return;

    cancelEditButton = document.createElement("button");
    cancelEditButton.type = "button";
    cancelEditButton.id = "cancel-edit-button";
    cancelEditButton.textContent = "Cancelar edición";
    cancelEditButton.hidden = true;

    cancelEditButton.addEventListener("click", cancelarEdicionRegistro);

    saveHoursButton.insertAdjacentElement("afterend", cancelEditButton);
}

// =========================================
// RESTABLECER FORMULARIO DE HORAS
// =========================================

function restablecerFormularioHoras(mostrarFecha = true) {
    hoursForm.reset();
    registroEnEdicion = null;
    saveHoursButton.textContent = "Registrar horas extras";

    if (cancelEditButton) cancelEditButton.hidden = true;

    hoursMessage.textContent = "";
    hoursDeadlineMessage.textContent = "";

    if (mostrarFecha) activityDateInput.value = obtenerFechaLocal();

    
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
    return { fechaInicio, fechaFin };
}

function obtenerClaseHoras(total) {
    if (total >= 20) return "hours-danger";
    if (total >= 15 && total <= 17) return "hours-warning";
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
        console.error("Error consultando el resumen mensual:", error);
        throw error;
    }

    return data || [];
}


    const mesSeleccionado = summaryMonthInput.value;
    if (!mesSeleccionado) return;

    // Obtener el área seleccionada.
    const areaSeleccionada = summaryAreaFilter?.value || "todos";

    // Filtrar técnicos según el área.
    const tecnicosFiltrados = tecnicosCargados.filter(tecnico => {
        if (areaSeleccionada === "todos") return true;

        return (
            tecnico.area === areaSeleccionada ||
            tecnico.area === "Ambas"
        );
    });

    adminSummaryTableBody.innerHTML = "";
    const filaCarga = adminSummaryTableBody.insertRow();
    crearCelda(filaCarga, "Calculando resumen...").colSpan = 3;

    try {
        const registrosMes = await obtenerRegistrosDelMes(mesSeleccionado);
        const acumulados = new Map();

        // Inicializar el acumulado de cada técnico filtrado.
        tecnicosFiltrados.forEach(tecnico => {
            acumulados.set(tecnico.id, 0);
        });

        // Sumar las horas del mes.
        registrosMes.forEach(registro => {
            if (!acumulados.has(registro.tecnico_id)) return;

            const horasActuales = acumulados.get(registro.tecnico_id) || 0;

            acumulados.set(
                registro.tecnico_id,
                horasActuales + Number(registro.total_horas || 0)
            );
        });

        adminSummaryTableBody.innerHTML = "";
        let totalGeneral = 0;

        if (tecnicosFiltrados.length === 0) {
            const fila = adminSummaryTableBody.insertRow();
            crearCelda(
                fila,
                "No hay técnicos registrados para el área seleccionada."
            ).colSpan = 3;
        } else {
            tecnicosFiltrados.forEach(tecnico => {
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

                celdaTotal.classList.add(
                    "hours-total-cell",
                    obtenerClaseHoras(total)
                );
            });
        }

        // Actualizar el total general según el área seleccionada.
        adminSummaryTotal.textContent = formatearHoras(totalGeneral);

        adminSummaryTotal.className =
            `hours-total-cell ${obtenerClaseHoras(totalGeneral)}`;

    } catch (error) {
        console.error("Error al generar resumen del administrador:", error);

        adminSummaryTableBody.innerHTML = "";
        const fila = adminSummaryTableBody.insertRow();
async function cargarResumenAdministrador() {
    if (!adminSummaryTableBody || !adminSummaryTotal) return;

    const mesSeleccionado = summaryMonthInput.value;
    const areaSeleccionada = summaryAreaFilter?.value || "todos";

    if (!mesSeleccionado) return;

    // Filtrar técnicos según el área seleccionada.
    const tecnicosFiltrados = tecnicosCargados.filter(tecnico => {
        if (areaSeleccionada === "todos") return true;

        return (
            tecnico.area === areaSeleccionada ||
            tecnico.area === "Ambas"
        );
    });

    try {
        const registrosMes = await obtenerRegistrosDelMes(mesSeleccionado);

        const acumulados = new Map();

        tecnicosFiltrados.forEach(tecnico => {
            acumulados.set(tecnico.id, 0);
        });

        registrosMes.forEach(registro => {
            if (!acumulados.has(registro.tecnico_id)) return;

            const horasActuales = acumulados.get(registro.tecnico_id) || 0;

            acumulados.set(
                registro.tecnico_id,
                horasActuales + Number(registro.total_horas || 0)
            );
        });

        adminSummaryTableBody.innerHTML = "";

        let totalGeneral = 0;

        // Obtener las áreas que se mostrarán.
        const areas = areaSeleccionada === "todos"
            ? ["Radio", "WiFi"]
            : [areaSeleccionada];

        areas.forEach(area => {

            const tecnicosArea = tecnicosFiltrados.filter(tecnico => {
                return tecnico.area === area ||
                    tecnico.area === "Ambas";
            });

            // Encabezado del área.
            const filaArea = adminSummaryTableBody.insertRow();
            const celdaArea = crearCelda(filaArea, `ÁREA: ${area}`);

            celdaArea.colSpan = 3;
            celdaArea.classList.add("summary-area-header");

            let subtotalArea = 0;

            if (tecnicosArea.length === 0) {
                const filaVacia = adminSummaryTableBody.insertRow();

                crearCelda(
                    filaVacia,
                    "No hay técnicos registrados en esta área."
                ).colSpan = 3;
            } else {

                tecnicosArea.forEach(tecnico => {

                    const total = Number(
                        (acumulados.get(tecnico.id) || 0).toFixed(2)
                    );

                    subtotalArea += total;

                    const fila = adminSummaryTableBody.insertRow();

                    crearCelda(fila, tecnico.nombre_completo);
                    crearCelda(fila, tecnico.usuario);

                    const celdaTotal = crearCelda(
                        fila,
                        formatearHoras(total)
                    );

                    celdaTotal.classList.add(
                        "hours-total-cell",
                        obtenerClaseHoras(total)
                    );
                });
            }

            // Subtotal del área.
            subtotalArea = Number(subtotalArea.toFixed(2));

            const filaSubtotal = adminSummaryTableBody.insertRow();

            crearCelda(
                filaSubtotal,
                `SUBTOTAL ${area.toUpperCase()}`
            ).colSpan = 2;

            const celdaSubtotal = crearCelda(
                filaSubtotal,
                formatearHoras(subtotalArea)
            );

            celdaSubtotal.classList.add(
                "hours-total-cell",
                obtenerClaseHoras(subtotalArea)
            );

            totalGeneral += subtotalArea;
        });

        // Total general.
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
async function actualizarResumenHoras() {
    if (!perfilActual) return;

    if (perfilActual.rol === "administrador") {
        await cargarResumenAdministrador();
    } else if (perfilActual.rol === "tecnico") {
        await cargarResumenTecnico();
    }
}

// =========================================
// PLAZO DEL CASO
// =========================================

function calcularFechaLimite(fechaGeneracion) {
    if (!fechaGeneracion) return null;
    const [anio, mes, dia] = fechaGeneracion.split("-").map(Number);
    return new Date(anio, mes - 1, dia + 2);
}

function calcularInicioVencimiento(fechaGeneracion) {
    if (!fechaGeneracion) return null;
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
    if (!fechaGeneracion) return;

    const hoy = obtenerFechaLocal();

    if (fechaGeneracion > hoy) {
        mostrarMensaje(hoursDeadlineMessage, "La fecha de generación del caso no puede ser futura.");
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

caseGenerationDateInput.addEventListener("change", actualizarMensajePlazo);

// =========================================
// CARGA DE TÉCNICOS Y PAGINACIÓN
// =========================================

function mostrarErrorTablaTecnicos(mensaje) {
    if (techniciansTableBody) {
        const fila = document.createElement("tr");
        crearCelda(fila, mensaje).colSpan = 5;
        techniciansTableBody.appendChild(fila);
    }

    if (techniciansListTableBody) {
        const fila = document.createElement("tr");
        crearCelda(fila, mensaje).colSpan = 4;
        techniciansListTableBody.appendChild(fila);
    }
}

function mostrarTecnicosPaginados() {
    if (!techniciansListTableBody) return;

    techniciansListTableBody.innerHTML = "";

    const totalTecnicos = tecnicosCargados.length;
    const totalPaginas = Math.max(1, Math.ceil(totalTecnicos / TECNICOS_POR_PAGINA));

    if (paginaTecnicosActual > totalPaginas) paginaTecnicosActual = totalPaginas;

    const inicio = (paginaTecnicosActual - 1) * TECNICOS_POR_PAGINA;
    const tecnicosPagina = tecnicosCargados.slice(inicio, inicio + TECNICOS_POR_PAGINA);

    if (totalTecnicos === 0) {
        const fila = document.createElement("tr");
        crearCelda(fila, "Todavía no hay técnicos registrados.").colSpan = 4;
        techniciansListTableBody.appendChild(fila);
    } else {
        tecnicosPagina.forEach(tecnico => {
            const fila = document.createElement("tr");
            crearCelda(fila, tecnico.nombre_completo);
            crearCelda(fila, tecnico.usuario);
            crearCelda(fila, tecnico.area || "Sin asignar");
            crearCelda(fila, tecnico.activo ? "Activo" : "Inactivo");
            techniciansListTableBody.appendChild(fila);
        });
    }

    if (techniciansPageInfo) {
        techniciansPageInfo.textContent =
            `Página ${paginaTecnicosActual} de ${totalPaginas} | ${totalTecnicos} técnicos`;
    }

    if (techniciansPrevPageButton) {
        techniciansPrevPageButton.disabled = paginaTecnicosActual <= 1;
    }

    if (techniciansNextPageButton) {
        techniciansNextPageButton.disabled = paginaTecnicosActual >= totalPaginas;
    }

    if (techniciansPagination) {
        techniciansPagination.hidden = totalTecnicos <= TECNICOS_POR_PAGINA;
    }
}

function mostrarTecnicosGestion() {
    if (!techniciansTableBody) return;

    techniciansTableBody.innerHTML = "";

    if (tecnicosCargados.length === 0) {
        const fila = document.createElement("tr");
        crearCelda(fila, "Todavía no hay técnicos registrados.").colSpan = 5;
        techniciansTableBody.appendChild(fila);
        return;
    }

    tecnicosCargados.forEach(tecnico => {
        const fila = document.createElement("tr");
        crearCelda(fila, tecnico.nombre_completo);
        crearCelda(fila, tecnico.usuario);
        crearCelda(fila, tecnico.area || "Sin asignar");
        crearCelda(fila, tecnico.activo ? "Activo" : "Inactivo");

        const celdaAcciones = document.createElement("td");
        const botonEditar = document.createElement("button");
        botonEditar.type = "button";
        botonEditar.textContent = "Editar";
        botonEditar.className = "action-button edit-button";
        botonEditar.addEventListener("click", () => iniciarEdicionTecnico(tecnico));
        celdaAcciones.appendChild(botonEditar);
        fila.appendChild(celdaAcciones);

        techniciansTableBody.appendChild(fila);
    });
}

async function cargarTecnicos() {
    if (techniciansTableBody) techniciansTableBody.innerHTML = "";
    if (techniciansListTableBody) techniciansListTableBody.innerHTML = "";

    // Consultar técnicos
    const { data: tecnicos, error } = await supabase
        .from("perfiles")
        .select("id, nombre_completo, usuario, activo, area")
        .eq("rol", "tecnico")
        .order("nombre_completo", { ascending: true });

    if (error) {
        console.error("Error consultando técnicos:", error);
        mostrarErrorTablaTecnicos("No se pudieron cargar los técnicos.");
        return;
    }

    // Consultar técnicos y administradores para la exportación
    const { data: perfiles, error: errorPerfiles } = await supabase
        .from("perfiles")
        .select("id, nombre_completo, usuario, rol, activo, area")
        .in("rol", ["tecnico", "administrador"])
        .order("nombre_completo", { ascending: true });

    if (errorPerfiles) {
        console.error("Error consultando perfiles para exportación:", errorPerfiles);
        mostrarMensaje(
            exportMessage,
            "No se pudieron cargar todos los perfiles para exportar.",
            "error"
        );
        return;
    }

    tecnicosCargados = tecnicos || [];
    perfilesExportacion = perfiles || [];

    paginaTecnicosActual = 1;

    mostrarTecnicosPaginados();
    mostrarTecnicosGestion();
    actualizarFiltroTecnicos();
}

if (techniciansPrevPageButton) {
    techniciansPrevPageButton.addEventListener("click", () => {
        if (paginaTecnicosActual > 1) {
            paginaTecnicosActual--;
            mostrarTecnicosPaginados();
        }
    });
}

if (techniciansNextPageButton) {
    techniciansNextPageButton.addEventListener("click", () => {
        const totalPaginas = Math.ceil(tecnicosCargados.length / TECNICOS_POR_PAGINA);
        if (paginaTecnicosActual < totalPaginas) {
            paginaTecnicosActual++;
            mostrarTecnicosPaginados();
        }
    });
}

async function cargarTecnicosParaRegistro() {
    hoursTechnicianSelect.innerHTML =
        '<option value="">Seleccione un usuario</option>';

    // Consultar técnicos activos.
    const { data: tecnicos, error } = await supabase
        .from("perfiles")
        .select("id, nombre_completo, usuario")
        .eq("rol", "tecnico")
        .eq("activo", true)
        .order("nombre_completo", { ascending: true });

    if (error) {
        console.error("Error cargando técnicos para registro:", error);
        mostrarMensaje(hoursMessage, "No se pudo cargar la lista de usuarios.");
        return false;
    }

    // Agregar los técnicos activos al selector.
    (tecnicos || []).forEach(tecnico => {
        const opcion = document.createElement("option");
        opcion.value = tecnico.id;
        opcion.textContent =
            `${tecnico.nombre_completo} (${tecnico.usuario})`;

        hoursTechnicianSelect.appendChild(opcion);
    });

    // Agregar al administrador que inició sesión.
    if (perfilActual?.rol === "administrador" && usuarioActual) {
        const opcionAdministrador = document.createElement("option");

        opcionAdministrador.value = usuarioActual.id;
        opcionAdministrador.textContent =
            `Mis horas: ${perfilActual.nombre_completo}`;

        hoursTechnicianSelect.appendChild(opcionAdministrador);
    }

    return true;
}

function actualizarFiltroTecnicos() {
    if (perfilActual?.rol !== "administrador") return;

    const valorAnterior = hoursTechnicianFilter.value;
    hoursTechnicianFilter.innerHTML = '<option value="">Todos los técnicos</option>';

    tecnicosCargados.forEach(tecnico => {
        const opcion = document.createElement("option");
        opcion.value = tecnico.id;
        opcion.textContent = `${tecnico.nombre_completo} (${tecnico.usuario})`;
        hoursTechnicianFilter.appendChild(opcion);
    });

    if (valorAnterior && tecnicosCargados.some(tecnico => tecnico.id === valorAnterior)) {
        hoursTechnicianFilter.value = valorAnterior;
    }
}

// =========================================
// CREAR Y EDITAR TÉCNICOS
// =========================================

function mostrarFormularioTecnico() {
    technicianFormContainer.hidden = false;
    if (technicianFormTitle) {
        technicianFormTitle.textContent = tecnicoEnEdicion ? "Editar técnico" : "Registrar nuevo técnico";
    }
    technicianNameInput.focus();
}

function ocultarFormularioTecnico() {
    technicianFormContainer.hidden = true;
    technicianForm.reset();
    tecnicoEnEdicion = null;
    technicianUsernameInput.disabled = false;
    if (technicianFormTitle) technicianFormTitle.textContent = "Registrar nuevo técnico";
    saveTechnicianButton.textContent = "Guardar técnico";
}

function iniciarEdicionTecnico(tecnico) {
    if (perfilActual?.rol !== "administrador") return;

    tecnicoEnEdicion = tecnico;
    technicianNameInput.value = tecnico.nombre_completo || "";
    technicianUsernameInput.value = tecnico.usuario || "";
    technicianUsernameInput.disabled = true;
    technicianAreaInput.value = tecnico.area || "";
    saveTechnicianButton.textContent = "Guardar cambios";
    mostrarFormularioTecnico();
    technicianMessage.textContent = "";
}

showTechnicianFormButton.addEventListener("click", () => {
    if (perfilActual?.rol !== "administrador") return;

    tecnicoEnEdicion = null;
    technicianForm.reset();
    technicianUsernameInput.disabled = false;
    technicianAreaInput.value = "";
    saveTechnicianButton.textContent = "Guardar técnico";
    mostrarFormularioTecnico();
    technicianMessage.textContent = "";
});

cancelTechnicianButton.addEventListener("click", () => {
    ocultarFormularioTecnico();
    technicianMessage.textContent = "";
});

technicianForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (perfilActual?.rol !== "administrador") {
        mostrarMensaje(technicianMessage, "No tienes permisos para realizar esta operación.");
        return;
    }

    const nombre_completo = technicianNameInput.value.trim();
    const usuario = technicianUsernameInput.value.trim().toLowerCase();
    const area = technicianAreaInput.value;

    if (nombre_completo.length < 3 || nombre_completo.length > 120) {
        mostrarMensaje(technicianMessage, "El nombre debe tener entre 3 y 120 caracteres.");
        return;
    }

    if (!["Radio", "WiFi"].includes(area)) {
        mostrarMensaje(technicianMessage, "Selecciona un área válida: Radio o WiFi.");
        return;
    }

    if (!tecnicoEnEdicion && !usuario) {
        mostrarMensaje(technicianMessage, "Ingresa el nombre de usuario.");
        return;
    }

    saveTechnicianButton.disabled = true;

    try {
        if (tecnicoEnEdicion) {
            const { data, error } = await supabase.functions.invoke(
                "actualizar-area-tecnico",
                {
                    body: {
                        tecnico_id: tecnicoEnEdicion.id,
                        nombre_completo,
                        area
                    }
                }
            );

            if (error) throw new Error(data?.error || error.message || "No se pudo actualizar el técnico.");
            if (data?.error) throw new Error(data.error);

            mostrarMensaje(technicianMessage, "Técnico actualizado correctamente.", "success");
        } else {
            const { data, error } = await supabase.functions.invoke(
                "crear-tecnico",
                {
                    body: {
                        nombre_completo,
                        usuario,
                        area
                    }
                }
            );

            if (error) throw new Error(data?.error || error.message || "No se pudo crear el técnico.");
            if (data?.error) throw new Error(data.error);

            const mensaje = data?.password_temporal
                ? `Técnico registrado. Usuario: ${data.usuario || usuario} | Contraseña temporal: ${data.password_temporal} | Debe cambiarla en su primer ingreso.`
                : "Técnico registrado correctamente.";

            mostrarMensaje(technicianMessage, mensaje, "success");
        }

        ocultarFormularioTecnico();
        await cargarTecnicos();
        await cargarTecnicosParaRegistro();
        await actualizarResumenHoras();
    } catch (error) {
        console.error("Error guardando técnico:", error);
        mostrarMensaje(technicianMessage, error.message || "No se pudo guardar el técnico.");
    } finally {
        saveTechnicianButton.disabled = false;
        if (!tecnicoEnEdicion) saveTechnicianButton.textContent = "Guardar técnico";
    }
});


// =========================================
// EXPORTAR REGISTROS A CSV POR ÁREA
// =========================================

function exportarHorasCSV() {
    if (perfilActual?.rol !== "administrador") {
        mostrarMensaje(exportMessage, "No tienes permisos para exportar estos registros.");
        return;
    }

    const areaSeleccionada = exportAreaFilter.value;

    if (perfilesExportacion.length === 0) {
        mostrarMensaje(exportMessage, "No se encontraron perfiles para exportar.", "error");
        return;
    }

    // Filtrar perfiles según el área seleccionada.
    // Los perfiles con área "Ambas" se incluyen en Radio y WiFi.
    const perfilesFiltrados = perfilesExportacion.filter(perfil => {
        if (areaSeleccionada === "todos") return true;

        return perfil.area === areaSeleccionada || perfil.area === "Ambas";
    });

    if (perfilesFiltrados.length === 0) {
        mostrarMensaje(exportMessage, "No existen perfiles para el área seleccionada.", "info");
        return;
    }

    // Agrupar registros por perfil.
    const registrosPorPerfil = new Map();

    registrosCargados.forEach(registro => {
        if (!registrosPorPerfil.has(registro.tecnico_id)) {
            registrosPorPerfil.set(registro.tecnico_id, []);
        }

        registrosPorPerfil.get(registro.tecnico_id).push(registro);
    });

    const encabezados = [
        "Fecha de actividad",
        "Número de caso",
        "Nombre",
        "Usuario",
        "Rol",
        "Área",
        "Hora de inicio",
        "Hora de fin",
        "Total de horas",
        "Actividad",
        "Observaciones",
        "Registrado por",
        "Estado",
        "Revisado"
    ];

    const filas = [];

    // Recorrer todos los perfiles, incluso los que no tienen registros.
    perfilesFiltrados.forEach(perfil => {
        const registrosPerfil = registrosPorPerfil.get(perfil.id) || [];

        // Si el perfil no tiene registros, generar una fila con 0.00 horas.
        if (registrosPerfil.length === 0) {
            filas.push([
                "",
                "",
                perfil.nombre_completo,
                perfil.usuario,
                perfil.rol,
                perfil.area || "Sin asignar",
                "",
                "",
                "0.00",
                "",
                "",
                "",
                "",
                "No"
            ]);

            return;
        }

        // Si tiene varios registros, generar una fila por cada uno.
        registrosPerfil.forEach(registro => {
            const registrador = perfilesCargados.get(registro.registrado_por);

            filas.push([
                registro.fecha_actividad,
                registro.numero_caso,
                perfil.nombre_completo,
                perfil.usuario,
                perfil.rol,
                perfil.area || "Sin asignar",
                String(registro.hora_inicio || "").slice(0, 5),
                String(registro.hora_fin || "").slice(0, 5),
                Number(
                    registro.total_horas ||
                    calcularHoras(registro.hora_inicio, registro.hora_fin)
                ).toFixed(2),
                registro.actividad || "",
                registro.observaciones || "",
                registrador?.nombre_completo ||
                    nombresUsuarios.get(registro.registrado_por) || "",
                registro.estado || "",
                registro.revisado ? "Sí" : "No"
            ]);
        });
    });

    // Construir el contenido CSV.
    const contenidoCSV = [encabezados, ...filas]
        .map(fila => fila.map(escaparCSV).join(";"))
        .join("\r\n");

    const archivo = new Blob(
        ["\uFEFF" + contenidoCSV],
        { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement("a");

    const nombreArea =
        areaSeleccionada === "todos" ? "Todos" : areaSeleccionada;

    enlace.href = url;
    enlace.download =
        `horas_extras_${nombreArea}_${obtenerFechaLocal()}.csv`;

    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();

    URL.revokeObjectURL(url);

    mostrarMensaje(
        exportMessage,
        `Exportación completada: ${filas.length} filas correspondientes a ${perfilesFiltrados.length} perfiles.`,
        "success"
    );
}
 



exportHoursCsvButton.addEventListener("click", exportarHorasCSV);

// =========================================
// DETECCIÓN DE CRUCES DE HORARIOS
// =========================================

function intervalosSeCruzan(inicioNuevo, finNuevo, inicioExistente, finExistente) {
    const inicioA = convertirHoraAMinutos(inicioNuevo);
    let finA = convertirHoraAMinutos(finNuevo);
    const inicioB = convertirHoraAMinutos(inicioExistente);
    let finB = convertirHoraAMinutos(finExistente);

    if (finA <= inicioA) finA += 1440;
    if (finB <= inicioB) finB += 1440;

    // Se comparan desplazamientos para contemplar registros que atraviesan medianoche.
    for (const desplazamiento of [-1440, 0, 1440]) {
        const inicioComparacion = inicioB + desplazamiento;
        const finComparacion = finB + desplazamiento;

        // Intervalos semiabiertos: permite que uno comience justo cuando termina otro.
        if (inicioA < finComparacion && finA > inicioComparacion) return true;
    }

    return false;
}

async function buscarCruceHorario({
    tecnicoId,
    fechaActividad,
    horaInicio,
    horaFin,
    registroIdExcluir = null
}) {
    const { data: registros, error } = await supabase
        .from("registros_horas_extras")
        .select("id, numero_caso, actividad, hora_inicio, hora_fin")
        .eq("tecnico_id", tecnicoId)
        .eq("fecha_actividad", fechaActividad);

    if (error) {
        console.error("Error verificando cruces de horarios:", error);
        throw new Error("No se pudo verificar si el horario está disponible. Intenta nuevamente.");
    }

    for (const registro of (registros || [])) {
        if (registroIdExcluir && String(registro.id) === String(registroIdExcluir)) continue;

        if (intervalosSeCruzan(horaInicio, horaFin, registro.hora_inicio, registro.hora_fin)) {
            return {
                hayCruce: true,
                mensaje:
                    `El horario se cruza con otra actividad registrada. ` +
                    `Caso: ${registro.numero_caso || "Sin número de caso"}. ` +
                    `Actividad: ${registro.actividad || "Sin descripción"}. ` +
                    `Horario existente: ${String(registro.hora_inicio).slice(0, 5)} a ${String(registro.hora_fin).slice(0, 5)}.`
            };
        }
    }

    return { hayCruce: false, mensaje: "" };
}

// =========================================
// CAMBIO OBLIGATORIO DE CONTRASEÑA
// =========================================

changePasswordForm.addEventListener("submit", async event => {
    event.preventDefault();

    const nuevaClave = newPasswordInput.value;
    const confirmarClave = confirmPasswordInput.value;

    if (nuevaClave !== confirmarClave) {
        mostrarMensaje(passwordChangeMessage, "Las contraseñas no coinciden.");
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
            { body: { password: nuevaClave } }
        );

        if (error) throw new Error(data?.error || error.message || "No se pudo actualizar la contraseña.");
        if (!data || !data.mensaje) throw new Error(data?.error || "No se recibió confirmación de Supabase.");

        changePasswordForm.reset();
        mostrarMensaje(passwordChangeMessage, "Contraseña actualizada correctamente.", "success");
        await mostrarPanel();
    } catch (error) {
        console.error("Error durante el cambio de contraseña:", error);
        mostrarMensaje(passwordChangeMessage, error.message || "Ocurrió un error al cambiar la contraseña.");
    } finally {
        changePasswordButton.disabled = false;
        changePasswordButton.textContent = "Cambiar contraseña";
    }
});

// =========================================
// CONFIGURAR MÓDULOS SEGÚN EL ROL
// =========================================

async function configurarModuloHoras() {
    hoursModule.hidden = false;
    if (allTechniciansRecordsSection) allTechniciansRecordsSection.hidden = false;
    if (hoursRecordsSection) hoursRecordsSection.hidden = false;
    if (newActivitySection) newActivitySection.hidden = false;

    if (perfilActual.rol === "tecnico") {
        if (hoursAreaFilterContainer) {
            hoursAreaFilterContainer.hidden = true;
        }
        hoursFormContainer.hidden = false;
        technicianSelectContainer.hidden = true;
        hoursTechnicianSelect.required = false;

        adminHoursSummary.hidden = true;
        technicianHoursSummary.hidden = false;
        hoursTechnicianFilterContainer.hidden = true;

        if (techniciansListSection) techniciansListSection.hidden = true;
        technicianManagementSection.hidden = true;
        if (exportAreaFilter) exportAreaFilter.hidden = true;
        if (exportHoursCsvButton) exportHoursCsvButton.hidden = true;

        hoursModuleDescription.textContent =
            "Puede registrar sus propias horas extras, siempre que el plazo ordinario del caso esté vigente.";
        hoursListTitle.textContent = "Mis registros de horas extras";

        activityDateInput.value = obtenerFechaLocal();
        technicianSummaryMonthInput.value = obtenerMesActual();
    } else if (perfilActual.rol === "administrador") {
        if (hoursAreaFilterContainer) {
            hoursAreaFilterContainer.hidden = false;
        }
        hoursFormContainer.hidden = false;
        technicianSelectContainer.hidden = false;
        hoursTechnicianSelect.required = true;

        adminHoursSummary.hidden = false;
        technicianHoursSummary.hidden = true;
        hoursTechnicianFilterContainer.hidden = false;

        if (techniciansListSection) techniciansListSection.hidden = false;
        technicianManagementSection.hidden = false;
        if (exportAreaFilter) exportAreaFilter.hidden = false;
        if (exportHoursCsvButton) exportHoursCsvButton.hidden = false;

        hoursModuleDescription.textContent =
            "Puede registrar horas extras a nombre de cualquier técnico activo, incluso cuando el plazo ordinario del caso haya vencido.";
        hoursListTitle.textContent = "Registros de todos los técnicos";

        activityDateInput.value = obtenerFechaLocal();
        summaryMonthInput.value = obtenerMesActual();

        await cargarTecnicosParaRegistro();
    } else {
        hoursModule.hidden = true;
        hoursFormContainer.hidden = true;
    }

    actualizarMensajePlazo();
}

// =========================================
// EVENTOS DE RESÚMENES Y FILTROS
// =========================================

summaryMonthInput.addEventListener("change", cargarResumenAdministrador);

if (summaryAreaFilter) {
    summaryAreaFilter.addEventListener("change", cargarResumenAdministrador);
}

technicianSummaryMonthInput.addEventListener("change", cargarResumenTecnico);

hoursTechnicianFilter.addEventListener("change", mostrarRegistrosEnTabla);

if (hoursAreaFilter) {
    hoursAreaFilter.addEventListener("change", mostrarRegistrosEnTabla);
}
if (summaryAreaFilter) {
    summaryAreaFilter.value = "todos";
}
// =========================================
// EDITAR REGISTRO
// =========================================

async function iniciarEdicionRegistro(registro) {
    const esAdministrador = perfilActual?.rol === "administrador";
    const esTecnico = perfilActual?.rol === "tecnico";

    if (!esAdministrador && !esTecnico) return;

    if (
        esTecnico &&
        (
            registro.tecnico_id !== usuarioActual.id ||
            registro.estado !== "registrada" ||
            registro.revisado === true
        )
    ) {
        mostrarMensaje(hoursMessage, "No tiene permisos para editar este registro.");
        return;
    }

    registroEnEdicion = registro;

    caseNumberInput.value = registro.numero_caso || "";
    caseGenerationDateInput.value = registro.fecha_generacion_caso || "";
    activityDateInput.value = registro.fecha_actividad || "";
    startTimeInput.value = String(registro.hora_inicio || "").slice(0, 5);
    endTimeInput.value = String(registro.hora_fin || "").slice(0, 5);
    activityDescriptionInput.value = registro.actividad || "";
    activityObservationsInput.value = registro.observaciones || "";

    if (esAdministrador) {
        const tecnicoExiste = Array.from(hoursTechnicianSelect.options)
            .some(opcion => opcion.value === registro.tecnico_id);

        if (!tecnicoExiste) {
            const opcion = document.createElement("option");
            opcion.value = registro.tecnico_id;
            opcion.textContent = nombresUsuarios.get(registro.tecnico_id) || "Técnico del registro";
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

    hoursFormContainer.scrollIntoView({ behavior: "smooth", block: "start" });
}

function cancelarEdicionRegistro() {
    restablecerFormularioHoras();
    mostrarMensaje(hoursMessage, "Edición cancelada. El registro original no fue modificado.", "info");
}

// =========================================
// ELIMINAR REGISTRO
// =========================================

async function eliminarRegistro(registro) {
    const esAdministrador = perfilActual?.rol === "administrador";
    const esTecnico = perfilActual?.rol === "tecnico";

    if (!esAdministrador && !esTecnico) return;

    if (
        esTecnico &&
        (
            registro.tecnico_id !== usuarioActual.id ||
            registro.estado !== "registrada" ||
            registro.revisado === true
        )
    ) {
        mostrarMensaje(hoursMessage, "No tiene permisos para eliminar este registro.");
        return;
    }

    const confirmacion = confirm(
        `¿Está seguro de eliminar el registro del caso ${registro.numero_caso || "sin número"}?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmacion) return;

    try {
        mostrarMensaje(hoursMessage, "Eliminando registro...", "info");

        let consulta = supabase
            .from("registros_horas_extras")
            .delete()
            .eq("id", registro.id);

        if (esTecnico) {
            consulta = consulta
                .eq("tecnico_id", usuarioActual.id)
                .eq("estado", "registrada")
                .eq("revisado", false);
        }

        const { data, error } = await consulta.select("id");
        if (error) throw error;

        if (!data || data.length === 0) {
            throw new Error("No se eliminó el registro. Verifique sus permisos o si el registro ya fue eliminado.");
        }

        if (registroEnEdicion?.id === registro.id) restablecerFormularioHoras();

        await cargarRegistrosHoras();
        await actualizarResumenHoras();

        mostrarMensaje(
            hoursMessage,
            `El registro del caso ${registro.numero_caso || "sin número"} fue eliminado correctamente.`,
            "success"
        );
    } catch (error) {
        console.error("Error eliminando registro:", error);
        mostrarMensaje(hoursMessage, error.message || "No se pudo eliminar el registro.");
    }
}

// =========================================
// REVISAR REGISTRO
// =========================================

async function revisarRegistro(registro) {
    if (perfilActual?.rol !== "administrador") return;

    if (registro.revisado === true) {
        mostrarMensaje(hoursMessage, "Este registro ya fue revisado.", "info");
        return;
    }

    const confirmacion = confirm(
        `¿Confirma que desea marcar como revisado el registro del caso ${registro.numero_caso || "sin número"}?`
    );
    if (!confirmacion) return;

    try {
        mostrarMensaje(hoursMessage, "Procesando revisión...", "info");

        const { data, error } = await supabase
            .from("registros_horas_extras")
            .update({ revisado: true })
            .eq("id", registro.id)
            .eq("revisado", false)
            .select("id")
            .single();

        if (error) throw error;
        if (!data?.id) throw new Error("No se pudo confirmar la revisión del registro.");

        await cargarRegistrosHoras();

        mostrarMensaje(
            hoursMessage,
            `El registro del caso ${registro.numero_caso || "sin número"} fue revisado correctamente.`,
            "success"
        );
    } catch (error) {
        console.error("Error revisando registro:", error);
        mostrarMensaje(hoursMessage, error.message || "No se pudo revisar el registro.");
    }
}

// =========================================
// REGISTRAR O ACTUALIZAR HORAS EXTRAS
// =========================================

hoursForm.addEventListener("submit", async event => {
    event.preventDefault();

    if (!usuarioActual || !perfilActual) {
        mostrarMensaje(hoursMessage, "No se pudo verificar el usuario actual.");
        return;
    }

    const esAdministrador = perfilActual.rol === "administrador";
    const esTecnico = perfilActual.rol === "tecnico";
    const estaEditando = registroEnEdicion !== null;

    if (!esAdministrador && !esTecnico) {
        mostrarMensaje(hoursMessage, "No tiene permisos para registrar horas extras.");
        return;
    }

    if (
        estaEditando &&
        esTecnico &&
        (
            registroEnEdicion.tecnico_id !== usuarioActual.id ||
            registroEnEdicion.estado !== "registrada" ||
            registroEnEdicion.revisado === true
        )
    ) {
        mostrarMensaje(hoursMessage, "No tiene permisos para modificar este registro.");
        return;
    }

    const numeroCaso = caseNumberInput.value.trim();
    const fechaGeneracion = caseGenerationDateInput.value;
    const fechaActividad = activityDateInput.value;
    const horaInicio = startTimeInput.value;
    const horaFin = endTimeInput.value;
    const actividad = activityDescriptionInput.value.trim();
    const observaciones = activityObservationsInput.value.trim();

    const tecnicoId = esAdministrador ? hoursTechnicianSelect.value : usuarioActual.id;

    if (
        !numeroCaso ||
        !fechaGeneracion ||
        !fechaActividad ||
        !horaInicio ||
        !horaFin ||
        !actividad ||
        !tecnicoId
    ) {
        mostrarMensaje(hoursMessage, "Complete todos los campos obligatorios.");
        return;
    }

    const hoy = obtenerFechaLocal();

    if (fechaGeneracion > hoy) {
        mostrarMensaje(hoursMessage, "La fecha de generación del caso no puede ser futura.");
        return;
    }

    if (esTecnico && !estaEditando) {
        const fechaBloqueo = convertirFechaISO(calcularInicioVencimiento(fechaGeneracion));
        if (hoy >= fechaBloqueo) {
            mostrarMensaje(
                hoursMessage,
                "El plazo para registrar este caso ha vencido. Solicite al administrador que realice el registro."
            );
            return;
        }
    }

    const totalHoras = calcularHoras(horaInicio, horaFin);

    if (totalHoras <= 0) {
        mostrarMensaje(hoursMessage, "La hora de finalización debe ser diferente a la hora de inicio.");
        return;
    }

    if (totalHoras > 24) {
        mostrarMensaje(hoursMessage, "El tiempo registrado no puede superar 24 horas.");
        return;
    }

    saveHoursButton.disabled = true;
    saveHoursButton.textContent = estaEditando ? "Actualizando..." : "Guardando...";
    mostrarMensaje(hoursMessage, estaEditando ? "Actualizando registro..." : "Guardando registro...", "info");

    try {
        // Comprobar cruces para nuevos registros y modificaciones.
        const resultadoCruce = await buscarCruceHorario({
            tecnicoId,
            fechaActividad,
            horaInicio,
            horaFin,
            registroIdExcluir: estaEditando ? registroEnEdicion.id : null
        });

        if (resultadoCruce.hayCruce) {
            mostrarMensaje(hoursMessage, resultadoCruce.mensaje);
            return;
        }

        const nuevoRegistro = {
            tecnico_id: tecnicoId,
            numero_caso: numeroCaso,
            fecha_generacion_caso: fechaGeneracion,
            fecha_actividad: fechaActividad,
            hora_inicio: horaInicio,
            hora_fin: horaFin,
            total_horas: totalHoras,
            tipo_jornada: registroEnEdicion?.tipo_jornada || "fuera_horario",
            actividad,
            ubicacion: registroEnEdicion?.ubicacion || null,
            observaciones: observaciones || null,
            estado: estaEditando ? registroEnEdicion.estado : "registrada"
        };

        if (estaEditando) {
            let consulta = supabase
                .from("registros_horas_extras")
                .update(nuevoRegistro)
                .eq("id", registroEnEdicion.id);

            if (esTecnico) {
                consulta = consulta
                    .eq("tecnico_id", usuarioActual.id)
                    .eq("estado", "registrada")
                    .eq("revisado", false);
            }

            const { data: registroActualizado, error } = await consulta
                .select("id")
                .single();

            if (error) throw error;
            if (!registroActualizado?.id) {
                throw new Error("No se recibió confirmación de la actualización.");
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
            const { data: registroGuardado, error } = await supabase
                .from("registros_horas_extras")
                .insert(nuevoRegistro)
                .select("id")
                .single();

            if (error) throw error;
            if (!registroGuardado?.id) {
                throw new Error("El registro se guardó, pero no se recibió su identificador.");
            }

            const respuestaAlertas = await supabase.functions.invoke(
                "procesar-alertas-horas",
                { body: { registro_id: registroGuardado.id } }
            );

            const resultadoAlertas = respuestaAlertas.data;
            const errorProcesamientoAlertas = respuestaAlertas.error;

            restablecerFormularioHoras();
            await cargarRegistrosHoras();
            await actualizarResumenHoras();

            if (errorProcesamientoAlertas) {
                console.error("El registro se guardó, pero no se procesaron las alertas:", errorProcesamientoAlertas);
                mostrarMensaje(
                    hoursMessage,
                    `El registro ${numeroCaso} se guardó correctamente con ${totalHoras.toFixed(2)} horas, pero no se pudieron procesar las notificaciones. Informe al administrador.`,
                    "info"
                );
            } else if (resultadoAlertas?.success === true) {
                let mensajeFinal =
                    `Registro guardado correctamente. Caso: ${numeroCaso}. Total: ${totalHoras.toFixed(2)} horas.`;

                if (esAdministrador && resultadoAlertas.telegram) {
                    if (typeof resultadoAlertas.telegram.enviados === "number") {
                        mensajeFinal += ` Mensajes de Telegram enviados: ${resultadoAlertas.telegram.enviados}.`;
                        if (resultadoAlertas.telegram.errores > 0) {
                            mensajeFinal += ` Mensajes con error: ${resultadoAlertas.telegram.errores}.`;
                        }
                    } else if (typeof resultadoAlertas.telegram === "string") {
                        mensajeFinal += ` Telegram: ${resultadoAlertas.telegram}`;
                    }
                }

                mostrarMensaje(hoursMessage, mensajeFinal, "success");
                console.log("Resultado del procesamiento de alertas:", resultadoAlertas);
            } else {
                console.error("Respuesta inesperada al procesar alertas:", resultadoAlertas);
                mostrarMensaje(
                    hoursMessage,
                    `El registro ${numeroCaso} se guardó, pero no se recibió una confirmación válida del procesamiento de alertas.`,
                    "info"
                );
            }
        }
    } catch (error) {
        console.error("Error guardando o actualizando horas extras:", error);
        mostrarMensaje(hoursMessage, error.message || "No se pudo completar la operación.");
    } finally {
        saveHoursButton.disabled = false;
        saveHoursButton.textContent = registroEnEdicion ? "Guardar cambios" : "Registrar horas extras";
    }
});

// =========================================
// BOTÓN LIMPIAR FORMULARIO
// =========================================

if (resetHoursButton) {
    resetHoursButton.addEventListener("click", () => {
        registroEnEdicion = null;
        saveHoursButton.textContent = "Registrar horas extras";
        if (cancelEditButton) cancelEditButton.hidden = true;
        hoursMessage.textContent = "";
        hoursDeadlineMessage.textContent = "";

        // El reset nativo ocurre después del evento click.
        requestAnimationFrame(() => {
            activityDateInput.value = obtenerFechaLocal();
        });
    });
}
// =========================================
// CARGAR REGISTROS DE HORAS EXTRAS
// =========================================

async function cargarRegistrosHoras() {
    hoursTableBody.innerHTML = "";

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
        console.error("Error consultando registros:", error);
        const fila = document.createElement("tr");
        crearCelda(fila, "No se pudieron cargar los registros.").colSpan = 12;
        hoursTableBody.appendChild(fila);
        return;
    }

    registrosCargados = registros || [];

    if (registrosCargados.length === 0) {
        nombresUsuarios.clear();
        perfilesCargados.clear();

        const fila = document.createElement("tr");
        const mensaje = perfilActual.rol === "tecnico"
            ? "Todavía no tienes registros de horas extras."
            : "Todavía no existen registros de horas extras.";
        crearCelda(fila, mensaje).colSpan = 12;
        hoursTableBody.appendChild(fila);
        mostrarRegistrosEnTabla();
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

    let perfiles = [];

    if (idsUsuarios.length > 0) {
        const { data, error: errorPerfiles } = await supabase
            .from("perfiles")
            .select("id, nombre_completo, usuario")
            .in("id", idsUsuarios);

        if (errorPerfiles) {
            console.error("Error consultando perfiles:", errorPerfiles);
        } else {
            perfiles = data || [];
        }
    }

    nombresUsuarios = new Map();
    perfilesCargados = new Map();

    perfiles.forEach(perfil => {
        nombresUsuarios.set(perfil.id, perfil.nombre_completo);
        perfilesCargados.set(perfil.id, perfil);
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

    // Los técnicos solamente pueden consultar sus propios registros.
    if (perfilActual?.rol === "tecnico") {
        registros = registros.filter(
            registro => registro.tecnico_id === usuarioActual.id
        );
    }

    if (perfilActual?.rol === "administrador") {

       // Mapa para consultar el área de todos los perfiles.
        const perfilesPorId = new Map(
            perfilesExportacion.map(perfil => [perfil.id, perfil])
        );

        // Filtro por área.
        const areaSeleccionada = hoursAreaFilter?.value || "todos";

        if (areaSeleccionada !== "todos") {
            registros = registros.filter(registro => {
                 const perfil = perfilesPorId.get(registro.tecnico_id);

                return (
                    perfil?.area === areaSeleccionada ||
                    perfil?.area === "Ambas"
                );
            });
        }

        // Filtro por técnico.
        const tecnicoSeleccionado = hoursTechnicianFilter.value;

        if (tecnicoSeleccionado) {
            registros = registros.filter(
                registro => registro.tecnico_id === tecnicoSeleccionado
            );
        }
    }

    if (registros.length === 0) {
        const fila = document.createElement("tr");

        let mensaje;

        if (perfilActual?.rol === "tecnico") {
            mensaje = "Todavía no tienes registros de horas extras.";
        } else {
            const areaSeleccionada = hoursAreaFilter?.value || "todos";
            const tecnicoSeleccionado = hoursTechnicianFilter.value;

            if (tecnicoSeleccionado && areaSeleccionada !== "todos") {
                mensaje = "No hay registros para el técnico y el área seleccionados.";
            } else if (tecnicoSeleccionado) {
                mensaje = "No hay registros para el técnico seleccionado.";
            } else if (areaSeleccionada !== "todos") {
                mensaje = `No hay registros para el área ${areaSeleccionada}.`;
            } else {
                mensaje = "Todavía no existen registros de horas extras.";
            }
        }

        crearCelda(fila, mensaje).colSpan = 12;
        hoursTableBody.appendChild(fila);
        return;
    }

    registros.forEach(registro => {
        const fila = document.createElement("tr");

        crearCelda(fila, registro.numero_caso || "—");
        crearCelda(fila, formatearFecha(registro.fecha_generacion_caso));
        crearCelda(fila, formatearFecha(registro.fecha_actividad));
        crearCelda(fila, nombresUsuarios.get(registro.tecnico_id) || "No disponible");

        crearCelda(
            fila,
            `${String(registro.hora_inicio).slice(0, 5)} - ${String(registro.hora_fin).slice(0, 5)}`
        );

        crearCelda(fila, `${Number(registro.total_horas).toFixed(2)} h`);
        crearCelda(fila, registro.actividad || "—");
        crearCelda(fila, registro.observaciones || "—");
        crearCelda(fila, nombresUsuarios.get(registro.registrado_por) || "No disponible");
        crearCelda(fila, registro.estado || "—");
        crearCelda(fila, registro.revisado === true ? "Revisada" : "Pendiente");

        const celdaAcciones = document.createElement("td");

        const esAdministrador = perfilActual?.rol === "administrador";

        const esTecnicoPropietario =
            perfilActual?.rol === "tecnico" &&
            registro.tecnico_id === usuarioActual.id;

        const puedeModificar = esAdministrador || (
            esTecnicoPropietario &&
            registro.estado === "registrada" &&
            registro.revisado !== true
        );

        if (esAdministrador && registro.revisado !== true) {
            const botonRevisar = document.createElement("button");
            botonRevisar.type = "button";
            botonRevisar.textContent = "Revisar";
            botonRevisar.className = "action-button edit-button";
            botonRevisar.addEventListener("click", () => revisarRegistro(registro));
            celdaAcciones.appendChild(botonRevisar);
        }

        if (puedeModificar) {
            const botonEditar = document.createElement("button");
            botonEditar.type = "button";
            botonEditar.textContent = "Editar";
            botonEditar.className = "action-button edit-button";
            botonEditar.addEventListener("click", () => iniciarEdicionRegistro(registro));
            celdaAcciones.appendChild(botonEditar);

            const botonEliminar = document.createElement("button");
            botonEliminar.type = "button";
            botonEliminar.textContent = "Eliminar";
            botonEliminar.className = "action-button delete-button";
            botonEliminar.addEventListener("click", () => eliminarRegistro(registro));
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
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        console.error("Error obteniendo usuario:", userError);
        await supabase.auth.signOut();
        usuarioActual = null;
        perfilActual = null;
        mostrarLogin();
        return;
    }

    usuarioActual = userData.user;

    const { data: perfil, error: perfilError } = await supabase
        .from("perfiles")
        .select("nombre_completo, rol, activo, debe_cambiar_clave, area")
        .eq("id", usuarioActual.id)
        .single();

    if (perfilError || !perfil || !perfil.activo) {
        console.error("Error consultando perfil:", perfilError);
        await supabase.auth.signOut();
        usuarioActual = null;
        perfilActual = null;
        mostrarLogin();
        loginMessage.textContent = "No se pudo verificar el perfil o la cuenta está inactiva.";
        return;
    }

    perfilActual = perfil;

    if (perfil.debe_cambiar_clave) {
        loginContainer.hidden = true;
        dashboardContainer.hidden = true;
        changePasswordContainer.hidden = false;
        passwordChangeMessage.textContent = "Debe cambiar su contraseña para continuar.";
        return;
    }

    changePasswordContainer.hidden = true;
    welcomeName.textContent = `Bienvenido, ${perfil.nombre_completo}`;
    welcomeRole.textContent = perfil.rol === "administrador" ? "Rol: Administrador" : "Rol: Técnico";

    loginContainer.hidden = true;
    dashboardContainer.hidden = false;

    const dashboardSubtitle = dashboardContainer.querySelector(".dashboard-header p");
    if (dashboardSubtitle) {
        dashboardSubtitle.textContent = perfil.rol === "administrador"
            ? "Panel de administración"
            : "Panel del técnico";
    }

    const esAdministrador = perfil.rol === "administrador";

    if (technicianManagementSection) technicianManagementSection.hidden = !esAdministrador;
    if (techniciansListSection) techniciansListSection.hidden = !esAdministrador;

    if (allTechniciansRecordsSection) allTechniciansRecordsSection.hidden = false;

    if (esAdministrador) {
        await cargarTecnicos();
    } else {
        tecnicosCargados = [];
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

loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const usuario = usernameInput.value.trim();
    const password = passwordInput.value;

    if (!usuario || !password) {
        loginMessage.textContent = "Ingrese su usuario y contraseña.";
        return;
    }

    loginButton.disabled = true;
    loginButton.textContent = "Verificando...";
    loginMessage.textContent = "";

    try {
        const { data, error } = await supabase.functions.invoke(
            "iniciar-sesion",
            { body: { usuario, password } }
        );

        if (error) {
                        throw new Error(data?.error || error.message || "No se pudo iniciar sesión.");
        }

        if (!data || !data.access_token || !data.refresh_token) {
            throw new Error(data?.error || "No se recibió una sesión válida.");
        }

        const { error: sessionError } = await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token
        });

        if (sessionError) throw sessionError;

        await mostrarPanel();
        passwordInput.value = "";
    } catch (error) {
        console.error("Error de inicio de sesión:", error);
        loginMessage.textContent = error.message || "No se pudo iniciar sesión.";
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Iniciar sesión";
    }
});

// =========================================
// CERRAR SESIÓN
// =========================================

logoutButton.addEventListener("click", async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Error al cerrar sesión:", error);
        return;
    }

    usuarioActual = null;
    perfilActual = null;
    tecnicosCargados = [];
    perfilesExportacion = [];
    registrosCargados = [];
    nombresUsuarios.clear();
    perfilesCargados.clear();
    registroEnEdicion = null;
    tecnicoEnEdicion = null;
    paginaTecnicosActual = 1;

    mostrarLogin();
    loginForm.reset();
    loginMessage.textContent = "";
    technicianForm.reset();
    technicianFormContainer.hidden = true;
    technicianMessage.textContent = "";
    technicianUsernameInput.disabled = false;
    changePasswordForm.reset();
    passwordChangeMessage.textContent = "";
    hoursForm.reset();
    hoursFormContainer.hidden = true;
    hoursModule.hidden = true;

    if (allTechniciansRecordsSection) allTechniciansRecordsSection.hidden = true;
    if (techniciansListSection) techniciansListSection.hidden = true;
    if (technicianManagementSection) technicianManagementSection.hidden = true;

    adminHoursSummary.hidden = true;
    technicianHoursSummary.hidden = true;
    hoursTechnicianFilterContainer.hidden = true;

    if (hoursAreaFilterContainer) {
    hoursAreaFilterContainer.hidden = true;
    }

    hoursMessage.textContent = "";
    hoursDeadlineMessage.textContent = "";
    hoursTableBody.textContent = "";
    saveHoursButton.textContent = "Registrar horas extras";

    if (cancelEditButton) cancelEditButton.hidden = true;

    adminSummaryTableBody.innerHTML = "";
    adminSummaryTotal.textContent = "0.00 h";
    technicianHoursTotalValue.textContent = "0.00 h";

    hoursTechnicianFilter.innerHTML = '<option value="">Todos los técnicos</option>';

    if (hoursAreaFilter) {
        hoursAreaFilter.value = "todos";
    }
    if (summaryAreaFilter) {
        summaryAreaFilter.value = "todos";
    }
    if (techniciansTableBody) techniciansTableBody.innerHTML = "";
    if (techniciansListTableBody) techniciansListTableBody.innerHTML = "";
    if (exportMessage) exportMessage.textContent = "";
});

// =========================================
// RESTAURAR SESIÓN AL RECARGAR
// =========================================

async function iniciarAplicacion() {
    console.log("Comprobando si existe una sesión activa...");

    const { data, error } = await supabase.auth.getSession();

    if (error) {
        console.error("Error recuperando sesión:", error);
        return;
    }

    if (data.session) {
        await mostrarPanel();
    } else {
        console.log("No existe una sesión activa.");
        mostrarLogin();
    }
}

iniciarAplicacion();
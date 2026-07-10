/* ====================================================================
   MÓDULO: Control de Ejecución Presupuestal 2026
   Todas las funciones y variables usan el prefijo "pp" para no chocar
   con nada de tu app.js / zones.js existente.
   Requiere que en index.html exista la sección #sec-presupuesto
   (ver 1-fragmento-presupuesto.html) y que tu función ir() ya generica
   maneje cualquier id de sección "sec-<nombre>" (igual que las demás).
==================================================================== */

// URL de tu API de Google Apps Script perfectamente declarada
const URL_API_SHEETS = "https://script.google.com/macros/s/AKfycbyuK_Fim66h80stAbpLA2UFdwoLZQNyNgKwpdgHV1d-ip3ihxs4HD9D7c00fwiv0VHy/exec";

const ppDatos = {
  Regional: {
    "Formación: Segunda Edición Del Diplomado Enraizando Nuestras Lenguas Originarias Desde El Corazón De La Madre Tierra": {
      categoria: "Logística",
      items: {
        "Alimentación": 18240000,
        "Apoyo Puntual": 5000000,
        "Gastos de Movilidad ((ALIMENTACIÓN, TRANSPORTE, HOSPEDAJE,  CUIDO A MAYORES E INSUMOS PARA RITUALES, APOYOS PUNTUALES DE FORMACIÓN))": 60000000
      }
    },
    "Consolidación De La Ruta Metodológica Del Autodiagnóstico Sociolinguistico De Las Lenguas Originarias Nasayuwe, Namtrik, Siapede E Inga": {
      categoria: "Logística",
      items: {
        "Alimentación": 3420000,
        "Apoyo Puntual": 1500000,
        "Gastos de Movilidad": 10000000
      }
    },
    "Acompañamiento, Fortalecimiento Y Cuido A Los Procesos Que Dinamizan Las Lenguas, Pensamiento Y Sabiduría Ancestral En Los Territorios Cric": {
      categoria: "Logística",
      items: {
        "Alimentación": 22800000,
        "Gastos de Movilidad": 60000000
      }
    },
    "Dotación Para El Fortalecimiento Y Cuido A Los Procesos Que Dinamizan, Las Lenguas, El Pensamiento Y Sabiduría Ancestral En Los Territorios Cric": {
      categoria: "Dotación Pedagógica",
      items: {
        "Materiales Educativos": 50000000
      }
    }
  }
};

let ppAsignado = 230960000;
let ppEjecutado = 0;

const ppSaldos = {};
for (let p in ppDatos) {
  ppSaldos[p] = {};
  for (let pr in ppDatos[p]) {
    ppSaldos[p][pr] = {};
    for (let it in ppDatos[p][pr].items) {
      ppSaldos[p][pr][it] = ppDatos[p][pr].items[it];
    }
  }
}

function ppFormatMoney(n) {
  return "$" + Number(n).toLocaleString("es-CO");
}

function ppOpcionPlaceholder(texto) {
  return `<option value="" disabled selected hidden>${texto}</option>`;
}

//aquiiiiiiiiiiiiiii
// 1. NUEVA FUNCIÓN: Formatea el input con separadores de miles en tiempo real
function ppFormatearMascaraGasto(e) {
  let input = e.target;
  
  // 1. Quitar todo lo que no sea número
  let valor = input.value.replace(/\D/g, "");
  
  // 2. Si hay números, formatear. Si no, dejar vacío.
  if (valor) {
    input.value = Number(valor).toLocaleString("es-CO", { maximumFractionDigits: 0 });
  } else {
    input.value = "";
  }
}


function ppInit() {
  const pueblo = document.getElementById("pp-pueblo");
  if (!pueblo) return; // la sección aún no está en el DOM

  pueblo.innerHTML = ppOpcionPlaceholder("Seleccione...");
  for (let p in ppDatos) {
    pueblo.innerHTML += `<option value="${p}">${p}</option>`;
  }

  const proceso = document.getElementById("pp-proceso");
  const categoria = document.getElementById("pp-categoria");
  const descripcion = document.getElementById("pp-descripcion");

  proceso.innerHTML = ppOpcionPlaceholder("Seleccione un pueblo primero");
  categoria.innerHTML = ppOpcionPlaceholder("—");
  descripcion.innerHTML = ppOpcionPlaceholder("Seleccione un proceso primero");

  pueblo.onchange = ppCargarProcesos;
  proceso.onchange = ppCargarDescripcion;
  descripcion.onchange = ppMostrarMonto;
  
// aqui hacemos2222222222222222222222222
  const gastoInput = document.getElementById("pp-gasto");
  if (gastoInput) {
    gastoInput.addEventListener("input", ppFormatearMascaraGasto);
  }

  ppActualizarResumen();
  
  // Cargar el historial dinámico desde Google Sheets apenas inicie el componente
  ppCargarHistorialDesdeSheets();
}

function ppCargarProcesos() {
  const pueblo = document.getElementById("pp-pueblo");
  const proceso = document.getElementById("pp-proceso");
  const categoria = document.getElementById("pp-categoria");
  const descripcion = document.getElementById("pp-descripcion");
  const montoInput = document.getElementById("pp-monto");

  proceso.disabled = false;
  proceso.innerHTML = ppOpcionPlaceholder("Seleccione...");
  for (let x in ppDatos[pueblo.value]) {
    proceso.innerHTML += `<option value="${x}">${x}</option>`;
  }

  categoria.disabled = true;
  categoria.innerHTML = ppOpcionPlaceholder("—");
  descripcion.disabled = true;
  descripcion.innerHTML = ppOpcionPlaceholder("Seleccione un proceso primero");
  montoInput.value = "";
}

function ppCargarDescripcion() {
  const pueblo = document.getElementById("pp-pueblo");
  const proceso = document.getElementById("pp-proceso");
  const categoria = document.getElementById("pp-categoria");
  const descripcion = document.getElementById("pp-descripcion");
  const montoInput = document.getElementById("pp-monto");

  let d = ppDatos[pueblo.value][proceso.value];

  categoria.disabled = false;
  categoria.innerHTML = `<option value="${d.categoria}" selected>${d.categoria}</option>`;

  descripcion.disabled = false;
  descripcion.innerHTML = ppOpcionPlaceholder("Seleccione...");
  for (let x in d.items) {
    descripcion.innerHTML += `<option value="${x}">${x}</option>`;
  }

  montoInput.value = "";
}

function ppMostrarMonto() {
  const pueblo = document.getElementById("pp-pueblo");
  const proceso = document.getElementById("pp-proceso");
  const descripcion = document.getElementById("pp-descripcion");
  const montoInput = document.getElementById("pp-monto");

  if (!descripcion.value) {
    montoInput.value = "";
    return;
  }

  let valor = ppSaldos[pueblo.value][proceso.value][descripcion.value];
  montoInput.value = ppFormatMoney(valor);
}

function ppActualizarResumen() {
  document.getElementById("pp-total").innerHTML = ppFormatMoney(ppAsignado);
  document.getElementById("pp-gastado").innerHTML = ppFormatMoney(ppEjecutado);
  document.getElementById("pp-disponible").innerHTML = ppFormatMoney(ppAsignado - ppEjecutado);

  let porcentaje = ppAsignado > 0 ? (ppEjecutado / ppAsignado * 100) : 0;
  document.getElementById("pp-porcentaje").innerHTML = porcentaje.toFixed(1) + "%";
}

function ppGuardar() {
  const pueblo = document.getElementById("pp-pueblo");
  const proceso = document.getElementById("pp-proceso");
  const categoria = document.getElementById("pp-categoria");
  const descripcion = document.getElementById("pp-descripcion");
  const gastoInput = document.getElementById("pp-gasto");
  const fechaInput = document.getElementById("pp-fecha");
  const lenoriInput = document.getElementById("pp-lenori");
  const responsableSel = document.getElementById("pp-responsable");
  const montoInput = document.getElementById("pp-monto");

  if (!pueblo.value || !proceso.value || !descripcion.value) {
    alert("Seleccione Pueblo, Proceso y Descripción antes de registrar el gasto");
    return;
  }

  let valorLimpio = gastoInput.value.replace(/\./g, "");
  let gasto = Number(valorLimpio);
 
  if (!gasto || gasto <= 0) {
    alert("Ingrese un valor de gasto válido");
    return;
  }

  if (!fechaInput.value) {
    alert("Ingrese la fecha del gasto");
    return;
  }

  let saldoActual = ppSaldos[pueblo.value][proceso.value][descripcion.value];

  if (gasto > saldoActual) {
    alert("El valor del gasto supera el saldo disponible de esta actividad (" + ppFormatMoney(saldoActual) + ")");
    return;
  }

  // --- MODELAR DATOS EXCLUSIVOS PARA TU EXCEL ---
  const datosParaEnviar = {
    responsable: responsableSel.value || "No asignado",
    fecha: fechaInput.value,
    lenori: lenoriInput.value || "No especificado",
    pueblo: pueblo.value,
    proceso: proceso.value,
    categoria: categoria.value || "Logística",
    descripcion: descripcion.value,
    montoAsignado: ppDatos[pueblo.value][proceso.value].items[descripcion.value],
    valorGasto: gasto
  };

  // Petición HTTP asíncrona hacia Google Apps Script
  fetch(URL_API_SHEETS, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(datosParaEnviar)
  })
  .then(() => {
    console.log("Información enviada con éxito a Google Sheets.");
    // Refrescamos la tabla del historial para traer el nuevo registro visible inmediatamente
    setTimeout(ppCargarHistorialDesdeSheets, 1500);
  })
  .catch(err => console.error("Error al transferir datos:", err));

  // --- PROCESAMIENTO VISUAL LOCAL (Tu lógica base) ---
  saldoActual -= gasto;
  ppSaldos[pueblo.value][proceso.value][descripcion.value] = saldoActual;
  ppEjecutado += gasto;

  ppActualizarResumen();

  let filaVacia = document.getElementById("pp-fila-vacia");
  if (filaVacia) filaVacia.remove();

  gastoInput.value = "";
  responsableSel.selectedIndex = 0;
  lenoriInput.value = "";
  fechaInput.value = "";
  montoInput.value = ppFormatMoney(saldoActual);
}

// Nueva función añadida para renderizar de manera interactiva el Historial de gastos de la hoja remota
// Función corregida para renderizar el historial y recalcular las tarjetas superiores en tiempo real
// FUNCIÓN CENTRALIZADA: Carga el historial, acumula gastos por ítem y recalcula indicadores reales
function ppCargarHistorialDesdeSheets() {
  const tablaHistorial = document.getElementById("pp-tabla") || document.querySelector(".table tbody");
  if (!tablaHistorial) return;

  fetch(URL_API_SHEETS)
    .then(res => res.json())
    .then(data => {
      // 1. Reiniciamos los acumuladores globales para las tarjetas superiores
      ppEjecutado = 0; 

      // Opcional: Si tuvieras un objeto global para el total disponible por pueblo/proceso, lo reinicias aquí.
      
      // 2. Diccionario dinámico para controlar el saldo acumulado/restante de cada rubro específico
      const saldoRestantePorItem = {};

      if (data && data.length > 0) {
        tablaHistorial.innerHTML = ""; // Limpiar tabla de cargas previas
        
        // Asumimos que los datos vienen en orden cronológico desde Sheets (filas viejas a nuevas)
        data.forEach(item => {
          let fLimpia = item.fecha;
          if (typeof fLimpia === "string" && fLimpia.includes("T")) {
            fLimpia = fLimpia.split("T")[0]; // Formato limpio AAAA-MM-DD
          }

          const asignado = Number(item.montoAsignado) || 0;
          const ejecutado = Number(item.gasto) || 0;

          // Acumulamos el gasto global para las tarjetas superiores de control
          ppEjecutado += ejecutado;

          // CREACIÓN DE CLAVE ÚNICA: Identifica la línea presupuestal exacta (Pueblo + Proceso + Descripción)
          const itemKey = `${item.pueblo || ''}-${item.proceso || ''}-${item.descripcion || ''}`;

          // Si es la primera vez que vemos este ítem en el historial, inicializamos su saldo con el presupuesto asignado
          if (!(itemKey in saldoRestantePorItem)) {
            saldoRestantePorItem[itemKey] = asignado;
          }

          // RESTA ACUMULATIVA: Deduce el gasto actual del saldo remanente que le quedaba a este rubro específico
          saldoRestantePorItem[itemKey] -= ejecutado;
          
          // El saldo calculado para MOSTRAR en esta fila es el remanente progresivo actual
          const saldoCalculadoFila = saldoRestantePorItem[itemKey];

          // 3. Inserción dinámica y limpia en la tabla de la interfaz
          tablaHistorial.innerHTML += `
            <tr>
              <td>${fLimpia}</td>
              <td>${item.lenori || '—'}</td>
              <td>${item.proceso}</td>
              <td>${item.descripcion}</td>
              <td>${ppFormatMoney(ejecutado)}</td>
              <td><span style="color: ${saldoCalculadoFila < 0 ? '#d9534f' : 'inherit'}; font-weight: bold;">
                ${ppFormatMoney(saldoCalculadoFila)}
              </span></td> 
            </tr>
          `;
        });
      } else {
        tablaHistorial.innerHTML = `<tr><td colspan="6" style="text-align:center;">Aún no se han registrado gastos</td></tr>`;
      }

      // --- RECALCULO AUTOMÁTICO DE INDICADORES FINANCIEROS ---
      // Esta función se encarga de refrescar las tarjetas superiores ($ Gastado, Disponible, % Ejecutado)
      // utilizando el nuevo valor real acumulado en 'ppEjecutado'
      ppActualizarResumen();
    })
    .catch(err => console.error("Error crítico en la consistencia de datos de presupuesto:", err));
}

document.addEventListener("DOMContentLoaded", ppInit);
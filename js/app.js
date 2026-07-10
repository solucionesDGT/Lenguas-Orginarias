/**
 * @fileoverview Controlador principal de eventos, peticiones API e interfaz reactiva.
 */

/* ==========================================================================
   1. ESTADO GLOBAL
   ========================================================================== */
let DATOS = {}; 

const TITULOS = { 
  inicio: 'Inicio', 
  descargar: 'Descargar Formatos', 
  subir: 'Subir Documentos', 
  contador: 'Contador de Documentos', 
  equipo: 'Equipo Dinamizador' 
};

/* ==========================================================================
   2. SISTEMA DE NAVEGACIÓN Y MENÚS
   ========================================================================== */
function ir(id, btn) {
  document.querySelectorAll('.seccion').forEach(s => s.classList.remove('activa'));
  
  const targetSection = document.getElementById('sec-' + id);
  if (targetSection) targetSection.classList.add('activa');
  
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('activo'));
  if (btn) btn.classList.add('activo');
  
  document.getElementById('tt').textContent = TITULOS[id] || id;
  cerrarSB();
}

function abrirSB() { 
  document.getElementById('sidebar').classList.add('abierto'); 
  document.getElementById('ovl').classList.add('vis'); 
}

function cerrarSB() { 
  document.getElementById('sidebar').classList.remove('abierto'); 
  document.getElementById('ovl').classList.remove('vis'); 
}

/* ==========================================================================
   3. COMPONENTES VISUALES: TOAST Y GESTIÓN DE FECHA
   ========================================================================== */
// CÓDIGO CORREGIDO Y SEGURO:
function toast(msg) {
  const el = document.getElementById('toast-msg');
  
  if (el) {
    el.textContent = msg;
    el.parentElement.classList.add('vis');
    setTimeout(() => el.parentElement.classList.remove('vis'), 3500);
  } else {
    // Si no encuentra el elemento en el HTML, usa una alerta alternativa para que no se congele el sistema
    alert(msg);
  }
}

(function () {
  const f = new Date().toLocaleDateString('es-CO', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  document.getElementById('tf').textContent = f.charAt(0).toUpperCase() + f.slice(1);
})();

function setApi(tipo, msg) {
  const el = document.getElementById('api-st');
  const dot = document.getElementById('api-dot');
  const tx = document.getElementById('api-msg');
  
  el.className = 'api-status ' + tipo;
  dot.className = 'dot ' + (tipo === 'ok' ? 'verde' : tipo === 'err' ? 'rojo' : 'gris pulse');
  tx.textContent = msg;
}

/* ==========================================================================
   4. CONTROLADOR INTEGRADO DE GOOGLE DRIVE API
   ========================================================================== */
async function contarCarpeta(folderId) {
  let total = 0, token = '';
  do {
    const url = `https://www.googleapis.com/drive/v3/files`
      + `?q='${folderId}'+in+parents+and+trashed%3Dfalse`
      + `&fields=nextPageToken,files(id)`
      + `&pageSize=1000`
      + `&key=${CONFIG.GOOGLE_API_KEY}`
      + (token ? `&pageToken=${token}` : '');
      
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: 'Error desconocido' } }));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    total += (data.files || []).length;
    token = data.nextPageToken || '';
  } while (token);
  
  return total;
}

async function cargarDrive(manual = false) {
  const btnR = document.getElementById('btnR');
  btnR.classList.add('girando');
  setApi('load', 'Consultando Drive…');

  if (CONFIG.GOOGLE_API_KEY === 'PEGA_TU_API_KEY_AQUI') {
    setApi('err', 'API Key no configurada');
    document.getElementById('alerta-api').style.display = 'block';
    CONFIG.personas.forEach(p => { 
      DATOS[p.id] = Object.fromEntries(TIPOS.map(t => [t, 0])); 
    });
    btnR.classList.remove('girando');
    renderUI();
    if (manual) toast('⚠️ Configura la API Key para ver datos reales (ver instrucciones en pantalla).');
    return;
  }

  document.getElementById('alerta-api').style.display = 'none';
  let errMsg = '';
  
  try {
    await Promise.all(CONFIG.personas.map(async p => {
      const conteos = {};
      await Promise.all(TIPOS.map(async tipo => {
        try {
          conteos[tipo] = await contarCarpeta(p.carpetas[tipo]);
        } catch (e) {
          conteos[tipo] = 0;
          errMsg = e.message;
        }
      }));
      DATOS[p.id] = conteos;
    }));

    if (errMsg) {
      setApi('err', 'Error: ' + errMsg.substring(0, 30));
      toast('❌ Error Drive: ' + errMsg + ' — Verifica tu API Key y los permisos de las carpetas.');
    } else {
      setApi('ok', 'Drive sincronizado ✓');
      if (manual) toast('✅ Datos actualizados desde Google Drive');
    }
  } catch (e) {
    setApi('err', 'Sin conexión');
    toast('❌ Error de conexión con Google Drive.');
  }

  btnR.classList.remove('girando');
  renderUI();
}

/* ==========================================================================
   5. RENDERIZACIÓN DE MÓDULOS DE COMPONENTES INTERNOS
   ========================================================================== */
function renderUI() {
  const ahora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  const ua = document.getElementById('ult-act');
  if (ua) ua.textContent = ahora;

  let tInf = 0, tSol = 0, tRel = 0, tAnt = 0, tEvi = 0;
  CONFIG.personas.forEach(p => {
    const d = DATOS[p.id] || {};
    tInf += d.informes || 0; 
    tSol += d.solicitudes || 0;
    tRel += d.relatorias || 0; 
    tAnt += d.anticipos || 0; 
    tEvi += d.evidencia || 0;
  });
  const gran = tInf + tSol + tRel + tAnt + tEvi;

  animN('st-inf', tInf); 
  animN('st-sol', tSol); 
  animN('st-rel', tRel); 
  animN('st-ant', tAnt);
  animN('cn-inf', tInf); 
  animN('cn-sol', tSol); 
  animN('cn-rel', tRel);

  setTimeout(() => {
    document.getElementById('pw-fill').style.width = gran > 0 ? '100%' : '0%';
    document.getElementById('pw-pct').textContent = gran + ' documentos en total';
  }, 300);

  const mxI = Math.max(1, ...CONFIG.personas.map(p => (DATOS[p.id] || {}).informes || 0));
  const mxS = Math.max(1, ...CONFIG.personas.map(p => (DATOS[p.id] || {}).solicitudes || 0));
  const mxR = Math.max(1, ...CONFIG.personas.map(p => (DATOS[p.id] || {}).relatorias || 0));

  document.getElementById('br-inf').innerHTML = CONFIG.personas.map(p => barra(p, 'informes', mxI, '#2D6A4F')).join('');
  document.getElementById('br-sol').innerHTML = CONFIG.personas.map(p => barra(p, 'solicitudes', mxS, '#C8A96E')).join('');
  document.getElementById('br-rel').innerHTML = CONFIG.personas.map(p => barra(p, 'relatorias', mxR, '#1565C0')).join('');

  setTimeout(() => {
    document.querySelectorAll('.bf[data-w]').forEach(b => b.style.width = b.getAttribute('data-w') + '%');
  }, 150);

  document.getElementById('tbl-body').innerHTML = CONFIG.personas.map(p => {
    const d = DATOS[p.id] || {};
    const tot = (d.informes || 0) + (d.solicitudes || 0) + (d.relatorias || 0) + (d.anticipos || 0) + (d.evidencia || 0);
    return `<tr>
      <td><strong>${p.nombre}</strong></td>
      <td><span class="chip ${p.rol === 'Coordinador' ? 'ch-t' : 'ch-v'}">${p.rol}</span></td>
      <td style="font-weight:600">${d.informes || 0}</td>
      <td style="font-weight:600">${d.solicitudes || 0}</td>
      <td style="font-weight:600">${d.relatorias || 0}</td>
      <td style="font-weight:600">${d.anticipos || 0}</td>
      <td style="font-weight:600">${d.evidencia || 0}</td>
      <td><strong style="font-size:15px;color:var(--verde-bosque)">${tot}</strong></td>
    </tr>`;
  }).join('');

  renderEquipo();
}

function barra(p, tipo, maxVal, color) {
  const val = (DATOS[p.id] || {})[tipo] || 0;
  const pct = Math.round((val / maxVal) * 100);
  return `<div class="fb">
    <span class="fb-lbl">${p.nombre.split(' ')[0]}</span>
    <div class="bw"><div class="bf" data-w="${pct}" style="background:${color};width:0%"></div></div>
    <span class="fn">${val}</span>
  </div>`;
}

function renderEquipo() {
  document.getElementById('grid-eq').innerHTML = CONFIG.personas.map(p => {
    const d = DATOS[p.id] || {};
    const tot = (d.informes || 0) + (d.solicitudes || 0) + (d.relatorias || 0) + (d.anticipos || 0) + (d.evidencia || 0);
    return `<div class="pc anm">
      <div style="display:flex;align-items:center;gap:16px">
        <div class="av" style="background:${p.color}">${p.inicial}</div>
        <div style="flex:1">
          <div style="font-size:15px;font-weight:600">${p.nombre}</div>
          <div style="font-size:12px;color:var(--gris-medio);margin-top:2px">${p.rol}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:'Fraunces',serif;font-size:26px;font-weight:700;color:var(--verde-bosque)">${tot}</div>
          <div style="font-size:11px;color:var(--gris-medio)">docs. totales</div>
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <span class="chip ch-v">📄 ${d.informes || 0} Informes</span>
        <span class="chip ch-t">📋 ${d.solicitudes || 0} Solicitudes</span>
        <span class="chip ch-a">📝 ${d.relatorias || 0} Relatorías</span>
        <span class="chip" style="background:#F3EFFE;color:#7C3AED">💰 ${d.anticipos || 0} Anticipos</span>
        <span class="chip" style="background:#FEF9C3;color:#854D0E">🖼️ ${d.evidencia || 0} Evidencias</span>
      </div>
      <div style="border-top:1px solid var(--gris-borde);padding-top:14px">
        <p style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--gris-medio);margin-bottom:10px">📁 Carpetas en Drive</p>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px">
          <a href="${driveUrl(p.carpetas.informes)}"    target="_blank" class="btn btn-s" style="justify-content:center;font-size:11px;padding:7px 4px">📄 Informes</a>
          <a href="${driveUrl(p.carpetas.solicitudes)}" target="_blank" class="btn btn-s" style="justify-content:center;font-size:11px;padding:7px 4px">📋 Solicitudes</a>
          <a href="${driveUrl(p.carpetas.relatorias)}"  target="_blank" class="btn btn-s" style="justify-content:center;font-size:11px;padding:7px 4px">📝 Relatorías</a>
          <a href="${driveUrl(p.carpetas.anticipos)}"   target="_blank" class="btn btn-s" style="justify-content:center;font-size:11px;padding:7px 4px">💰 Anticipos</a>
          <a href="${driveUrl(p.carpetas.evidencia)}"   target="_blank" class="btn btn-s" style="justify-content:center;font-size:11px;padding:7px 4px">🖼️ Evidencia</a>
          <a href="${driveUrl(p.carpetas.principal)}"   target="_blank" class="btn btn-p" style="justify-content:center;font-size:11px;padding:7px 4px">📂 Ver todo</a>
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ==========================================================================
   6. INTERACCIONES, ACCIONES DE SUBIDA Y ANIMACIONES DE NÚMEROS
   ========================================================================== */
 /* Subir documentos */
  function subirDoc() {
    const pid = document.getElementById('sel-p').value;
    const tip = document.getElementById('sel-t').value;
    if(!pid||!tip){ toast('⚠️ Selecciona tu nombre y el tipo de documento.'); return; }
    const p = CONFIG.personas.find(x=>x.id===pid);
    toast(`📂 Abriendo carpeta de ${p.nombre} → ${tip}…`);
    setTimeout(() => window.open(driveUrl(p.carpetas[tip]),'_blank'), 600);
  }

document.querySelectorAll('a[href^="PENDIENTE_"]').forEach(b => {
  b.addEventListener('click', e => {
    e.preventDefault();
    toast('⚠️ Enlace del .docx pendiente. Compártelo desde la carpeta FORMATOS_OFICIALES en Drive y actualiza el HTML.');
  });
});

function animN(id, hasta, dur = 800) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  let v = 0, paso = hasta / (dur / 16);
  if (hasta === 0) { 
    el.textContent = '0'; 
    return; 
  }
  const t = setInterval(() => {
    v += paso; 
    if (v >= hasta) { 
      v = hasta; 
      clearInterval(t); 
    }
    el.textContent = Math.floor(v);
  }, 16);
}

/* Inicialización automática al cargar el DOM */
window.addEventListener('load', () => cargarDrive(false));
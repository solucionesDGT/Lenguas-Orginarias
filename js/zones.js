/**
 * @fileoverview Configuración de credenciales y mapeo de ID de carpetas de Google Drive.
 * Contiene la información estructural del equipo dinamizador.
 */

const CONFIG = {
  // 🔑 API Key configurada
  GOOGLE_API_KEY: 'AIzaSyBnQ9ZWjLf1ugnGvqXtFnke0XAeeCUYXwU', 

  CARPETA_FORMATOS: '1saSZtkkQMsm7ZdNhJgNU8AxOyA3M__gB',

  personas: [
    {
      id: 'jhonatan', 
      nombre: 'Jhonatan Chindoy', 
      rol: 'Dinamizador',
      color: '#2D6A4F', 
      inicial: 'JC',
      carpetas: {
        principal:   '1gWTceA2iByLy9vGA8noYw_YVXutXNK7X',
        informes:    '1-fsACkWEeNSQC1zlnUdCHtNkonchpP5D',
        anticipos:   '1d4ktqB_AQJePfILjtHxacRKqmT2G9_OR',
        evidencia:   '1NcQHhDw0cc8iZh3_CI7lEd8puAWCI-rV',
        relatorias:  '11w4K7rHOqjoJeaU5a1XB5s-VVWl4U58T',
        solicitudes: '11tmRYcrloUpYTcMAKjVO9IayFag-ftcv'
      }
    },
    {
      id: 'magnolia', 
      nombre: 'Magnolia Campo', 
      rol: 'Dinamizadora',
      color: '#40916C', 
      inicial: 'MC',
      carpetas: {
        principal:   '1U7Iug3B9vg4ETH6suTWtCEm6qt4VtS_H',
        informes:    '1Ki53hRiGV1Mx481NOiLEPHeCQhOlpSA0',
        anticipos:   '11V7QbGWSLI0W_dLLPBBBGRBllmwdDVTB',
        evidencia:   '18MWaXOssY2fyfsfmdEZkwkQjN67BiqN5',
        relatorias:  '1ODlGiDPLR_RVM-vrbYELS7ev8wAzl-og',
        solicitudes: '1PqgFSMMbf_T70mkkyjSUB3u-uTyUMiZm'
      }
    },
    {
      id: 'fredy', 
      nombre: 'Fredy Pertega', 
      rol: 'Dinamizador',
      color: '#C8A96E', 
      inicial: 'FP',
      carpetas: {
        principal:   '1VsyvtZ4KdCIxQwzqwM0aEwKbg4OnjEv2',
        informes:    '1FHHcQeNngXvvu9YajEAL6PgWCXDFYxor',
        anticipos:   '1qevWVLnUl5I6x3XefdUI-MCvHgGj61VG',
        evidencia:   '1hUViaYqQgco3-7FgPwY4RDhh3CJNCtR9',
        relatorias:  '1CpiJM7lFgx-wyLgNz_cAfgaIVMMqUZ-I',
        solicitudes: '1pRP9rQuwPgrsEfJh87Bgt6k7N956kUiC'
      }
    },
    {
      id: 'edgar', 
      nombre: 'Edgar Muelas', 
      rol: 'Coordinador',
      color: '#1565C0', 
      inicial: 'EM',
      carpetas: {
        principal:   '1mqR85uf_Fjow2U93DH_32W-g9Cbw9fip',
        informes:    '1e5g-zw9bshz5cWqifxwVrxhSxXHohuf7',
        anticipos:   '1AUHax6WLap4__URte9JUWUbgXilvbaEL',
        evidencia:   '14_ni7SPi-dkAVHEwWDi4qlQ2le5z_0ZG',
        relatorias:  '1VN8boKIC4mnTr_zsPV6SJ5Pnj9EgolaG',
        solicitudes: '1ZySH8x5Ltj-JNN74jJB-_bkIpV6nM3SR'
      }
    }
  ]
};

const TIPOS = ['informes', 'solicitudes', 'relatorias', 'anticipos', 'evidencia'];

/**
 * Genera el enlace de navegación compartida para Google Drive.
 * @param {string} id - Identificador único de la carpeta.
 * @returns {string} Enlace URL parametrizado.
 */
function driveUrl(id) { 
  return `https://drive.google.com/drive/folders/${id}?usp=sharing`; 
}
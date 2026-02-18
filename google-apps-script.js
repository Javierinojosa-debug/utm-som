/**
 * Google Apps Script - Registro de UTMs
 * Jardín de las Delicias Festival
 *
 * INSTRUCCIONES PASO A PASO:
 *
 * 1. Abre tu Google Sheet:
 *    https://docs.google.com/spreadsheets/d/1jULq22hV2beqPoOy2flUx-pItJJsIWE_9GC64264B40/edit
 *
 * 2. En la primera fila (fila 1), pon estos encabezados:
 *    A1: Timestamp
 *    B1: Usuario
 *    C1: Alias
 *    D1: URL Base
 *    E1: Ciudad
 *    F1: Canal
 *    G1: utm_source
 *    H1: utm_medium
 *    I1: utm_campaign
 *    J1: utm_content
 *    K1: URL Final
 *
 * 3. Ve a Extensiones > Apps Script (se abre en pestaña nueva)
 *
 * 4. Borra TODO el código que haya y pega SOLO lo de abajo
 *    (desde "var SHEET_ID" hasta el final del archivo)
 *
 * 5. Haz clic en el icono de guardar (o Ctrl+S)
 *
 * 6. Haz clic en "Implementar" > "Nueva implementación"
 *    - En "Tipo", selecciona "Aplicación web"
 *    - En "Ejecutar como": "Yo (tu email)"
 *    - En "Quién tiene acceso": "Cualquier persona"
 *    - Haz clic en "Implementar"
 *
 * 7. Te pedirá autorizar permisos → Acepta todos
 *
 * 8. Copia la URL que aparece (empieza por https://script.google.com/macros/s/...)
 *
 * 9. Actualiza el archivo .env del proyecto con esa URL:
 *    VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/TU_NUEVA_URL/exec
 *
 * 10. Reinicia npm run dev
 *
 * IMPORTANTE: Cada vez que modifiques este código, debes crear una
 * NUEVA implementación (no editar la existente).
 */

// ===== COPIAR DESDE AQUÍ =====

var SHEET_ID = '1jULq22hV2beqPoOy2flUx-pItJJsIWE_9GC64264B40';

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Hoja 1') ||
                SpreadsheetApp.openById(SHEET_ID).getSheets()[0];

    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.usuario || '',
      data.alias || '',
      data.url_base || '',
      data.ciudad || '',
      data.canal || '',
      data.utm_source || '',
      data.utm_medium || '',
      data.utm_campaign || '',
      data.utm_content || '',
      data.url_final || '',
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: 'ok' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: 'error', message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ status: 'ok', message: 'UTM Logger activo' })
  ).setMimeType(ContentService.MimeType.JSON);
}

// ===== COPIAR HASTA AQUÍ =====

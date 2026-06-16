// ============================================================
// Google Apps Script - Backend Web Vote Du Lịch Tháng 7/2026
// ============================================================
// 📌 TRIỂN KHAI:
// 1. Mở Google Sheet của bạn
// 2. Menu Extensions → Apps Script
// 3. Paste TOÀN BỘ code này vào, xóa code cũ
// 4. Ctrl+S để lưu
// 5. Deploy → New Deployment → Chọn "Web app"
// 6. Execute as: Me  |  Who has access: Anyone
// 7. Deploy → Copy URL → Dán vào vote.html khi được hỏi
// ============================================================

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  const action = e?.parameter?.action || 'getAll';
  try {
    switch (action) {
      case 'getAll':   return ok(getAllVotes());
      case 'save':     return saveVotes(e?.postData?.contents);
      case 'deleteUser': return deleteUser(e?.parameter?.user);
      case 'resetAll': return resetAll();
      default:         return err('Unknown action');
    }
  } catch (ex) {
    return err(ex.message);
  }
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Votes');
  if (!sheet) {
    sheet = ss.insertSheet('Votes');
    sheet.appendRow(['Timestamp', 'UserName', 'Date', 'Status']);
    sheet.getRange(1, 1, 1, 4).setFontWeight('bold').setBackground('#e8e8f0');
  }
  return sheet;
}

function getAllVotes() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return {};

  const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  const result = {};
  for (let i = 1; i < data.length; i++) {
    const [, userName, date, status] = data[i];
    if (!userName || !date || !status) continue;
    const name = String(userName).trim();
    let dk;
    if (date instanceof Date) {
      dk = Utilities.formatDate(date, tz, "yyyy-MM-dd");
    } else {
      dk = String(date).trim();
    }
    const st = String(status).trim();
    if (!result[name]) result[name] = {};
    result[name][dk] = st;
  }
  return result;
}

function saveVotes(body) {
  let payload;
  try { payload = JSON.parse(body); } catch(e) { return err('Invalid JSON'); }

  const { userName, statuses } = payload;
  if (!userName || !statuses) return err('Missing userName or statuses');

  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const rowsToDelete = [];
    for (let i = data.length - 1; i >= 1; i--) {
      if (String(data[i][1]).trim() === userName.trim()) {
        rowsToDelete.push(i + 1);
      }
    }
    for (const row of rowsToDelete) sheet.deleteRow(row);

    const rows = [];
    const now = new Date();
    for (const [date, status] of Object.entries(statuses)) {
      rows.push([now, userName, date, status]);
    }
    if (rows.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
    }
  } finally {
    lock.releaseLock();
  }
  return ok({ success: true });
}

function deleteUser(userName) {
  if (!userName) return err('Missing user');
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const rowsToDelete = [];
  for (let i = data.length - 1; i >= 1; i--) {
    if (String(data[i][1]).trim() === userName.trim()) {
      rowsToDelete.push(i + 1);
    }
  }
  for (const row of rowsToDelete) sheet.deleteRow(row);
  return ok({ success: true });
}

function resetAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Votes');
  if (sheet) ss.deleteSheet(sheet);
  getSheet();
  return ok({ success: true });
}

function ok(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
function err(msg) {
  return ContentService.createTextOutput(JSON.stringify({ error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

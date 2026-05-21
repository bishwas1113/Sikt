// === Job Tracker — App-Primary Sync with Sheet Delete Support (v4) ===

const SHEET_NAME = "Jobs";
const HEADERS = ["id","title","company","link","code","applied","deadline","username","notes","fit","status","archived","archivedDate","updatedAt"];

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#f5f5f7");
    sheet.setFrozenRows(1);
  }
  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  // If the header doesn't have updatedAt yet, add it
  if (firstRow.length < HEADERS.length || firstRow.join(",") !== HEADERS.join(",")) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
  return sheet;
}

function sanitize(v) {
  if (v === undefined || v === null) return "";
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v;
  return String(v).replace(/[\r\n\t]+/g, " ").trim();
}

function readAll() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  return values
    .filter(row => row[0])
    .map(row => {
      const obj = {};
      HEADERS.forEach((h, i) => { obj[h] = row[i]; });
      obj.fit = obj.fit === "" ? 0 : Number(obj.fit) || 0;
      obj.archived = obj.archived === true || obj.archived === "TRUE" || obj.archived === "true";
      ["applied","deadline","archivedDate"].forEach(k => {
        if (obj[k] instanceof Date) {
          obj[k] = Utilities.formatDate(obj[k], Session.getScriptTimeZone(), "yyyy-MM-dd");
        } else {
          obj[k] = obj[k] ? String(obj[k]) : "";
        }
      });
      obj.updatedAt = obj.updatedAt ? String(obj.updatedAt) : "";
      return obj;
    });
}

function writeAll(records) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, HEADERS.length).clearContent();
  }
  if (!records.length) return;
  const rows = records.map(r => HEADERS.map(h => sanitize(r[h])));
  sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action || "sync";

    if (action === "sync") {
      const serverRecs = readAll();
      const clientRecs = body.records || [];

      // Build lookup maps
      const serverById = {};
      serverRecs.forEach(r => serverById[r.id] = r);
      const clientById = {};
      clientRecs.forEach(r => clientById[r.id] = r);

      // The set of IDs the app TOLD US it has (this turn)
      const knownClientIds = new Set(body.knownIds || clientRecs.map(r => r.id));

      // For each client record:
      //   - If it's in the sheet AND the sheet's updatedAt is newer → sheet wins (sheet edit happened)
      //   - Otherwise → app wins (most cases, because app is primary)
      const merged = {};

      clientRecs.forEach(c => {
        const s = serverById[c.id];
        if (!s) {
          // Not in sheet → this is a new record from the app, keep it
          merged[c.id] = c;
        } else {
          // In both. Compare updatedAt; sheet wins only if its timestamp is strictly newer
          const cTime = c.updatedAt || "";
          const sTime = s.updatedAt || "";
          if (sTime && sTime > cTime) {
            merged[c.id] = s;  // sheet was edited more recently
          } else {
            merged[c.id] = c;  // app wins (default — app is primary)
          }
        }
      });

      // Any records in the sheet that the app didn't send → these are records the user
      // ADDED DIRECTLY in the sheet. Include them.
      serverRecs.forEach(s => {
        if (!clientById[s.id] && !knownClientIds.has(s.id)) {
          merged[s.id] = s;
        }
      });

      // Records the app says it KNOWS about but didn't send back (in knownIds but not in clientRecs)
      // → these were deleted in the app. Don't add them back from the sheet.

      // Records in the sheet but NOT in client's knownIds AND NOT in clientRecs
      // → above logic already adds these (user added them directly in sheet).

      // CRITICAL: records the app sent but are NOT in the sheet → the user deleted them from the sheet.
      // We need to filter these out. The way: if a record's ID is in knownClientIds but the sheet
      // doesn't have it, the user deleted it from the sheet → remove from merged.
      Object.keys(merged).forEach(id => {
        const inClient = clientById[id];
        const inServer = serverById[id];
        if (inClient && !inServer && knownClientIds.has(id)) {
          // App sent it, sheet doesn't have it, app knew about it before → sheet deletion
          // BUT: if this is a brand-new record (created recently in app), keep it
          const rec = clientById[id];
          const createdRecent = isRecentlyCreated(rec);
          if (!createdRecent) {
            delete merged[id];
          }
        }
      });

      const finalRecs = Object.values(merged);
      writeAll(finalRecs);

      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, records: finalRecs, total: finalRecs.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "read") {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, records: readAll() }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: "Unknown action" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// A record is "recently created" if its ID-embedded timestamp is within last 5 minutes
function isRecentlyCreated(rec) {
  if (!rec || !rec.id) return false;
  const m = String(rec.id).match(/^rec_(\d+)_/);
  if (!m) return false;
  const created = parseInt(m[1], 10);
  return (Date.now() - created) < 5 * 60 * 1000;
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, records: readAll() }))
    .setMimeType(ContentService.MimeType.JSON);
}

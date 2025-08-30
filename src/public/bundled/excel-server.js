// Bundled copy of excel-server/index.js
// Place this file on the target PC and run: node index.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

app.get('/ping', (req, res) => res.json({ ok: true }));

app.post('/append', async (req, res) => {
  const serverKey = process.env.EXCEL_SERVER_KEY;
  if (serverKey) {
    const provided = req.headers['x-api-key'] || req.headers['X-API-KEY'];
    if (!provided || provided !== serverKey) {
      return res.status(401).json({ error: 'unauthorized' });
    }
  }
  try {
    const { filePath, row } = req.body;
    if (!filePath || !row) return res.status(400).json({ error: 'missing filePath or row' });
    const absPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    const dir = path.dirname(absPath);
    if (!fs.existsSync(dir)) return res.status(400).json({ error: 'directory not found', dir });
    const workbook = new ExcelJS.Workbook();
    let sheet;
    if (fs.existsSync(absPath)) {
      await workbook.xlsx.readFile(absPath);
      sheet = workbook.worksheets[0] || workbook.addWorksheet('Sheet1');
    } else {
      sheet = workbook.addWorksheet('Sheet1');
    }
    const now = new Date().toISOString();
    let obj = {};
    if (Array.isArray(row)) {
      obj = { nombre: row[0] || '', telefono: row[1] || '', email: row[2] || '', cp: row[3] || '', localidad: row[4] || '', calleNumero: row[5] || '', motivo: row[6] || '' };
    } else if (typeof row === 'object') {
      obj = { nombre: row.nombre || '', telefono: row.telefono || '', email: row.email || '', cp: row.cp || '', localidad: row.localidad || '', calleNumero: row.calleNumero || '', motivo: row.motivo || '' };
    } else return res.status(400).json({ error: 'row must be array or object' });
    const values = [now, obj.nombre, obj.telefono, obj.email, obj.cp, obj.localidad, obj.calleNumero, obj.motivo];
    sheet.addRow(values);
    try {
      const threshold = Date.now() - (72 * 60 * 60 * 1000);
      const rows = [];
      sheet.eachRow({ includeEmpty: false }, (r, rowNumber) => {
        const first = r.getCell(1).value;
        const ts = first && typeof first === 'string' ? Date.parse(first) : null;
        if (!ts || ts >= threshold) rows.push(r.values);
      });
      const newSheet = workbook.addWorksheet('tmp');
      rows.forEach(rv => newSheet.addRow(rv.slice(1)));
      workbook.removeWorksheet(sheet.id);
      newSheet.name = sheet.name || 'Sheet1';
      sheet = newSheet;
    } catch (errP) {
      console.warn('purge failed', errP);
    }
    await workbook.xlsx.writeFile(absPath);
    return res.json({ ok: true, path: absPath });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error', detail: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('excel-server listening on', PORT));

// GET /export-log?filePath=... returns CSV
app.get('/export-log', async (req, res) => {
  try {
    const filePath = req.query.filePath;
    if (!filePath) return res.status(400).send('missing filePath');
    const absPath = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), String(filePath));
    if (!fs.existsSync(absPath)) return res.status(404).send('file not found');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(absPath);
    const sheet = workbook.worksheets[0];
    if (!sheet) return res.status(404).send('no sheet');
    const lines = [];
    sheet.eachRow({ includeEmpty: false }, (r) => {
      const vals = r.values.slice(1).map(v => typeof v === 'string' ? '"' + v.replace(/"/g,'""') + '"' : '"' + String(v||'') + '"');
      lines.push(vals.join(','));
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="access_log.csv"');
    res.send(lines.join('\n'));
  } catch (err) {
    console.error('export-log failed', err);
    res.status(500).send('error');
  }
});

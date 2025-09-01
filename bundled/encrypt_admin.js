// Simple Node script to create an encrypted checkins file using passphrase 'admin:admin'
const fs = require('fs');
const crypto = require('crypto');

const inPath = process.argv[2] || 'bundled/checkins_template.csv';
const outPath = process.argv[3] || 'bundled/checkins_admin.enc';
const pass = 'admin:admin';

const plain = fs.readFileSync(inPath);
const salt = crypto.randomBytes(16);
const iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(pass, salt, 100000, 32, 'sha256');
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const ct = Buffer.concat([cipher.update(plain), cipher.final()]);
const tag = cipher.getAuthTag();
const magic = Buffer.from('HIPOSENC','ascii');
const ver = Buffer.from([0x02]);
const out = Buffer.concat([magic, ver, salt, iv, ct, tag]);
fs.writeFileSync(outPath, out);
console.log('Wrote', outPath);

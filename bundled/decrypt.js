#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');
const readline = require('readline');

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length < 2) {
    console.error('Usage: node decrypt.js <in.enc> <out.bin> [--passphrase yourpass]');
    process.exit(2);
  }
  const inPath = argv[0];
  const outPath = argv[1];
  let pass = null;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--passphrase' && argv[i+1]) { pass = argv[i+1]; i++; }
  }
  const raw = fs.readFileSync(inPath);
  const magic = raw.slice(0,8).toString('ascii');
  if (magic !== 'HIPOSENC') { console.error('Invalid file magic'); process.exit(3); }
  const ver = raw[8];
  if (ver === 1) {
    console.error('Version 1 (KeyStore) cannot be decrypted outside device. Use passphrase mode.');
    process.exit(4);
  }
  if (ver !== 2) { console.error('Unsupported version', ver); process.exit(5); }
  const salt = raw.slice(9, 25); // 16 bytes
  const iv = raw.slice(25, 37); // 12 bytes
  const cipher = raw.slice(37);
  if (!pass) pass = await prompt('Passphrase: ');
  const key = crypto.pbkdf2Sync(pass, salt, 100000, 32, 'sha256');
  try {
    // split tag (last 16 bytes) from ciphertext
    if (cipher.length < 16) { throw new Error('ciphertext too short'); }
    const tag = cipher.slice(cipher.length - 16);
    const ct = cipher.slice(0, cipher.length - 16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const res = Buffer.concat([decipher.update(ct), decipher.final()]);
    fs.writeFileSync(outPath, res);
    console.log('Decrypted to', outPath);
  } catch (e) {
    console.error('Decrypt failed:', e.message);
    process.exit(6);
  }
}

main();

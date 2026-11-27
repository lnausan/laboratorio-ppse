// Cifra la 2° capa de la cartografía (caracterización de grupos y territorio) para publicarla
// sin que se pueda leer sin la clave del equipo.
//
// uso:  CLAVE='la-clave' node tools/cifrar-capa2.mjs [ruta/al/capa2-privada.json]
//
// El JSON privado vive fuera de la web (por defecto en ../info/Cartografía- mapa Ushuaia/).
// El resultado se escribe en js/bitacora-capa2.js: solo datos cifrados (AES-GCM, clave derivada con PBKDF2).
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto as crypto } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const src = process.argv[2] || join(here, '../../info/Cartografía- mapa Ushuaia/capa2-privada.json');
const out = join(here, '../js/bitacora-capa2.js');
const pass = (process.env.CLAVE || '').trim().toLowerCase();   // igual que al abrirla en la web
if (!pass) { console.error('Falta la clave: CLAVE=\'...\' node tools/cifrar-capa2.mjs'); process.exit(1); }

const ITER = 310000;
const plain = JSON.stringify(JSON.parse(readFileSync(src, 'utf8')).proyectos);
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(plain)));
const b64 = (u) => Buffer.from(u).toString('base64');

writeFileSync(out, `/* 2° capa de la cartografía: acceso restringido. Cifrada con tools/cifrar-capa2.mjs — no editar a mano. */
window.BITACORA_CAPA2 = { iter: ${ITER}, salt: '${b64(salt)}', iv: '${b64(iv)}', data: '${b64(data)}' };
`);
console.log('Listo: js/bitacora-capa2.js (' + data.length + ' bytes cifrados)');

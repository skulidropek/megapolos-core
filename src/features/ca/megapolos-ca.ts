import { execSync } from 'child_process';
import * as fs from 'fs';
import { megapolosPath } from '../../..';

// Единый корневой сертификат Megapolos.
// Создаётся один раз на ядре, раздаётся на все ноды (в devMode self-signed),
// и доступен пользователю для скачивания, чтобы доверять ресурсам кластера.
//
// Пути вычисляем лениво (внутри функций): megapolosPath инициализируется
// в index.ts и при циклическом импорте на момент загрузки модуля может быть
// ещё не определён.

function caDir(): string {
  return `${megapolosPath}/data/ca`;
}
export function caCrtPath(): string {
  return `${caDir()}/ca.crt`;
}
export function caKeyPath(): string {
  return `${caDir()}/ca.key`;
}

/**
 * Генерирует Megapolos Root CA, если его ещё нет. Идемпотентно.
 */
export function ensureMegapolosCA(): void {
  const dir = caDir();
  const crt = caCrtPath();
  const key = caKeyPath();
  if (fs.existsSync(crt) && fs.existsSync(key)) {
    return;
  }
  fs.mkdirSync(dir, { recursive: true });

  execSync(`openssl genrsa -out "${key}" 4096`, { stdio: 'ignore' });
  fs.chmodSync(key, 0o600);

  execSync(
    `openssl req -x509 -new -nodes -key "${key}" -sha256 -days 3650 ` +
      `-out "${crt}" -subj "/O=Megapolos/CN=Megapolos Root CA" ` +
      `-addext "basicConstraints=critical,CA:TRUE" ` +
      `-addext "keyUsage=critical,keyCertSign,cRLSign"`,
    { stdio: 'ignore' }
  );

  console.log('Megapolos Root CA generated at', crt);
}

export function getCaCrt(): string {
  ensureMegapolosCA();
  return fs.readFileSync(caCrtPath(), 'utf8');
}

export function getCaKey(): string {
  ensureMegapolosCA();
  return fs.readFileSync(caKeyPath(), 'utf8');
}

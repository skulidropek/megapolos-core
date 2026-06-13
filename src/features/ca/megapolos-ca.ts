import { execSync } from 'child_process';
import * as fs from 'fs';
import { megapolosPath } from '../../..';

// Единый корневой сертификат Megapolos.
// Создаётся один раз на ядре, раздаётся на все ноды (в devMode self-signed),
// и доступен пользователю для скачивания, чтобы доверять ресурсам кластера.

export const caDir = `${megapolosPath}/data/ca`;
export const caCrtPath = `${caDir}/ca.crt`;
export const caKeyPath = `${caDir}/ca.key`;

/**
 * Генерирует Megapolos Root CA, если его ещё нет. Идемпотентно.
 */
export function ensureMegapolosCA(): void {
  if (fs.existsSync(caCrtPath) && fs.existsSync(caKeyPath)) {
    return;
  }
  fs.mkdirSync(caDir, { recursive: true });

  // приватный ключ CA
  execSync(`openssl genrsa -out "${caKeyPath}" 4096`, { stdio: 'ignore' });
  fs.chmodSync(caKeyPath, 0o600);

  // самоподписанный корневой сертификат (10 лет)
  execSync(
    `openssl req -x509 -new -nodes -key "${caKeyPath}" -sha256 -days 3650 ` +
      `-out "${caCrtPath}" -subj "/O=Megapolos/CN=Megapolos Root CA" ` +
      `-addext "basicConstraints=critical,CA:TRUE" ` +
      `-addext "keyUsage=critical,keyCertSign,cRLSign"`,
    { stdio: 'ignore' }
  );

  console.log('Megapolos Root CA generated at', caCrtPath);
}

export function getCaCrt(): string {
  ensureMegapolosCA();
  return fs.readFileSync(caCrtPath, 'utf8');
}

export function getCaKey(): string {
  ensureMegapolosCA();
  return fs.readFileSync(caKeyPath, 'utf8');
}

import {randomBytes, scrypt} from 'crypto';
import {promisify} from 'util';

// scrypt is callback-based,
// we are making it Promise-based
const scryptAsync = promisify(scrypt);

export class Password {

  // make a hash of plain text password
  static async toHash(password: string) {
    const salt = randomBytes(8).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString('hex')}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split('.');
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    return buf.toString('hex') === hashedPassword;
  }
}

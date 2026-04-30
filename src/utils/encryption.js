import crypto from 'crypto';

// Use environment variable or fallback for development. Must be 32 bytes for AES-256-CBC.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex').slice(0, 32).padEnd(32, '0');
const IV_LENGTH = 16; // For AES, this is always 16

export function encrypt(text) {
  if (!text) return text;
  if (typeof text !== 'string') text = text.toString();
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text) {
  if (!text || typeof text !== 'string') return text;
  
  // Check if the text matches the encrypted format (iv:encryptedData)
  const textParts = text.split(':');
  if (textParts.length !== 2) return text; // Not an encrypted string, return as is
  
  try {
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    // If decryption fails, return original (might have been unencrypted legacy data)
    return text;
  }
}

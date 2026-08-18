import CryptoJS from 'crypto-js';

export const DEFAULT_ENCRYPTION_KEY =
  'securenotes_master_aes_secret_key_v1';

/**
 * Mengenkripsi plain text menjadi ciphertext AES.
 *
 * @param text - Plain text yang akan dienkripsi
 * @param key - Kunci rahasia enkripsi AES (default: master key)
 * @returns String ciphertext AES terenkripsi (misal: "U2FsdGVkX1...")
 */
export function encrypt(
  text: string,
  key: string = DEFAULT_ENCRYPTION_KEY,
): string {
  if (!text) {
    return '';
  }
  try {
    return CryptoJS.AES.encrypt(text, key).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Gagal mengenkripsi data catatan.');
  }
}

/**
 * Mendekripsi ciphertext AES kembali menjadi plain text.
 *
 * @param cipher - Ciphertext yang akan didekripsi
 * @param key - Kunci rahasia enkripsi AES (default: master key)
 * @returns Plain text asli yang didekripsi
 */
export function decrypt(
  cipher: string,
  key: string = DEFAULT_ENCRYPTION_KEY,
): string {
  if (!cipher) {
    return '';
  }
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, key);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

    if (!decryptedText && cipher.length > 0) {
      throw new Error('Kunci enkripsi tidak cocok atau data rusak.');
    }

    return decryptedText;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Gagal mendekripsi data: Kunci salah atau data korup.');
  }
}

export default {
  encrypt,
  decrypt,
  DEFAULT_ENCRYPTION_KEY,
};

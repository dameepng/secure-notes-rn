import {
  decrypt,
  DEFAULT_ENCRYPTION_KEY,
  encrypt,
} from '../src/storage/encryption';

describe('AES Encryption & Decryption Module', () => {
  const secretText = 'Ini adalah pesan rahasia yang sangat penting!';
  const customKey = 'kunci_rahasia_custom_123';

  it('should encrypt plain text to AES ciphertext', () => {
    const cipher = encrypt(secretText);

    expect(cipher).toBeDefined();
    expect(cipher).not.toBe(secretText);
    expect(typeof cipher).toBe('string');
    // OpenSSL/CryptoJS AES ciphertext typically starts with "U2FsdGVkX1" (Salted__)
    expect(cipher.length).toBeGreaterThan(0);
  });

  it('should decrypt ciphertext back to original plain text with default key', () => {
    const cipher = encrypt(secretText);
    const decrypted = decrypt(cipher);

    expect(decrypted).toBe(secretText);
  });

  it('should encrypt and decrypt with custom secret key', () => {
    const cipher = encrypt(secretText, customKey);
    const decrypted = decrypt(cipher, customKey);

    expect(decrypted).toBe(secretText);
  });

  it('should throw an error when decrypting with the wrong key', () => {
    const cipher = encrypt(secretText, customKey);

    expect(() => decrypt(cipher, 'kunci_salah_total')).toThrow(
      'Gagal mendekripsi data: Kunci salah atau data korup.',
    );
  });

  it('should return empty string when encrypting or decrypting empty string', () => {
    expect(encrypt('')).toBe('');
    expect(decrypt('')).toBe('');
  });

  it('should throw error on corrupted ciphertext', () => {
    expect(() => decrypt('ciphertext_ngawur_bukan_aes', DEFAULT_ENCRYPTION_KEY)).toThrow();
  });
});

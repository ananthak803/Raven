import CryptoJS from "crypto-js";

/**
 * Encrypts plain text using AES encryption with a key.
 * @param {string} text - The plaintext to encrypt.
 * @param {string} key - The encryption key.
 * @returns {string} The encrypted cipher text.
 */
export const encryptText = (text, key) => {
  if (!text) return "";
  if (!key) return text;
  return CryptoJS.AES.encrypt(text, key).toString();
};

/**
 * Decrypts cipher text using AES decryption with a key.
 * @param {string} cipherText - The encrypted text to decrypt.
 * @param {string} key - The decryption key.
 * @returns {string} The decrypted plaintext.
 */
export const decryptText = (cipherText, key) => {
  if (!cipherText) return "";
  if (!key) return cipherText;
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || cipherText;
  } catch (error) {
    console.error("Decryption failed:", error);
    return cipherText;
  }
};

/**
 * Converts a File object into a Base64 data URL.
 * @param {File} file - The file to convert.
 * @returns {Promise<string>} Resolve to the Base64 representation.
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Encrypts a Base64 file string.
 * @param {string} base64Str - The Base64 representation of the file.
 * @param {string} key - The encryption key.
 * @returns {string} The encrypted file content.
 */
export const encryptFileBase64 = (base64Str, key) => {
  if (!base64Str) return "";
  if (!key) return base64Str;
  return CryptoJS.AES.encrypt(base64Str, key).toString();
};

/**
 * Decrypts an encrypted file string back into a Base64 data URL.
 * @param {string} cipherText - The encrypted file data.
 * @param {string} key - The decryption key.
 * @returns {string|null} The decrypted Base64 data URL, or null if failed.
 */
export const decryptFileBase64 = (cipherText, key) => {
  if (!cipherText) return null;
  if (!key) return cipherText;
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || null;
  } catch (error) {
    console.error("File decryption failed:", error);
    return null;
  }
};

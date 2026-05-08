import CryptoJS from 'crypto-js';

/**
 * Generates a SHA-256 hash of the passcode to be used as the room ID.
 * We do not use a salt here because the user's design requires the roomHash 
 * to be deterministic based solely on the passcode so users can rejoin.
 */
export const generateRoomHash = (passcode) => {
  return CryptoJS.SHA256(passcode).toString(CryptoJS.enc.Hex);
};

/**
 * Encrypts a message using AES.
 */
export const encryptMessage = (message, passcode) => {
  return CryptoJS.AES.encrypt(message, passcode).toString();
};

/**
 * Decrypts an AES ciphertext using the passcode.
 * Returns empty string if decryption fails (wrong passcode or corrupted data).
 */
export const decryptMessage = (cipherText, passcode) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, passcode);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || ''; // If empty, could mean failed decryption
  } catch (error) {
    console.error('Decryption failed');
    return '';
  }
};

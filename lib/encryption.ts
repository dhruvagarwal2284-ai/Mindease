import CryptoJS from 'crypto-js';

// .env.local se secret key uthayega, warna default use karega (fallback ke liye)
const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || "MindEase_SIH_Super_Secret_2026";

export const encryptText = (text: string) => {
    if (!text) return "";
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptText = (ciphertext: string) => {
    if (!ciphertext) return "";
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption failed", error);
        return "Error: Could not decrypt data";
    }
};
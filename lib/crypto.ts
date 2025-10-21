import CryptoJS from 'crypto-js';

export function hashPin(pin: string): string {
  const digest = CryptoJS.SHA256(pin).toString();
  return digest; // hex string
}

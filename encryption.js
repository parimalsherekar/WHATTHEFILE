import crypto from 'crypto';
const secretKey = process.env.SECRET_KEY;


const encryptJSON = (jsonData) => {
  const jsonString = JSON.stringify(jsonData);
  const cipher = createCipher('aes-256-cbc', secretKey);
  let encrypted = cipher.update(jsonString, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decryptJSON = (encryptedData) => {
  const decipher = createDecipher('aes-256-cbc', secretKey);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
};

export default {
  encryptJSON,
  decryptJSON,
};

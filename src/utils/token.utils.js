const fs = require('fs');
const path = require('path');

const TOKEN_FILE = process.env.TOKEN_FILE_PATH || '.token';
const TOKEN_PATH = path.resolve(process.cwd(), TOKEN_FILE);

const saveToken = async (token) => {
  try {
    await fs.promises.writeFile(TOKEN_PATH, token);
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
};

const getToken = async () => {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      const token = await fs.promises.readFile(TOKEN_PATH, 'utf8');
      return token.trim();
    }
    return null;
  } catch (error) {
    console.error('Error reading token:', error);
    return null;
  }
};

const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const expMatch = token.match(/exp=(\d+)/);
    if (expMatch && expMatch[1]) {
      const expTimestamp = parseInt(expMatch[1], 10);
      const now = Math.floor(Date.now() / 1000);
      return now >= expTimestamp;
    }
    
    return true;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

module.exports = {
  saveToken,
  getToken,
  isTokenExpired
};
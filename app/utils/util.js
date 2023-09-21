const crypto = require("crypto");

function generateRandomPassword() {
  var length = 7
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, characters.length);
    randomString += characters.charAt(randomIndex);
  }

  return randomString;
}

// Export both functions.
module.exports = {
  generateRandomPassword,
};
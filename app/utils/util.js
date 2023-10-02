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

const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

const getPagingData = (fetchedData, page, limit) => {
  const { count: totalItems, data } = fetchedData;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);
  return { totalItems, data, totalPages, currentPage };
};

const zfill = (str,codeInitial, width) => {

}

const generateCode = (id, codeInitial, length) => {

  str = String(id);
  while (str.length < length) {
    str = "0" + str;
  }
  return String(codeInitial + str);
}

// Export both functions.
module.exports = {
  generateRandomPassword,
  getPagination,
  getPagingData,  
  zfill,
  generateCode
};
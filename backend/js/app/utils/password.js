const crypto = require('crypto');

const hashIter = 100000;

module.exports = {
  genRandomString: function (length) {
    return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex') /** convert to hexadecimal format */
      .slice(0, length);   /** return required number of characters */
  },
  hash: function (password, salt) {
    return crypto.pbkdf2Sync(password, salt, hashIter, 128, 'sha512').toString('hex');
  }
}

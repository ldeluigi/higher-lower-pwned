const crypto = require('crypto');

module.exports = {
  genRandomString: function (length) {
    return crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex') /** convert to hexadecimal format */
      .slice(0, length);   /** return required number of characters */
  },
  sha512: function (password, salt) {
    let hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    let value = hash.digest('hex');
    return {
      salt: salt,
      hash: value
    };
  }
}

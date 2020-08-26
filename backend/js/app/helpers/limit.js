module.exports = {
  default: 50,

  checkLimit: function (check) {
    return check.optional({ nullable: true })
      .isInt({ min: 1, max: 1000 })
      .trim()
  }
};

module.exports = {
  default: 50,

  checkLimit: function (check) {
    return check.optional({ nullable: true })
      .trim()
      .isInt({ min: 1, max: 1000 });
  }
};

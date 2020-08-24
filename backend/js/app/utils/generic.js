module.exports = {
  getOrElse: (possibleUndefined, orElse) => {
    if (possibleUndefined !== undefined) {
      return possibleUndefined;
    } else {
      return orElse;
    }
  },
};

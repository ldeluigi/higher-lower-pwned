module.exports = {
  serverStatus: function () {
    return process.env.SERVER_STATUS || "ready"
  }
}

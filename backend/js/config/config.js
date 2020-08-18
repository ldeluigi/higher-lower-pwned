module.exports = {
  port: process.env.BACKEND_PORT || 8080,
  jwtSecret: process.env.JWT_SECRET,
  mongoose: {
    url: "mongodb://mongo:27017/" + process.env.MONGO_DB_NAME || "mongodb",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      user: process.env.MONGO_DB_USERNAME || "mongodb",
      pass: process.env.MONGO_DB_PASSWORD || "",
    },
  },
};

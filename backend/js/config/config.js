
function emailTransport() {
  if (process.env.GMAIL_EMAIL && process.env.GMAIL_PASSWORD) {
    return {
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD
      }
    };
  } else if (process.env.EMAIL_DEBUG === "true") {
    return null;
  } else {
    console.log(process.env.EMAIL_DEBUG)
    throw new Error("Service not configured error. Write your own code to manage your email account with nodemailer");
  }
}


module.exports = {
  port: process.env.BACKEND_PORT || 8080,
  jwtSecret: process.env.JWT_SECRET || "DEFAULT",
  mongoose: {
    url: "mongodb://mongo:27017/" + process.env.MONGO_DB_NAME || "mongodb",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      user: process.env.MONGO_DB_USERNAME || "mongodb",
      pass: process.env.MONGO_DB_PASSWORD || "",
    },
  },
  mailsenderTransport: emailTransport(),
};

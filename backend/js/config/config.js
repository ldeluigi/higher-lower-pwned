function emailTransport() {
  if (process.env.MAILER_EMAIL && process.env.MAILER_PASSWORD) {
    if (process.env.MAILER_EMAIL.includes("@gmail.")) {
      return {
        service: "gmail",
        auth: {
          user: process.env.MAILER_EMAIL,
          pass: process.env.MAILER_PASSWORD,
        },
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
      };
    } else {
      throw new Error(
        "Email service not yet supported. Visit https://nodemailer.com/smtp/well-known/."
      );
    }
  } else if (
    process.env.EMAIL_DEBUG === "true" ||
    process.env.NODE_ENV === "test"
  ) {
    return null;
  } else {
    console.log("EMAIL_DEBUG: " + process.env.EMAIL_DEBUG);
    throw new Error(
      "Service not configured error. Write your own code to manage your email account with nodemailer"
    );
  }
}

module.exports = {
  port: process.env.BACKEND_PORT || 8080,
  jwtSecret: process.env.JWT_SECRET || "DEFAULT",
  mongoose: {
    url: (process.env.MONGO_DB_URL || "mongodb://mongo:27017") + "/" + (process.env.MONGO_DB_NAME || "mongodb"),
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

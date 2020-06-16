


module.exports = {
    mongoose: {
        url: 'mongodb://mongo:27017/',
        options: {
            useNewUrlParser: true,
            user: process.env.MONGO_DB_USERNAME || "mongodb",
            pass: process.env.MONGO_DB_PASSWORD || "",
            dbName: process.env.MONGO_DB_NAME || "mongodb"
        }
    }
};
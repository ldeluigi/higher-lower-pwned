module.exports = {
    port: 8080,
    jwtSecret: "TEST_SECRET",
    mongoose: {
        url: "mongodb-test",
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            user: "mongodb",
            pass: "",
        },
    },
};

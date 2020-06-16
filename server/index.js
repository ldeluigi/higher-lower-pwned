const express = require('express')
const app = express()
const port = process.env.BACKEND_PORT || 8080

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`HLP app listening at http://localhost:${port}`))
const express = require('express');
const app = express();

app.listen(3000, () => console.log('Listening on port 3000...'));

app.use('/', (req, res) => {
    res.send("HEJ");
});
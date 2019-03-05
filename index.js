const express = require('express');
const app = express();

app.listen(3000, () => console.log('Listening on port 3000...'));

app.use('/questions', (req, res) => {
    res.send([
        {
           id: "1",
           name: "How do you feel about the temperature?"
        },
        {
           id: "2",
           name: "How do you feel about the air humidity?"
        }
        
    ]);
});
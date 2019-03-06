const express = require('express');
const router = express.Router();
const { Question, validate } = require('../models/question');
const _ = require('lodash');


router.post('/', async (req, res) => {

    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const question = new Question({
        name: req.body.name,
    });
    console.log(question);

    await question.save();
    res.send(question);

});

router.get('/', async (req, res) => {
    const questions = await Question.find();
    res.send(questions);
});

module.exports = router;
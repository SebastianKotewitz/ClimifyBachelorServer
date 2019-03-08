const express = require('express');
const router = express.Router();
const { Question, validate } = require('../models/question');
const _ = require('lodash');
const {Feedback} = require('../models/feedback');
const mongoose = require('mongoose');


router.post('/', async (req, res) => {

    const {error} = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const question = new Question({
        name: req.body.name,
    });

    await question.save();
    res.send(question);
});

router.get('/', async (req, res) => {
    const questions = await Question.find();
    res.send(questions);
});

router.put('/:id', async (req, res) => {
    const question = await Question.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id), {
        $set: {
            name: req.body.name
        }
    }, {new: true});

    res.send(question);
});

module.exports = router;
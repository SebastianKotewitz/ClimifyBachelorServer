const {Question} = require("../models/question");
const {Room} = require("../models/room");

const deleteQuestion = async (req, res) => {
    const id = req.params.id;

    const question = await Question.findById(id);
    if (!question) return res.status(404).send(`Question with id ${id} was not found in database`);


    if (!req.user.adminOnBuildings.find(elem => elem.toString() === id.toString()))
        return res.status(403).send("User needs to be admin on question to delete it");


    const questions = await Question.find({question: id});
    for (let i = 0; i < questions.length; i++) {
        await Question.deleteMany({questions: questions[i].id});
    }

    await question.remove();

    res.send(question);
};

module.exports.deleteQuestion = deleteQuestion;

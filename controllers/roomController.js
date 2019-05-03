const {Room} = require("../models/room");
const {Question} = require("../models/question");


const deleteRoom = async (req, res) => {
    const id = req.params.id;

    const room = await Room.findById(id);
    if (!room) return res.status(404).send(`Room with id ${id} was not found in database`);

    if (!req.user.adminOnBuildings.find(elem => elem.toString() === room.building.toString()))
        return res.status(403).send("User needs to be admin on room to delete it");

    const questions = await Question.find({rooms: room.id});

    for (let i = 0; i < questions.length; i++) {
        if (questions[i].rooms.length === 1) {
            await questions[i].remove();
        } else {
            const index = questions[i].rooms.findIndex(elem => elem.toString() === room.id);
            console.log('index: ', index);
            questions[i].rooms.splice(index, 1);
            await questions[i].save();
        }

    }

    await room.remove();

    res.send(room);
};

module.exports.deleteRoom = deleteRoom;

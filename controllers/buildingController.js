const {Building} = require("../models/building");
const {Room} = require("../models/room");
const {Question} = require("../models/question");

const deleteBuilding = async (req, res) => {
    const id = req.params.id;

    if (!req.user.adminOnBuildings.find(elem => elem.toString() === id.toString()))
        return res.status(403).send("User needs to be admin on building to delete it");

    const building = await Building.findByIdAndDelete(id);
    const rooms = await Room.find({building: id});
    for (let i = 0; i < rooms.length; i++) {
        await Question.deleteMany({rooms: rooms[i].id});
    }
    await Room.deleteMany({building: id});

    if (!building) return res.status(404).send(`Building with id ${id} was not found in database`);

    res.send(building);
};

module.exports.deleteBuilding = deleteBuilding;

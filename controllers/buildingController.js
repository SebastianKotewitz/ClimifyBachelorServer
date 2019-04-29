const {Building} = require("../models/building");

const deleteBuilding = async (req, res) => {
    const id = req.params.id;

    if (!req.user.adminOnBuildings.find(elem => elem.toString() === id.toString()))
        return res.status(403).send("User needs to be admin on building to delete it");

    const building = await Building.findByIdAndDelete(id);

    if (!building) return res.status(404).send(`Building with id ${id} was not found in database`);

    res.send(building);
};

module.exports.deleteBuilding = deleteBuilding;

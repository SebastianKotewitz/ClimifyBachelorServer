import http from "./httpService";

export async function createRoom(name, buildingId) {
    const token = sessionStorage.getItem("jwtToken");
    http.defaults.headers.post["x-auth-token"] = token;
    try {
        const res = await http.post("/rooms", {name, buildingId});
        console.log(res.data);
        return res.data;
    } catch (e) {
        console.log(e.response.data);
    }
    // const res = await http.post("/rooms", {name});
}

export async function getRooms(buildingId) {
    const token = sessionStorage.getItem("jwtToken");
    http.defaults.headers.get["x-auth-token"] = token;
    const res = await http.get("rooms/fromBuilding/" + buildingId);
    return res.data;
}

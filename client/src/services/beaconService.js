import http from "./httpService";

export async function deleteBeacon(id) {
    http.defaults.headers.delete["x-auth-token"] = sessionStorage.getItem("jwtToken");
    try {
        const res = await http.delete("/beacons/" + id);
        console.log("data", res.data);
        return res.data;
    } catch (e) {
        console.log("error data", e.response.data);
    }
}


export async function createBeacon(name, uuid, buildingId) {
    http.defaults.headers.post["x-auth-token"] = sessionStorage.getItem("jwtToken");
    try {
        const res = await http.post("/beacons", {name, uuid, buildingId});
        return res.data;
    } catch (e) {
        console.log(e.response.data);
    }
}

export async function getBeacons(buildingId) {
    let url = "beacons/";
    if (buildingId) url += `?building=${buildingId}`;


    http.defaults.headers.get["x-auth-token"] = sessionStorage.getItem("jwtToken");
    const res = await http.get(url);
    return res.data;
}
export async function getBeacon(id) {
    http.defaults.headers.get["x-auth-token"] = sessionStorage.getItem("jwtToken");
    try {
        const res = await http.get("beacons/" + id);
        return res.data;
    } catch (e) {
        console.log(e.response.data);
    }
}

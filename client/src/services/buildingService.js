import http from "./httpService";

export async function deleteBuilding(id) {
    const token = sessionStorage.getItem("jwtToken");
    http.defaults.headers.delete["x-auth-token"] = token;
    try {
        const res = await http.delete("/buildings/" + id);
        console.log(res.data);
        return res.data;
    } catch (e) {
        console.log(e.response.data);
    }
}


export async function createBuilding(name) {
    const token = sessionStorage.getItem("jwtToken");
    http.defaults.headers.post["x-auth-token"] = token;
    try {
        const res = await http.post("/buildings", {name});
        console.log(res.data);
        return res.data;
    } catch (e) {
        console.log(e.response.data);
    }
    // const res = await http.post("/buildings", {name});
}

export async function getBuildings() {
    const query = "?admin=me";

    const token = sessionStorage.getItem("jwtToken");
    http.defaults.headers.get["x-auth-token"] = token;
    const res = await http.get("buildings/" + query);

    console.log("buildings", res.data);
    return res.data;
}



export async function getBuilding(id) {
    http.defaults.headers.get["x-auth-token"] = sessionStorage.getItem("jwtToken");
    try {
        const res = await http.get("buildings/" + id + "/?withFeedbackCount=true");
        console.log("YOYOYO", res.data);
        return res.data;
    } catch (e) {
        console.log(e.response.data);
    }
}

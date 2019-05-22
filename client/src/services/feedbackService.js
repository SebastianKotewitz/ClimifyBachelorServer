import http from "./httpService";

export async function getBuildingFeedback(buildingId) {
    let url = "feedback/";
    if (buildingId) url += `?building=${buildingId}`;

    http.defaults.headers.get["x-auth-token"] = sessionStorage.getItem("jwtToken");
    const res = await http.get(url);
    return res.data;
}

export async function getFeedback(id) {
    http.defaults.headers.get["x-auth-token"] = sessionStorage.getItem("jwtToken");
    try {
        const res = await http.get("feedback/" + id);
        return res.data;
    } catch (e) {
        console.log(e.response.data);
    }
}

import http from "./httpService";

export async function setActive(questionId, activeStatus) {

    http.defaults.headers.patch["x-auth-token"] = sessionStorage.getItem("jwtToken");
    const data = {
        isActive: activeStatus
    };
    const res = await http.patch("questions/setActive/" + questionId, data);
    return res.data;
}


export async function createQuestion(questionValue, answerOptions, rooms) {
    const token = sessionStorage.getItem("jwtToken");
    http.defaults.headers.post["x-auth-token"] = token;
    const data = {
        value: questionValue,
        answerOptions,
        rooms
    };
    const res = await http.post("questions/", data);
    return res.data;
}


export async function getQuestions(roomId) {
    const token = sessionStorage.getItem("jwtToken");
    http.defaults.headers.get["x-auth-token"] = token;
    const config = {
        headers: {roomId}
    };
    const res = await http.get("questions/", config);
    return res.data;
}

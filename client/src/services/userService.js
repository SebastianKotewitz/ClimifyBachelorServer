import http from "./httpService";

export async function login(email, password) {


    const res = await http.post("/auth", {email, password});
    console.log(res.data);
    sessionStorage.setItem("jwtToken", res.headers["x-auth-token"]);
    return res.data;
}

export async function signUp(email, password) {

    const res = await http.post("/users", {email, password});
    sessionStorage.setItem("jwtToken", res.headers["x-auth-token"]);
    return res.data;
}

export function logout() {
    sessionStorage.removeItem("jwtToken");
}

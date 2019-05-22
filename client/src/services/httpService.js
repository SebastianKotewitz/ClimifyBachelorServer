

import axios from "axios";



axios.interceptors.response.use(null, error => {
    console.log("INTERCEPTOR CALLED");

    const {response} = error;

    const expectedError = response && response.status >= 400 && response.status < 500;

    if (!expectedError) {
        alert("An unexpected error occured! :( Please try again!" + response.status);
    }

    return Promise.reject(error);
});

const http = axios.create({
    baseURL: "http://localhost:80/api"
});

export default http;



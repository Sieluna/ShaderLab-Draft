import { fetchFeature } from "./response.js";

let params = new URLSearchParams();

export const refreshFeature = (token, user) => {
    if (user != null && token != null) {
        Object.entries(user).forEach(([key, value]) => params.append(key, value));
        fetchFeature(`/api/user`, {
            method: "PUT",
            headers: new Headers([["Authorization", `Bearer ${token.refreshToken}`]]),
            body: params,
            redirect: "follow"
        }, result => {
            if (!result) return;
            localStorage.setItem("token", JSON.stringify({ accessToken: result.accessToken, refreshToken: token.refreshToken }));
        });
    }
}

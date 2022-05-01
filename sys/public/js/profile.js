
const submitAvatar = () => {
    fetch("/api/user/avatar", {
        method: "PUT",
        body: new FormData(document.getElementById("avatar-form")),
        redirect: "follow"
    }).then(res => {
        return res.json();
    }).then(json => {
        switch (json.status) {
            case 200:
                console.log(json)
                break;
            default:
                alert(json.msg);
        }
    })
}

window.onload = () => {
    document.querySelector("#avatar-form").addEventListener("submit", submitAvatar)
}

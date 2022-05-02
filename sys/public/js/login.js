let token = localStorage.getItem("token");

const redirect = (existData) => {
    if (existData)
        window.location.href = "../home.html";
}

const submitInfo = (target = "") => {
    fetch("/api/user" + target, {
        method: "POST",
        body: new URLSearchParams(new FormData(document.getElementById("panel-input"))),
        redirect: "follow"
    }).then(res => {
        return res.json();
    }).then(json => {
        switch (json.status) {
            case 200:
                localStorage.setItem("token", JSON.stringify(json.data));
                redirect(true);
                break;
            default:
                alert(json.msg);
        }
    });
}

window.onload = () => {
    document.querySelector(".sl-panel > .panel-login > .register").addEventListener("click", () => submitInfo());
    document.querySelector(".sl-panel > .panel-login > .login").addEventListener("click", () => submitInfo("/login"));
    let background = document.querySelector(".sl-background"),
        small = background.querySelector(".small");

    let img = new Image();
    img.src = small.src;
    img.onload = () => small.classList.add("loaded");

    let imgLarge = new Image();
    imgLarge.src = background.dataset.large;
    imgLarge.onload = () => imgLarge.classList.add("loaded");

    background.appendChild(imgLarge);
}

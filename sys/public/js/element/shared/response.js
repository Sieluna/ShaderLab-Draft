/**
 * protobuff desgin ->
 * - text: error case text content for error only
 * - json: success data only
 */

const handleResponse = response => {
    let contentType = response.headers.get("content-type");
    if (contentType.includes("application/json")) {
        return handleJsonResponse(response);
    } else if (contentType.includes("text/html")) {
        return handleTextResponse(response);
    } else {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: `Check ${contentType}`,
        });
    }
};

const handleJsonResponse = response => response.json().then(json =>{
    if (response.ok)
        return json;
});

const handleTextResponse = response => response.text().then(text => {
    if (response.ok)
        return text;
    else {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: text,
        });
        return null;
    }
});

export const fetchFeature = (input, init, callback) =>
    fetch(input, init).
    then(handleResponse).
    then(callback).
    catch(error => console.log(error));

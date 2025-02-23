// Use this for common functions

export function display(value) {
    const body = document.getElementsByTagName('body')[0]
    body.innerHTML += "<h1>" + value + "</h1>";
}
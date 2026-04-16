const dialogue = document.getElementById("dialogue");
const anim = document.getElementById("anim");
const textInput = document.getElementById("textInput");
const submitButton = document.getElementById("submitButton")

const ws = new WebSocket("ws://localhost:3001/");


ws.onopen = () => {
    console.log("client alive!!");
};
ws.onmessage = (event) => {
    dialogue.innerHTML = event.data;
};
ws.onclose = () => {
    console.log("socket closed!");
}
ws.onerror = (err) => {
    console.log(err);
}


submitButton.addEventListener("click", (event) => {
    event.preventDefault();
    ws.send(textInput.value);
    console.log(textInput.value);
});
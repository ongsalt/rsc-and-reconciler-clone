import { App } from "./App";
import { mount } from "./reconciler";
import { h } from "./jsx";

const appRoot = document.getElementById("app")!;

const names = ["Ena", "Mizuki", "Kanade", "Mafuyu"];
let nameIndex = 0;
function nextName() {
    nameIndex = (nameIndex + 1) % names.length;
    return names[nameIndex];
}

const bus = new EventTarget();
const sendMessage = (type: string) => () => bus.dispatchEvent(new Event(type));

// to simulate jsx
// const { render } = mount(appRoot, h(App, { name: nextName() }));
const s = sendMessage("rerender")

const { render } = mount(appRoot, App({ name: nextName(), rerender: s }));

// setInterval(() => {
//     // console.log("Rerender");
//     render(App({ name: nextName() }));
// }, 1000);

bus.addEventListener("rerender", () => {
    render(App({
        name: nextName(),
        rerender: s
    }));
})


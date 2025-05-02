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

const s = sendMessage("rerender")

// to simulate jsx
// const { render } = mount(appRoot, h(App, { name: nextName() }));
const { render } = mount(appRoot, App({ name: nextName(), rerender: s }));

bus.addEventListener("rerender", () => {
    render(App({
        name: nextName(),
        rerender: s
    }));
})


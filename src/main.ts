import { mount } from "./reconciler";
import { h } from "./renderer";

const appRoot = document.getElementById("app")!;

function App({ name }: { name: string; }) {
  return h("div", {}, [
    h("h1", {}, "Title"),
    h("p", {}, "ajfuihuishfiojo"),
    h("p", {}, `Hello, ${name}!`),
    h("button", { id: "rerender-btn" }, "rerender"),
    h("input")
  ]);
}

const names = ["Ena", "Mizuki", "Kanade", "Mafuyu"];
let nameIndex = 0;
function nextName() {
  nameIndex = (nameIndex + 1) % names.length;
  return names[nameIndex];
}

const { render } = mount(appRoot, App({ name: nextName() }));
setInterval(() => {
  console.log("Rerender");
  render(App({ name: nextName() }));
}, 1000);
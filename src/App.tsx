import { h, KFNode, kfNodeSymbol } from "./jsx";

export function App({ name, rerender }: { name: string; rerender: () => unknown; }) {
    return h("div", {}, [
        h("h1", {}, "Title"),
        h("p", {}, "ajfuihuishfiojo"),
        h("p", {}, `Hello, ${name}!`),
        // function identity also work
        h("button", { onclick: rerender }, "rerender"),
        h("input")
    ]);
}

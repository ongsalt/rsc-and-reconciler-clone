import { useState } from "./state";

export function App({ name, rerender }: { name: string; rerender: () => unknown; }) {
    const [count, setCount] = useState(0);
    const increment = () => setCount(it => it + 1);
    return (
        <div>
            <h1>Title</h1>
            <p> jodivhuviui </p>
            <p> Hello {name}</p>
            <p> count: {count}</p>
            <button onclick={increment}> increment </button>
            <button onclick={rerender}> Rerender </button>
            <input type="text" />
        </div>
    );
}

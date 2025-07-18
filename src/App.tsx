import { useState } from "./hooks";

export function App({ name }: { name: string; }) {
    const [count, setCount] = useState(0);
    const increment = () => setCount(it => it + 1);
    return (
        <div>
            <h1>Title</h1>
            <p> jodivhuviui </p>
            <p> Hello {name}</p>
            <p> count: {count}</p>
            <button onclick={increment}> increment </button>
            <input type="text" />
        </div>
    );
}

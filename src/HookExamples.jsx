import React, { useCallback, useEffect, useMemo, useState } from "react";

function TitleUpdater() {
  const [text, setText] = useState("");

  useEffect(() => {
    document.title = text || "React App";

    return () => {
      document.title = "React App";
    };
  }, [text]);

  return (
    <section>
      <h2>Document Title Updater</h2>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something..."
      />
      <p>Current input: {text || "(empty)"}</p>
    </section>
  );
}

function IntervalTimer() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning]);

  return (
    <section>
      <h2>Interval Timer with Cleanup</h2>
      <p>Time: {seconds}s</p>
      <button onClick={() => setIsRunning(true)}>Start</button>
      <button onClick={() => setIsRunning(false)}>Stop</button>
      <button
        onClick={() => {
          setIsRunning(false);
          setSeconds(0);
        }}
      >
        Reset
      </button>
    </section>
  );
}

function ExpensiveListFilter() {
  const [search, setSearch] = useState("");
  const [counter, setCounter] = useState(0);

  const users = useMemo(
    () =>
      Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
      })),
    []
  );

  const filteredUsers = useMemo(() => {
    console.log("Filtering users...");
    return users.filter((user) =>
      user.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  return (
    <section>
      <h2>Expensive List Filter</h2>
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={() => setCounter((c) => c + 1)}>
        Counter: {counter}
      </button>
      <p>Matches: {filteredUsers.length}</p>
      <ul>
        {filteredUsers.slice(0, 10).map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </section>
  );
}

const ListItem = React.memo(function ListItem({ item, onDelete }) {
  console.log("Rendering child:", item.name);

  return (
    <li>
      {item.name}{" "}
      <button onClick={() => onDelete(item.id)}>Delete</button>
    </li>
  );
});

function MemoizedList() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([
    { id: 1, name: "Apple" },
    { id: 2, name: "Banana" },
    { id: 3, name: "Orange" },
  ]);

  const onDelete = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <section>
      <h2>Prevent Child Re-renders</h2>
      <button onClick={() => setCount((c) => c + 1)}>
        Parent Count: {count}
      </button>
      <ul>
        {items.map((item) => (
          <ListItem key={item.id} item={item} onDelete={onDelete} />
        ))}
      </ul>
    </section>
  );
}

function DependencyFixes() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState([]);

  const options = useMemo(() => ({ limit: 10 }), []);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    Promise.resolve([{ id: 1, name: "Demo item" }]).then(setData);
  }, [options]);

  return (
    <section>
      <h2>Fix the Dependency Bugs</h2>
      <p>Count: {count}</p>
      <ul>
        {data.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </section>
  );
}

export default function HookExamples() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>React Hook Examples</h1>

      <TitleUpdater />
      <hr />

      <IntervalTimer />
      <hr />

      <ExpensiveListFilter />
      <hr />

      <MemoizedList />
      <hr />

      <DependencyFixes />
    </div>
  );
}

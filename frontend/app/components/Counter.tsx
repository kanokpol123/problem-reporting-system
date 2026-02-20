"use client";

import {useState} from 'react'

export default function Counter() {
  const [count, setCount] = useState<number>(0)
  return (
    <div>Counter: {count}
        <button className="dark:bg-slate-800" onClick={() => setCount(count + 1)}>เพิ่ม</button>
        <button className="dark:bg-slate-800" onClick={() => setCount(count - 1)}>ลด</button>
    </div>
  );
}

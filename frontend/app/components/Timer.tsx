"use client";

import { useState, useEffect } from "react";

export default function Timer() {
  const [time, setTime] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <p>เวลาผ่านไป: {time} วินาที</p>;
}
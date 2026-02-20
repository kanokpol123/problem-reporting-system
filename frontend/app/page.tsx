import Image from "next/image";
import Greeting from "./components/Greeting";
import Counter from "./components/Counter";
import Timer from "./components/Timer";     

export default function Home() {
  return (
    <main>
      <Greeting name="kanok" age={16} />
      <Counter />   
      <Timer />
    </main>
  );
}

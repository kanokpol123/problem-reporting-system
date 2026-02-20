interface GreetingProps {
  name: string,
  age: number
}

export default function Greeting({ name, age }: GreetingProps) {
  return <h1>สวัสดีครับ {name} อายุ {age} ปี</h1>
}
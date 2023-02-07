import { useFuel } from "../hooks/useFuelWeb3";

export function ConnectRequest() {
 const [fuel] = useFuel();

 return (
    <div>
        <button onClick={() => fuel.connect()}>Connect</button>
    </div>
 )
}
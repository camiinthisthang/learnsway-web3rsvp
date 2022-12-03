import { useFuelWeb3 } from "../hooks/useFuelWeb3";

export function ConnectRequest() {
 const [FuelWeb3] = useFuelWeb3();

 return (
    <div>
        <button onClick={() => FuelWeb3.connect()}>Connect</button>
    </div>
 )
}
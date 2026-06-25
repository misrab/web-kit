import { useEffect, useState } from "react";
/** React hook wiring a WsRpcClient's lifecycle + status into a component. */
export function useWsRpc({ client, onMessage, onOpen, autoConnect = true, }) {
    const [status, setStatus] = useState("connecting");
    useEffect(() => {
        const offMsg = onMessage ? client.onMessage(onMessage) : () => { };
        const offStatus = client.onStatus((s) => {
            setStatus(s);
            if (s === "open")
                onOpen?.();
        });
        if (autoConnect)
            client.connect();
        return () => {
            offMsg();
            offStatus();
            client.close();
        };
    }, [client, onMessage, onOpen, autoConnect]);
    return status;
}

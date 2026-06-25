import type { ConnectionStatus, WsRpcClient } from "./client";
export interface UseWsRpcOptions<TCommand extends {
    type: string;
    id?: string;
}, TEvent> {
    client: WsRpcClient<TCommand, TEvent>;
    onMessage?: (event: TEvent) => void;
    onOpen?: () => void;
    autoConnect?: boolean;
}
/** React hook wiring a WsRpcClient's lifecycle + status into a component. */
export declare function useWsRpc<TCommand extends {
    type: string;
    id?: string;
}, TEvent>({ client, onMessage, onOpen, autoConnect, }: UseWsRpcOptions<TCommand, TEvent>): ConnectionStatus;

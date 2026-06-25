export interface PwaInstallProps {
    appName: string;
    swPath?: string;
    accentColor?: string;
    storageKey?: string;
    registerServiceWorker?: boolean;
}
export declare function PwaInstall({ appName, swPath, accentColor, storageKey, registerServiceWorker, }: PwaInstallProps): import("react").JSX.Element | null;

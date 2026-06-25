import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useRef, } from "react";
import { useIsMobile } from "./useIsMobile";
import { registerSW } from "./registerSW";
let _deferredPrompt = null;
if (typeof window !== "undefined") {
    window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        _deferredPrompt = e;
    });
}
const INSTALLED_DELAY_MS = 3000;
export function PwaInstall({ appName, swPath = "/sw.js", accentColor = "#7c9cff", storageKey, registerServiceWorker = true, }) {
    const dismissKey = storageKey ?? `make-pwa:install-dismissed:${appName}`;
    const isMobile = useIsMobile();
    const [deferredPrompt, setDeferredPrompt] = useState(() => _deferredPrompt);
    const [show, setShow] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [justInstalled, setJustInstalled] = useState(false);
    const timerRef = useRef(undefined);
    useEffect(() => {
        if (registerServiceWorker)
            registerSW(swPath);
    }, [registerServiceWorker, swPath]);
    useEffect(() => {
        if (!isMobile) {
            setShow(false);
            return;
        }
        const standalone = window.matchMedia("(display-mode: standalone)").matches ||
            navigator.standalone === true;
        if (standalone)
            return;
        if (localStorage.getItem(dismissKey))
            return;
        setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
        // Always show on mobile. `beforeinstallprompt` is unreliable (suppressed by
        // a stale service worker, same-host manifest-id collisions, or Chrome's
        // engagement heuristics), so we never gate the banner on it — we just
        // upgrade to the one-tap Install button if/when the event arrives.
        setShow(true);
    }, [isMobile, dismissKey]);
    // Pick up the prompt if Chrome fires it after mount, and show the banner.
    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            _deferredPrompt = e;
            setDeferredPrompt(_deferredPrompt);
            if (isMobile)
                setShow(true); // mobile-only
        };
        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, [isMobile]);
    useEffect(() => () => { if (timerRef.current)
        clearTimeout(timerRef.current); }, []);
    const handleInstall = useCallback(async () => {
        if (!deferredPrompt)
            return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        _deferredPrompt = null;
        if (outcome === "accepted") {
            localStorage.setItem(dismissKey, "1");
            setJustInstalled(true);
            timerRef.current = setTimeout(() => setShow(false), INSTALLED_DELAY_MS);
        }
    }, [deferredPrompt, dismissKey]);
    if (!show)
        return null;
    // Installed confirmation
    if (justInstalled) {
        return (_jsx("div", { style: styles.banner, children: _jsxs("div", { style: styles.content, children: [_jsx("span", { style: { ...styles.icon, color: accentColor }, children: _jsx(CheckIcon, {}) }), _jsxs("span", { style: styles.text, children: ["Installed! Find ", appName, " on your home screen."] })] }) }));
    }
    // iOS: can only use share sheet
    if (isIOS) {
        return (_jsx("div", { style: styles.banner, children: _jsxs("div", { style: styles.content, children: [_jsx("span", { style: { ...styles.icon, color: accentColor }, children: _jsx(ShareIcon, {}) }), _jsxs("div", { children: [_jsxs("div", { style: styles.title, children: ["Install ", appName] }), _jsx("div", { style: styles.hint, children: "Tap the share icon below, then \"Add to Home Screen\"" })] })] }) }));
    }
    // Android + prompt ready: one-tap install
    if (deferredPrompt) {
        return (_jsxs("button", { style: { ...styles.banner, ...styles.bannerBtn }, onClick: handleInstall, children: [_jsxs("div", { style: styles.content, children: [_jsx("span", { style: { ...styles.icon, color: accentColor }, children: _jsx(DownloadIcon, {}) }), _jsxs("div", { children: [_jsxs("div", { style: styles.title, children: ["Install ", appName] }), _jsx("div", { style: styles.hint, children: "Tap to add to your home screen" })] })] }), _jsx("span", { style: { ...styles.installBtn, background: accentColor }, children: "Install" })] }));
    }
    // Android, no prompt available yet — guide the user through the menu so the
    // banner is never a dead end while Chrome decides the app is installable.
    return (_jsx("div", { style: styles.banner, children: _jsxs("div", { style: styles.content, children: [_jsx("span", { style: { ...styles.icon, color: accentColor }, children: _jsx(DownloadIcon, {}) }), _jsxs("div", { children: [_jsxs("div", { style: styles.title, children: ["Install ", appName] }), _jsx("div", { style: styles.hint, children: "Open the browser menu (\u22EE), then \"Install app\" / \"Add to Home screen\"" })] })] }) }));
}
const styles = {
    banner: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "12px 16px",
        paddingTop: "calc(12px + env(safe-area-inset-top, 0px))",
        background: "rgba(124, 156, 255, 0.12)",
        borderBottom: "1px solid rgba(124, 156, 255, 0.25)",
        flexShrink: 0,
        fontFamily: "system-ui, -apple-system, sans-serif",
        width: "100%",
        boxSizing: "border-box",
    },
    bannerBtn: {
        cursor: "pointer",
        border: "none",
        textAlign: "left",
        color: "inherit",
    },
    content: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        minWidth: 0,
        flex: 1,
    },
    icon: { display: "flex", flexShrink: 0 },
    title: {
        fontSize: 14,
        fontWeight: 600,
        lineHeight: 1.3,
    },
    hint: {
        fontSize: 12,
        opacity: 0.7,
        lineHeight: 1.4,
        marginTop: 2,
    },
    text: { fontSize: 14, lineHeight: 1.3 },
    installBtn: {
        flexShrink: 0,
        padding: "7px 16px",
        fontSize: 14,
        fontWeight: 600,
        color: "#fff",
        border: "none",
        borderRadius: 8,
        whiteSpace: "nowrap",
    },
};
function DownloadIcon() {
    return (_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }), _jsx("polyline", { points: "7 10 12 15 17 10" }), _jsx("line", { x1: "12", y1: "15", x2: "12", y2: "3" })] }));
}
function CheckIcon() {
    return (_jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("polyline", { points: "20 6 9 17 4 12" }) }));
}
function ShareIcon() {
    return (_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }), _jsx("polyline", { points: "16 6 12 2 8 6" }), _jsx("line", { x1: "12", y1: "2", x2: "12", y2: "15" })] }));
}

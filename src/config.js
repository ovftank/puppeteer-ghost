/**
 * default launch options for puppeteer
 * @type {import('rebrowser-puppeteer').LaunchOptions}
 */
export const DEFAULT_LAUNCH_OPTIONS = {
    defaultViewport: null,
    headless: false,
    browser: 'chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--disable-notifications', '--disable-extensions', '--disable-webrtc', '--disable-webrtc-encryption', '--disable-webrtc-hw-encoding', '--disable-webrtc-hw-decoding', '--disable-webrtc-multiple-routes', '--disable-webrtc-hide-local-ips-with-mdns', '--disable-webrtc-apm-downmix-capture-audio-method', '--disable-chrome-wide-echo-cancellation', '--disable-webrtc-allow-wgc-screen-capturer', '--disable-webrtc-allow-wgc-window-capturer', '--disable-webrtc-wgc-require-border', '--disable-webrtc-hw-vp8-encoding', '--disable-webrtc-hw-vp9-encoding', '--disable-rtc-smoothness-algorithm', '--disable-webrtc-stun-origin', '--enforce-webrtc-ip-permission-check', '--force-webrtc-ip-handling-policy=disable_non_proxied_udp', '--disable-media-stream', '--disable-getUserMedia-screen-capturing', '--disable-background-media-suspend', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--disable-ipc-flooding-protection', '--deny-permission-prompts', '--disable-permissions-api', '--disable-media-device-access', '--block-new-web-contents', '--disable-default-apps', '--disable-media-device-enumeration', '--disable-save-password-bubble', '--disable-features=PasswordLeakDetection,WebRTC,MediaDevices,GetUserMedia,RTCPeerConnection,RTCDataChannel', '--disable-webrtc-network-predictor', '--disable-webrtc-stun-probe-trial', '--disable-webrtc-use-pipewire', '--disable-webrtc-logs', '--disable-webrtc-event-logging', '--disable-webrtc-remote-event-log', '--disable-webrtc-apm-debug-dump', '--disable-webrtc-apm-in-audio-service']
};

/**
 * common chrome executable paths by platform
 * @type {string[]}
 */
export const CHROME_PATHS = ['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable'];

/**
 * user preferences for stealth mode
 * @type {Object}
 */
export const USER_PREFERENCES = {
    userPrefs: {
        profile: {
            password_manager_leak_detection: false
        }
    }
};

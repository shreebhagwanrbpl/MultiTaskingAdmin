// ============================================================================
// REAL-TIME SYSTEM PUSH NOTIFICATIONS & DESKTOP ALERTS UTILITY
// Works across tabs, minimized windows, and background apps on Windows/macOS
// PURE NATIVE DESKTOP NOTIFICATIONS ONLY (ZERO IN-APP FLOATING OVERLAYS)
// SINGLE UNIFIED PUSH NOTIFICATION CHIME SOUND FOR ALL NOTIFICATIONS
// ============================================================================

export function isPushNotificationSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getPushPermissionStatus() {
  if (!isPushNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestPushPermission() {
  if (!isPushNotificationSupported()) return 'unsupported';
  try {
    const perm = await Notification.requestPermission();
    return perm;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

// Single Unified Synthesized Web Audio API Chime (Plays in background tabs)
// Crisp, modern harmonic push chime: D5 (587.33Hz) -> A5 (880Hz) shimmer
export function playPushNotificationSound() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;

    // Primary bell tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
    gain1.gain.setValueAtTime(0.28, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.45);

    // Harmonic sparkle
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.26); // D6
    gain2.gain.setValueAtTime(0.2, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.55);
  } catch (e) {
    console.warn('Audio chime notice:', e);
  }
}

// Flashes tab title when user is on another tab/app
let titleFlashTimer = null;
let originalPageTitle = '';

export function startTabTitleFlash(alertText = '🔔 NEW NOTIFICATION!') {
  if (typeof document === 'undefined') return;
  if (!originalPageTitle) {
    originalPageTitle = document.title || 'Biomedical Multi-Brand Hub';
  }
  if (titleFlashTimer) clearInterval(titleFlashTimer);

  let toggle = false;
  titleFlashTimer = setInterval(() => {
    document.title = toggle ? alertText : originalPageTitle;
    toggle = !toggle;
  }, 900);

  const stopFlash = () => {
    if (titleFlashTimer) {
      clearInterval(titleFlashTimer);
      titleFlashTimer = null;
    }
    if (originalPageTitle) {
      document.title = originalPageTitle;
    }
    window.removeEventListener('focus', stopFlash);
  };

  window.addEventListener('focus', stopFlash);
}

// Throttling and Cross-Tab Notification Deduplication Registry
const inMemoryThrottle = new Map();

export function shouldThrottleNotification(tag, windowMs = 10000) {
  if (!tag || typeof window === 'undefined') return false;
  const now = Date.now();

  // 1. In-memory check (within same tab/session)
  if (inMemoryThrottle.has(tag)) {
    const prev = inMemoryThrottle.get(tag);
    if (now - prev < windowMs) {
      return true;
    }
  }
  inMemoryThrottle.set(tag, now);

  // 2. localStorage check (across multiple open tabs & windows)
  try {
    const key = `rbpl_notif_seen_${tag}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const storedTime = parseInt(stored, 10);
      if (now - storedTime < windowMs) {
        return true;
      }
    }
    localStorage.setItem(key, now.toString());
    setTimeout(() => {
      try { localStorage.removeItem(key); } catch (e) {}
    }, windowMs + 2000);
  } catch (e) {}

  return false;
}

// Master function to dispatch OS push notification (Pure native desktop only)
export function triggerSystemPushNotification({
  title,
  body,
  icon = '/rajbiosis-logo.png',
  tag,
  onClick = null
}) {
  if (typeof window === 'undefined') return null;

  const normalizedTag = tag || `rbpl-notif-${Date.now()}`;

  // Strict deduplication: suppress duplicate alerts across tabs & polling within 10 seconds
  if (shouldThrottleNotification(normalizedTag, 10000)) {
    return null;
  }

  // 1. Play the single unified audio chime
  playPushNotificationSound();

  // 2. Flash browser tab title
  startTabTitleFlash(`🔔 ${title.slice(0, 28)}...`);

  // 3. Dispatch native OS desktop notification
  if (isPushNotificationSupported()) {
    const resolvedIcon = typeof window !== 'undefined' && icon && icon.startsWith('/')
      ? `${window.location.origin}${icon}`
      : (icon || '/rajbiosis-logo.png');

    if (Notification.permission === 'granted') {
      try {
        const options = {
          body: body || '',
          icon: resolvedIcon,
          badge: resolvedIcon,
          tag: normalizedTag, // Consistent tag allows OS to collapse identical events
          renotify: false,
          requireInteraction: true // Stays on screen in OS notification center until clicked
        };

        const notification = new Notification(title, options);

        notification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          if (typeof onClick === 'function') {
            onClick();
          }
          notification.close();
        };

        return notification;
      } catch (err) {
        console.warn('Native notification instantiation error:', err);
      }
    } else if (Notification.permission === 'default') {
      try {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            try {
              const options = {
                body: body || '',
                icon: resolvedIcon,
                badge: resolvedIcon,
                tag: normalizedTag,
                renotify: false,
                requireInteraction: true
              };
              const notification = new Notification(title, options);
              notification.onclick = (event) => {
                event.preventDefault();
                window.focus();
                if (typeof onClick === 'function') onClick();
                notification.close();
              };
            } catch (e) {}
          }
        });
      } catch (err) {}
    }
  }

  return null;
}

// Multi-Tab & Cross-Process Bi-directional System Notification Broadcaster
export function broadcastSystemNotification(payload) {
  if (typeof window === 'undefined') return;
  const enriched = {
    ...payload,
    timestamp: Date.now(),
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  };

  // 1. BroadcastChannel (Works across tabs in same origin)
  try {
    const channel = new BroadcastChannel('rbpl_system_notifications');
    channel.postMessage(enriched);
    // Keep open 5 seconds so background process completes async dispatch
    setTimeout(() => {
      try { channel.close(); } catch (e) {}
    }, 5000);
  } catch (e) {
    console.warn('BroadcastChannel error:', e);
  }

  // 2. localStorage storage event fallback (Fires in all other windows/tabs reliably)
  try {
    localStorage.setItem('rbpl_push_event_sync', JSON.stringify(enriched));
  } catch (e) {}
}

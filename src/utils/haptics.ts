/**
 * Web Vibration API utility for tactile mobile haptics.
 * Provides micro-interactions and tactile feedback on mobile devices.
 */

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning';

const HAPTIC_PATTERNS: Record<HapticStyle, number | number[]> = {
  selection: 10,       // Very soft micro-pulse
  light: 15,           // Crisp navigation tap
  medium: 28,          // Primary button activation (e.g. Report modal)
  heavy: 45,           // Significant action confirmation
  success: [18, 40, 24], // Dual-pulse celebration / confirmation
  warning: [30, 50, 30], // Alert pulse
};

/**
 * Trigger haptic vibration feedback using the Web Vibration API.
 * Safely guards against missing API support, iframe permission restrictions, or browser settings.
 */
export function triggerHapticFeedback(style: HapticStyle | number | number[] = 'light'): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  // Check Vibration API availability
  if (!('vibrate' in navigator) || typeof navigator.vibrate !== 'function') {
    return false;
  }

  try {
    const pattern = typeof style === 'string' ? HAPTIC_PATTERNS[style] || 15 : style;
    return navigator.vibrate(pattern);
  } catch (err) {
    // In restricted iframes or disabled device profiles, vibrate can throw a SecurityError
    console.debug('Vibration API not permitted or available:', err);
    return false;
  }
}

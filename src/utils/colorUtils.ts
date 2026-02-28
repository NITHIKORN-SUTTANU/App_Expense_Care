/**
 * Simple color utilities for hex + alpha composition.
 */
export function hexWithAlpha(hex: string, alphaHex: string): string {
    if (!hex) return hex;
    const cleaned = hex.replace('#', '');
    if (cleaned.length === 6) {
        return `#${cleaned}${alphaHex}`;
    }
    if (cleaned.length === 8) {
        // Replace existing alpha
        return `#${cleaned.slice(0, 6)}${alphaHex}`;
    }
    // Fallback: return original
    return hex;
}

export function alphaHexFromOpacity(opacity: number): string {
    const clamped = Math.max(0, Math.min(1, opacity));
    const hex = Math.round(clamped * 255).toString(16).padStart(2, '0');
    return hex.toUpperCase();
}

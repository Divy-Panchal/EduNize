// Utility function to check localStorage quota
export function checkLocalStorageQuota(): { used: number; available: number; percentUsed: number } {
    let total = 0;

    for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
            total += localStorage[key].length + key.length;
        }
    }

    // Most browsers allow 5-10MB, we'll use 5MB as conservative estimate
    const maxStorage = 5 * 1024 * 1024; // 5MB in bytes
    const percentUsed = (total / maxStorage) * 100;

    return {
        used: total,
        available: maxStorage - total,
        percentUsed: Math.min(100, percentUsed)
    };
}

// Utility function to format bytes to human readable
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Utility function to warn user about storage
export function warnIfStorageNearLimit(): boolean {
    const { percentUsed } = checkLocalStorageQuota();

    // Warn if over 80% full
    if (percentUsed > 80) {
        return true;
    }

    return false;
}

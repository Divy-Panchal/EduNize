// localStorage utility with quota handling
// Fixes BUG-010: Graceful localStorage quota handling

export class LocalStorageManager {
    private static readonly QUOTA_EXCEEDED_ERRORS = [
        'QuotaExceededError',
        'NS_ERROR_DOM_QUOTA_REACHED',
        '1014' // Firefox error code
    ];

    /**
     * Safely set an item in localStorage with quota handling
     */
    static setItem(key: string, value: string): boolean {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error: any) {
            if (this.isQuotaExceeded(error)) {
                console.warn('localStorage quota exceeded. Attempting cleanup...');
                this.handleQuotaExceeded(key, value);
                return false;
            }
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    }

    /**
     * Safely get an item from localStorage
     */
    static getItem(key: string): string | null {
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return null;
        }
    }

    /**
     * Safely remove an item from localStorage
     */
    static removeItem(key: string): boolean {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    }

    /**
     * Check if error is quota exceeded
     */
    private static isQuotaExceeded(error: any): boolean {
        return (
            error instanceof DOMException &&
            this.QUOTA_EXCEEDED_ERRORS.some(name =>
                error.name === name || error.code === 22 || error.code === 1014
            )
        );
    }

    /**
     * Handle quota exceeded by clearing old/large data
     */
    private static handleQuotaExceeded(key: string, value: string): void {
        // Strategy 1: Clear old sample data
        const sampleKeys = Object.keys(localStorage).filter(k =>
            k.includes('sample') || k.includes('Sample')
        );
        sampleKeys.forEach(k => localStorage.removeItem(k));

        // Strategy 2: Try again after cleanup
        try {
            localStorage.setItem(key, value);
            console.info('Successfully saved after cleanup');
        } catch {
            // Strategy 3: Notify user
            alert(
                'Storage is full. Please clear some data or browser cache. ' +
                'Some features may not work correctly until storage is freed.'
            );
        }
    }

    /**
     * Get current storage usage (approximate)
     */
    static getStorageSize(): number {
        let total = 0;
        for (const key in localStorage) {
            if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }

    /**
     * Get storage size in human-readable format
     */
    static getStorageSizeFormatted(): string {
        const bytes = this.getStorageSize();
        const kb = bytes / 1024;
        const mb = kb / 1024;

        if (mb >= 1) {
            return `${mb.toFixed(2)} MB`;
        } else if (kb >= 1) {
            return `${kb.toFixed(2)} KB`;
        }
        return `${bytes} bytes`;
    }
}

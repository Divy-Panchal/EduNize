import toast from 'react-hot-toast';

/**
 * Utility functions for showing user-friendly toast notifications
 * Uses react-hot-toast for consistent styling and behavior
 */

export const showErrorToast = (message: string, duration: number = 4000) => {
    toast.error(message, {
        duration,
        position: 'top-right',
        style: {
            background: '#EF4444',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#EF4444',
        },
    });
};

export const showSuccessToast = (message: string, duration: number = 3000) => {
    toast.success(message, {
        duration,
        position: 'top-right',
        style: {
            background: '#10B981',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
        },
        iconTheme: {
            primary: '#fff',
            secondary: '#10B981',
        },
    });
};

export const showWarningToast = (message: string, duration: number = 4000) => {
    toast(message, {
        duration,
        position: 'top-right',
        icon: '⚠️',
        style: {
            background: '#F59E0B',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
        },
    });
};

export const showInfoToast = (message: string, duration: number = 3000) => {
    toast(message, {
        duration,
        position: 'top-right',
        icon: 'ℹ️',
        style: {
            background: '#3B82F6',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
        },
    });
};

/**
 * Helper to show error toast from caught errors
 * Extracts meaningful message from Error objects
 */
export const showErrorFromCatch = (error: unknown, fallbackMessage: string = 'An error occurred') => {
    let message = fallbackMessage;

    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }

    showErrorToast(message);
};

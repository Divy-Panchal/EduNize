/**
 * Validates Firebase configuration and provides helpful error messages
 * @returns Object with validation status and any error messages
 */
export const validateFirebaseConfig = () => {
    const requiredVars = {
        VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
        VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID
    };

    const missingVars = Object.entries(requiredVars)
        .filter(([, value]) => !value)
        .map(([key]) => key);

    const isValid = missingVars.length === 0;

    return {
        isValid,
        missingVars,
        message: isValid
            ? '✅ All Firebase environment variables are configured'
            : `❌ Missing Firebase environment variables: ${missingVars.join(', ')}`
    };
};

/**
 * Prints Firebase configuration status to console
 */
export const printFirebaseConfigStatus = () => {
    const result = validateFirebaseConfig();

    if (result.isValid) {
        console.log('%c' + result.message, 'color: green; font-weight: bold;');
    } else {
        console.error('%c' + result.message, 'color: red; font-weight: bold;');
        console.error('%cPlease check your .env file and ensure all required variables are set.', 'color: orange;');
        console.error('%cSee .env.example for a template.', 'color: orange;');
    }

    return result;
};

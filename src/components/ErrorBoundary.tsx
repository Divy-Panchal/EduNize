import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (import.meta.env.DEV) {
            console.error('Error caught by boundary:', error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return <ErrorFallback error={this.state.error} reset={() => this.setState({ hasError: false, error: null })} />;
        }
        return this.props.children;
    }
}

function ErrorFallback({ error, reset }: { error: Error | null; reset: () => void }) {
    // Simple dark mode detection without using ThemeContext to avoid hook issues
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center p-4`}>
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-8 max-w-md w-full shadow-2xl border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Oops! Something went wrong</h2>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>We encountered an unexpected error. Don't worry, your data is safe.</p>
                    {import.meta.env.DEV && error && (
                        <div className={`${isDark ? 'bg-gray-900' : 'bg-gray-100'} rounded-lg p-4 mb-6 text-left`}>
                            <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">{error.message}</p>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <button onClick={reset} className="flex-1 px-4 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all">
                            Try Again
                        </button>
                        <button onClick={() => window.location.href = '/'} className={`flex-1 px-4 py-3 rounded-xl font-semibold ${isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}>
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ErrorBoundary({ children, fallback }: Props) {
    return <ErrorBoundaryClass fallback={fallback}>{children}</ErrorBoundaryClass>;
}

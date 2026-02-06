// File upload types and constants

export interface UploadedFile {
    name: string;
    size: number;
    type: string;
    uri: string;
    uploadedAt: Date;
}

export interface FileValidationResult {
    isValid: boolean;
    error?: string;
}

// Supported file types
export const SUPPORTED_FILE_TYPES = {
    PDF: 'application/pdf',
    TEXT: 'text/plain',
    MARKDOWN: 'text/markdown',
} as const;

export const SUPPORTED_FILE_EXTENSIONS = ['.pdf', '.txt', '.md'] as const;

// File size limits (in bytes)
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_PDF_PAGES = 1000;

// Helper function to format file size
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Helper function to get file extension
export function getFileExtension(filename: string): string {
    return filename.slice(filename.lastIndexOf('.')).toLowerCase();
}

// Validate file before upload
export function validateFile(file: File): FileValidationResult {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            isValid: false,
            error: `File size exceeds 50MB limit. Your file is ${formatFileSize(file.size)}.`
        };
    }

    // Check file type
    const extension = getFileExtension(file.name);
    const isSupported = SUPPORTED_FILE_EXTENSIONS.includes(extension as any);

    if (!isSupported) {
        return {
            isValid: false,
            error: `Unsupported file type. Please upload PDF (.pdf) or text files (.txt, .md).`
        };
    }

    return { isValid: true };
}

import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
}

// Initialize the Gemini AI
const genAI = new GoogleGenerativeAI(API_KEY || '');

// System instruction for EduAI
const SYSTEM_INSTRUCTION = `You are EduAI, a helpful and friendly AI educational assistant integrated into EduOrganized, a student productivity app. Your role is to:

1. Help students organize their studies and manage their time effectively
2. Explain complex concepts in simple, understandable terms
3. Create practice questions and study materials
4. Provide study tips and learning strategies
5. Help with exam preparation and revision planning
6. Break down difficult topics into manageable chunks
7. Summarize notes and key points

Be encouraging, supportive, and patient. Use clear language appropriate for students. When explaining concepts, use examples and analogies. Keep responses concise but informative. Use emojis occasionally to keep the tone friendly and engaging.`;

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    fileUri?: string;
    fileName?: string;
    fileType?: string;
}

export class GeminiService {
    private model;

    constructor() {
        this.model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
        });
    }

    /**
     * Send a message to the AI and get a response
     */
    async sendMessage(message: string): Promise<string> {
        try {
            if (!API_KEY) {
                throw new Error('Gemini API key is not configured');
            }

            // Add system context to the message
            const contextualMessage = `${SYSTEM_INSTRUCTION}\n\nUser: ${message}\n\nEduAI:`;

            const result = await this.model.generateContent(contextualMessage);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error sending message to Gemini:', error);

            // Provide user-friendly error messages
            if (error instanceof Error) {
                console.error('Full error:', error);

                if (error.message.includes('API key') || error.message.includes('API_KEY_INVALID')) {
                    throw new Error('Invalid API key. Please check your Gemini API configuration.');
                }
                if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
                    throw new Error('API quota exceeded. Please try again later.');
                }
                if (error.message.includes('fetch failed') || error.message.includes('Failed to fetch')) {
                    throw new Error('Unable to connect to Gemini API. Please check your internet connection.');
                }
                // Return the actual error message for debugging
                throw new Error(`Gemini API Error: ${error.message}`);
            }

            throw new Error('Failed to get response from EduAI. Please try again.');
        }
    }

    /**
     * Send a message with streaming response
     */
    async *sendMessageStream(message: string): AsyncGenerator<string, void, unknown> {
        try {
            if (!API_KEY) {
                throw new Error('Gemini API key is not configured');
            }

            const contextualMessage = `${SYSTEM_INSTRUCTION}\n\nUser: ${message}\n\nEduAI:`;

            const result = await this.model.generateContentStream(contextualMessage);

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                yield chunkText;
            }
        } catch (error) {
            console.error('Error streaming message from Gemini:', error);
            throw new Error('Failed to stream response from EduAI. Please try again.');
        }
    }

    /**
     * Upload a file to Gemini File API
     */
    async uploadFile(file: File): Promise<{ uri: string; mimeType: string }> {
        try {
            if (!API_KEY) {
                throw new Error('Gemini API key is not configured');
            }

            // Convert file to base64
            const fileData = await this.fileToGenerativePart(file);

            // For now, we'll use inline data approach since File API requires server-side implementation
            // Store file data for use in next message
            return {
                uri: fileData.inlineData.data,
                mimeType: fileData.inlineData.mimeType
            };
        } catch (error) {
            console.error('Error uploading file to Gemini:', error);
            throw new Error('Failed to upload file. Please try again.');
        }
    }

    /**
     * Convert file to Gemini-compatible format
     */
    private async fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Data = (reader.result as string).split(',')[1];
                resolve({
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type
                    }
                });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Send a message with file context
     */
    async sendMessageWithFile(message: string, file: File): Promise<string> {
        try {
            if (!API_KEY) {
                throw new Error('Gemini API key is not configured');
            }

            // Convert file to generative part
            const filePart = await this.fileToGenerativePart(file);

            // Add system context to the message
            const contextualMessage = `${SYSTEM_INSTRUCTION}\n\nUser has uploaded a file: ${file.name}\n\nUser: ${message}\n\nEduAI:`;

            // Send message with file
            const result = await this.model.generateContent([
                contextualMessage,
                filePart
            ]);

            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('Error sending message with file to Gemini:', error);

            if (error instanceof Error) {
                if (error.message.includes('API key') || error.message.includes('API_KEY_INVALID')) {
                    throw new Error('Invalid API key. Please check your Gemini API configuration.');
                }
                if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
                    throw new Error('API quota exceeded. Please try again later.');
                }
                if (error.message.includes('fetch failed') || error.message.includes('Failed to fetch')) {
                    throw new Error('Unable to connect to Gemini API. Please check your internet connection.');
                }
                throw new Error(`Gemini API Error: ${error.message}`);
            }

            throw new Error('Failed to process file with EduAI. Please try again.');
        }
    }

    /**
     * Reset the chat history (no-op in this simplified version)
     */
    resetChat(): void {
        // No chat history to reset in this version
    }
}

// Export a singleton instance
export const geminiService = new GeminiService();

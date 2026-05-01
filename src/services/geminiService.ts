import { GoogleGenerativeAI, FunctionDeclaration, SchemaType, Content } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
}

// Initialize the Gemini AI
const genAI = new GoogleGenerativeAI(API_KEY || '');

// Define the Agentic Tools
const createTaskDeclaration: FunctionDeclaration = {
    name: "create_task",
    description: "Creates a new task in the user's to-do list.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            title: { type: SchemaType.STRING, description: "The task title or description" },
            priority: { type: SchemaType.STRING, description: "Task priority: low, medium, or high" }
        },
        required: ["title", "priority"]
    }
};

const startPomodoroDeclaration: FunctionDeclaration = {
    name: "start_pomodoro",
    description: "Starts the pomodoro timer in a specific mode.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            mode: { type: SchemaType.STRING, description: "The mode to start: work, short, or long" }
        },
        required: ["mode"]
    }
};

const SYSTEM_INSTRUCTION = `You are EduAI, an advanced Agentic AI educational assistant integrated into EduNize. 
Your role is to help students organize their studies, manage time, and act as a smart copilot.
You have access to tools that can directly control the app! 

CRITICAL RULE: If a user asks to add a task or start a timer, you MUST use the provided tools (create_task or start_pomodoro). Do NOT just output text saying you did it. You MUST invoke the function call. 

Always be encouraging, supportive, and concise.`;

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    fileUri?: string;
    fileName?: string;
    fileType?: string;
}

export type ToolExecutors = {
    [key: string]: (args: any) => Promise<string> | string;
};

export class GeminiService {
    private getModel(appContext: string = '') {
        return genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: {
                role: 'system',
                parts: [{ text: `${SYSTEM_INSTRUCTION}\n\nCurrent App Context:\n${appContext}` }]
            },
            tools: [{
                functionDeclarations: [createTaskDeclaration, startPomodoroDeclaration]
            }]
        });
    }

    async sendMessage(
        message: string,
        history: Message[] = [],
        appContext: string = '',
        toolExecutors?: ToolExecutors
    ): Promise<{ text: string, actionPerformed?: string }> {
        try {
            if (!API_KEY) throw new Error('Gemini API key is not configured');

            const model = this.getModel(appContext);
            
            // Format history and enforce strict rules:
            // 1. Must start with 'user'
            // 2. Must strictly alternate
            const chatHistory: Content[] = [];
            let expectedRole = 'user';

            for (const msg of history) {
                const role = msg.role === 'assistant' ? 'model' : 'user';
                
                // Skip until we find the first user message
                if (chatHistory.length === 0 && role !== 'user') continue;

                if (role === expectedRole) {
                    chatHistory.push({
                        role: role,
                        parts: [{ text: msg.content || ' ' }]
                    });
                    expectedRole = expectedRole === 'user' ? 'model' : 'user';
                }
            }

            // The history must end with a 'model' role, because we are about to send a 'user' message
            if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'user') {
                chatHistory.pop(); // Remove the dangling user message
            }

            const chat = model.startChat({ history: chatHistory });
            let result = await chat.sendMessage(message);
            let response = result.response;
            let actionPerformed: string | undefined;

            // Handle Function Calls (Agentic Loop)
            const functionCalls = response.functionCalls();
            if (functionCalls && functionCalls.length > 0) {
                const call = functionCalls[0];
                const toolName = call.name;
                const args = call.args;
                
                let functionResultStr = "Action executed successfully.";
                
                if (toolExecutors && toolExecutors[toolName]) {
                    try {
                        const res = await toolExecutors[toolName](args);
                        if (res) functionResultStr = res;
                        actionPerformed = `Executed ${toolName} tool`;
                    } catch (e: any) {
                        functionResultStr = `Error executing tool: ${e.message}`;
                    }
                } else {
                    functionResultStr = `Tool ${toolName} not implemented in frontend.`;
                }

                // Send function response back to the model to get final text
                result = await chat.sendMessage([{
                    functionResponse: {
                        name: toolName,
                        response: { result: functionResultStr }
                    }
                }]);
                response = result.response;
            }

            return {
                text: response.text(),
                actionPerformed
            };
        } catch (error: any) {
            console.error('Error in GeminiService:', error);
            throw new Error(error.message || 'Failed to get response from EduAI');
        }
    }

    async sendMessageWithFile(message: string, file: File): Promise<{ text: string }> {
        // Simplified fallback for files
        const model = this.getModel();
        const base64Data = await this.fileToBase64(file);
        
        const result = await model.generateContent([
            message,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: file.type
                }
            }
        ]);
        
        return { text: result.response.text() };
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }

    resetChat(): void {}
}

export const geminiService = new GeminiService();

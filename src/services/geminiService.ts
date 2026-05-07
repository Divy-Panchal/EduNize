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
    description: "Creates a new task in the user's to-do list. Always set a due_date. If the user says 'tomorrow', calculate tomorrow's date from today. If no deadline is mentioned, default to today.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            title: { type: SchemaType.STRING, description: "The task title or description" },
            priority: { type: SchemaType.STRING, description: "Task priority: 'low', 'medium', or 'high'. Infer from context — urgent/important = high, normal = medium, minor = low. Default to 'medium'." },
            due_date: { type: SchemaType.STRING, description: "Due date in YYYY-MM-DD format. Calculate from context: 'tomorrow' means today + 1 day, 'next week' means today + 7 days, etc. Use the current date from App Context." },
            category: { type: SchemaType.STRING, description: "Task category like 'Study', 'Assignment', 'Project', 'General'. Infer from context. Default to 'General'." }
        },
        required: ["title", "priority", "due_date"]
    }
};

const startPomodoroDeclaration: FunctionDeclaration = {
    name: "start_pomodoro",
    description: "Starts the pomodoro timer. If the user specifies a duration (e.g. '50 minutes'), pass it as duration_minutes and set mode to 'work'. If no duration is given and user just says 'start a timer', ask them how long they want to study. Predefined modes: 'work' (default 25 min), 'short' (5 min break), 'long' (15 min break).",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            mode: { type: SchemaType.STRING, description: "The mode: 'work', 'short', or 'long'. Use 'work' for custom duration study sessions." },
            duration_minutes: { type: SchemaType.NUMBER, description: "Optional custom duration in minutes. If provided, overrides the default duration for the selected mode. E.g. 50 for a 50-minute session." }
        },
        required: ["mode"]
    }
};

const SYSTEM_INSTRUCTION = `You are EduAI, an advanced Agentic AI educational assistant integrated into EduNize. 
Your role is to help students organize their studies, manage time, and act as a smart copilot.
You have access to tools that can directly control the app! 

CRITICAL RULES:
1. If a user asks to add a task or start a timer, you MUST use the provided tools (create_task or start_pomodoro). Do NOT just output text saying you did it. You MUST invoke the function call.
2. For Pomodoro timer:
   - If the user specifies a duration (e.g. "start a 50 minute timer"), call start_pomodoro immediately with mode "work" and duration_minutes set to that number.
   - If the user says "start a pomodoro" or "start a work session" without a duration, ask them: "How many minutes would you like to study for?" Do NOT call the tool yet.
   - For breaks: "take a short break" → mode "short", "take a long break" → mode "long". No need to ask duration for breaks.
3. For tasks: Act decisively. Execute first, confirm after. Do not ask for unnecessary details — use reasonable defaults.

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
                
                let functionResultStr = "Action completed.";
                
                if (toolExecutors && toolExecutors[toolName]) {
                    try {
                        const res = await toolExecutors[toolName](args);
                        if (res) functionResultStr = res;
                        actionPerformed = `Executed ${toolName} tool`;
                    } catch (e: any) {
                        functionResultStr = `Error: ${e.message}`;
                    }
                } else {
                    functionResultStr = `Tool ${toolName} is not available.`;
                }

                // Return the tool result directly without a second API call
                // This saves 1 API request per tool use (critical for free tier)
                return {
                    text: functionResultStr,
                    actionPerformed
                };
            }

            return {
                text: response.text(),
                actionPerformed
            };
        } catch (error: any) {
            console.error('Error in GeminiService:', error);
            const msg = error.message || 'Failed to get response from EduAI';
            if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
                throw new Error('⏳ Rate limit reached. Please wait ~60 seconds and try again. (Tip: Free tier allows 15 requests/minute)');
            }
            throw new Error(msg);
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

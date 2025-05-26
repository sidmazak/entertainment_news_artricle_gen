import { OpenAI } from 'openai';
import { ChatCompletion } from 'openai/resources';

// const openai = new OpenAI({
//     apiKey: process.env.OPEN_AI_KEY,
// });

const openAI = async (sys_prompt: string, prompt: string, apiKey: string): Promise<ChatCompletion | null> => {
    try {
        if(!apiKey) return null;
        const openai = new OpenAI({
            apiKey: apiKey
        })
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini-search-preview',
            messages: [
                { role: 'system', content: sys_prompt },
                { role: 'user', content: `${prompt}` }
            ]
        });
        return response; // Return the full response object
    } catch (err) {
        console.error('Error:', (err as Error).message);
        return null;
    }
};


export default openAI;
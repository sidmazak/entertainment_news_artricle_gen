import openAI from '@/lib/openai';
//import { ChatCompletion } from 'openai/resources'; // Import ChatCompletion type

// Define a simple pricing map (costs are per million tokens)
const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o-mini-search-preview-2025-03-11': { input: 2.5, output: 10 }, // Example pricing, adjust as needed
    // Add other models if necessary
};

// Function to calculate cost
function calculateCost(model: string, inputTokens: number, outputTokens: number): number | null {
    const modelPricing = pricing[model];
    if (!modelPricing) {
        console.warn(`Pricing not found for model: ${model}`);
        return null;
    }
    const inputCost = (inputTokens / 1_000_000) * modelPricing.input;
    const outputCost = (outputTokens / 1_000_000) * modelPricing.output;
    return inputCost + outputCost;
}

export default function pipeline(steps: {
    inputBuilder: (results: Record<string, any>) => string;
    prompt: string;
    resultKey: string;
    eventName: string;
}[], apiKey: string) {
    const results:Record<string, any>  = {};
    const stream = new ReadableStream({
        async start(controller) {
            let totalEstimatedCost = 0; // Initialize total cost tracker
            let totalInputTokens = 0; // Initialize total input tokens tracker
            let totalOutputTokens = 0; // Initialize total output tokens tracker
            try {
                for (const step of steps) {
                    const input = step.inputBuilder(results);
                    const response = await openAI(step.prompt, input, apiKey); // Get full response

                    if (!response) {
                        controller.enqueue(`event: error\ndata: ${JSON.stringify({ error: `Failed to get response for step: ${step.eventName}` })}\n\n`);
                        continue; // Skip to next step on error
                    }

                    const result = response.choices[0]?.message?.content || null; // Extract content
                    const usage = response.usage; // Extract usage
                    const model = response.model; // Extract model

                    results[step.resultKey] = result; // Store content in results for subsequent steps

                    const inputTokens = usage?.prompt_tokens || 0;
                    const outputTokens = usage?.completion_tokens || 0;
                    const estimatedCost = calculateCost(model, inputTokens, outputTokens);

                    // Log the calculated price for the current step
                    console.log(`Step: ${step.eventName}, Model: ${model}, Input Tokens: ${inputTokens}, Output Tokens: ${outputTokens}, Estimated Cost: ${estimatedCost !== null ? '$' + estimatedCost.toFixed(6) : 'N/A'}`);

                    // Add estimated cost and tokens to the total, if valid
                    if (typeof estimatedCost === 'number') {
                        totalEstimatedCost += estimatedCost;
                    }
                    totalInputTokens += inputTokens;
                    totalOutputTokens += outputTokens;

                    const eventData = {
                        [step.resultKey]: result,
                        usage: {
                            input_tokens: inputTokens,
                            output_tokens: outputTokens,
                            model: model,
                            estimated_cost: estimatedCost !== null ? parseFloat(estimatedCost.toFixed(6)) : 'N/A',
                        }
                    };

                    controller.enqueue(`event: ${step.eventName}\ndata: ${JSON.stringify(eventData)}\n\n`);
                }

                // Log the total estimated cost and tokens when complete
                console.log(`Pipeline Complete. Total Input Tokens: ${totalInputTokens}, Total Output Tokens: ${totalOutputTokens}, Total Estimated Cost: ${totalEstimatedCost !== null ? '$' + totalEstimatedCost.toFixed(6) : 'N/A'}`);

                controller.enqueue(`event: complete\ndata: {}\n\n`);
                controller.close();
            } catch (error) {
                controller.enqueue(`event: error\ndata: ${JSON.stringify({ error: (error as Error).message })}\n\n`);
                controller.close();
            }
        }
    });
    return stream;
}
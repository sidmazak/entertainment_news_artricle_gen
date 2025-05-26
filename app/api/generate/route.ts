import { NextResponse } from 'next/server';
import pipeline from '@/lib/pipeline';
import steps from '@/lib/steps';

  
export async function POST(request: Request) {
    try {
        let body;
        try {
          body = await request.json();
        } catch (error) {
          console.error('JSON Parsing Error:', (error as Error).message, 'Raw body:', await request.text());
          return NextResponse.json(
            { error: 'Invalid JSON payload', details: (error as Error).message },
            { status: 400 }
          );
        }

    const API_KEY = body?.apiKey
    if(!API_KEY){
        return NextResponse.json(
            {error: 'API Key not Provided!'},
            {status: 400}
        )
    }

     const pipeline_steps = steps(body, NextResponse);
     //console.log(pipeline_steps)
     const stream: ReadableStream = pipeline(pipeline_steps, API_KEY);
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } catch (error) {
      console.error('API Request Error:', error);
      return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
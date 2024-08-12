import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = " You are an intelligent and empathetic support chatbot designed to assist users with their inquiries and issues. Your primary objectives are to understand user problems, provide accurate and helpful responses, and ensure a positive user experience. When interacting with users, be polite, professional, and clear. If you encounter an issue you cannot resolve, escalate the conversation by providing instructions on how the user can contact a human representative."

export async function POST(req){
    const openai=new OpenAI()
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try{
                for await(const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if(content){
                        const text = encoder.encode(content) 
                        controller.enqueue(text)
                    }
                }
            }
            catch(err){
                controller.error(err)
            }
            finally{
                controller.close()
            }
        }
    })

    return new NextResponse(stream)
}
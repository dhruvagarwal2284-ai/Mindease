import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { text } = await request.json();

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                messages: [
                    {
                        role: "system",
                        content: "You are a supportive mental health algorithm. Analyze the user text and output ONLY a valid JSON object in this format: {\"risk_level\": \"High\" or \"Low\", \"suggestion\": \"string\"}. For the suggestion, choose the most appropriate empathetic response from these options: 'Do you need counselling?', 'Do you need assistance?', 'Would you like to express more?', or 'You are doing great! Keep it up!'. DO NOT output any other text."
                    },
                    { role: "user", content: text }
                ],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        
        // Safety check: If Groq returns an error instead of choices
        if (!data.choices || !data.choices[0]) {
            console.error("Groq API returned an error:", data);
            return NextResponse.json({ risk_level: "Low", suggestion: "Would you like to express more?" });
        }
        
        const aiResult = JSON.parse(data.choices[0].message.content);
        return NextResponse.json(aiResult);

    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json({ risk_level: "Low", suggestion: "We are here to support you." });
    }
}
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { message, dashboardData } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // 高速で安価なモデル
    messages: [
      {
        role: "system",
        content: `あなたは物流拠点の司令官を支える有能なAIストラテジストです。
        提供されるダッシュボードのデータ（実績と予測）を分析し、具体的で短いアドバイスを行ってください。
        文体は「軍の作戦参謀」のように、信頼感がありつつ少しキレのあるスタイルでお願いします。`
      },
      {
        role: "user",
        content: `現在のデータ: ${JSON.stringify(dashboardData)}\n\nユーザーの質問: ${message}`
      }
    ],
  });

  return NextResponse.json({ text: response.choices[0].message.content });
}
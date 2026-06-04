import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAIの初期化（環境変数はご自身の環境に合わせてください）
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 画面側から送られてくるフラグ（analysisType）を受け取る
    const { tabId, items, analysisType } = await req.json();

    let systemPrompt = '';

    // 🌟 画面側から 'summary'（要約）の指示が来た場合のプロンプト
    if (analysisType === 'summary' || tabId === 'actions') {
      systemPrompt = `あなたは優秀な物流コンサルタント兼エグゼクティブ秘書です。
以下のJSONデータは、現在センターで進行中の「DX推進」「現場改善」「営業活動」のアクションリストです。
これらを統合し、センター長や経営層が「今現場で何が動いているか」を瞬時に把握できるよう、以下の構成で【要約（エグゼクティブ・サマリー）】を作成してください。
※無理な評価や採点は不要です。事実ベースでわかりやすくまとめてください。

【出力構成】
1. 🎯 全体サマリー（現在どんな施策を中心に動いているか、簡潔な2〜3行の文章で）
2. 🚀 進行中の主要アクション（DX、現場改善、営業活動のデータから、現在動いている注力項目を箇条書きで数点ピックアップ）
3. 💡 コンサルタントの視点（進捗が遅れているものへのリマインドや、顧客関連の連携など、軽いアドバイスを1〜2行）`;
    } 
    // 🌟 それ以外（請負予実など）の「評価」プロンプト
    else {
      systemPrompt = `あなたはプロの物流コンサルタントです。
以下のJSONデータを分析し、専門的な視点から経営陣に向けた短いインサイト（評価や改善点）を提示してください。
・箇条書きで簡潔に
・文字数は200〜300字程度
・専門用語を適切に交えて説得力を持たせること`;
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // または gpt-4o など、使用しているモデル
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(items) }
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ evaluation: response.choices[0].message.content });
    
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
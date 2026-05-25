import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { tabId, items } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "【環境変数エラー】APIキーが設定されていません。" }, { status: 500 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ evaluation: "データが登録されていないため、AI診断できません。まずはデータを追加してください。" });
    }

    // タブの種類に応じたコンテキストを設定
    let contextName = "";
    if (tabId === 'dx') contextName = "DX推進プロジェクト";
    if (tabId === 'env') contextName = "現場改善プロジェクト";
    if (tabId === 'history') contextName = "営業アプローチ履歴";

    // 🤖 テキスト解読用のプロンプト
    const prompt = `あなたは物流・拠点運営に精通した超一流の経営コンサルタントです。
現在、拠点のダッシュボードの「${contextName}」タブに登録されているデータリストを渡します。
このテキストデータを読み解き、現在の進捗状況、取り組みの質、ボトルネック、そして次月以降に向けたネクストアクションを鋭く分析してください。

【評価のポイント】
- DX/現場改善の場合：進捗率（完了度合い）や、狙っている効果の具体性、顧客に関連しているか等を評価してください。
- 営業履歴の場合：提案内容の質や、成約（●）と失注（×）のバランス、今後の追走余地を評価してください。

出力はJSONフォーマットではなく、そのまま読める「プレーンテキスト（文字列）」で返してください。
文字数は「200文字〜300文字程度」で、経営陣が読んでハッとするようなプロのコメントにまとめてください。

【対象データ】
${JSON.stringify(items)}
`;

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', 
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4
      })
    });

    if (!openAiResponse.ok) {
      const errText = await openAiResponse.text();
      throw new Error(`OpenAI API エラー: ${errText}`);
    }

    const aiJson = await openAiResponse.json();
    const evaluation = aiJson.choices[0].message?.content || "評価を生成できませんでした。";
    
    return NextResponse.json({ evaluation });

  } catch (error: any) {
    console.error("タブAI通信エラー:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
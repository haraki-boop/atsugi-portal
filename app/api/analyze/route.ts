import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { month, allMetrics, portfolioData } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        summaryMetrics: "【環境変数エラー】APIキー（OPENAI_API_KEY）が検出されませんでした。",
        summaryManhours: "手元のPCで動かしている場合は .env.local にキーを設定し、サーバーを再起動してください。",
        summaryPerformance: "Vercelの場合は Environment Variables を確認してください。",
        summaryOverall: "APIキーが設定されていないため、総合評価は生成できませんでした。"
      }, { status: 500 });
    }

    // 🤖 チャッピーへの【超スパルタ・ガチ指導入り】プロンプト
    const prompt = `あなたは物流・拠点運営に精通した超一流の経営コンサルタントです。
提供された昭和冷蔵の${month}月度の「全運営データ」を多角的に分析し、経営陣向けに極めてシャープで実戦的なアドバイスを生成してください。

【🚨 AI評価における絶対の基準（これを破ると致命的なミスになります） 🚨】
ダッシュボードのシステムでは、以下の項目は「数値が低いほど優秀（コストやリスク）」として判定しています。
[労務費, タイミー, 外注費, 社会保険, 雇用保険, 有給, 交通費, 工数, 事故, 償却, 残業, 違反者]
これらの項目において、目標達成率（ratio）が100%未満であることは『予算や想定を大きく下回り、コスト削減やリスク回避に成功している非常に素晴らしい状態』です。逆に100%を超過している場合は『予算オーバー・赤字リスク』です。
一方、[売上, 利益, 生産性] などの指標は通常通り100%以上が「良」です。
AI特有のミスとして、「労務費」や「残業」が100%未満になっているのを見て『目標未達で悪い状態だ』と評価する間違いを絶対に犯さないでください。コスト減は手放しで最高評価してください。

指示に従い、指定されたJSONフォーマットのみを出力してください。マークダウン（\`\`\`json などの枠）は絶対に含めず、純粋なJSONオブジェクトだけを返してください。

【出力JSONフォーマット】
{
  "summaryMetrics": "主要・コスト指標の評価（150〜200文字程度）。売上や労務費だけでなく、タイミーや残業など、渡された『全データ』から目立つポイントを拾い深掘りしてください。",
  "summaryManhours": "月間工数内訳の評価（150〜200文字程度）。総工数に対する各現場のシェアや、間接工数の割合の多寡をズバッと指摘し、リソース配置が適正か分析してください。",
  "summaryPerformance": "全体のパフォーマンス評価（150〜200文字程度）。全データから最も上振れている強みと、下振れているリスクを総括し、次月の戦略案を提示してください。",
  "summaryOverall": "ダッシュボード全体の『総合評価（エグゼクティブ・サマリー）』（400〜500文字程度）。すべての膨大な指標から拠点の真の課題を見抜き、プロのコンサルとして厳しくも的確に総括してください。※コスト削減への評価を正しく行うこと。"
}

【昭和冷蔵の経営データ】
対象月: ${month}月度
全指標の目標達成率と推移データ（※数十項目あります）: ${JSON.stringify(allMetrics)}
各現場の月間投下工数実績（総工数ベースの内訳）: ${JSON.stringify(portfolioData)}
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
        response_format: { type: "json_object" }, 
        temperature: 0.3 
      })
    });

    if (!openAiResponse.ok) {
      const errText = await openAiResponse.text();
      throw new Error(`OpenAI API 応答エラー: ${errText}`);
    }

    const aiJson = await openAiResponse.json();
    const resultText = aiJson.choices[0].message?.content || "{}";
    
    return NextResponse.json(JSON.parse(resultText));

  } catch (error: any) {
    console.error("チャッピー通信エラー:", error);
    return NextResponse.json({
      summaryMetrics: `【通信エラー】 ${error.message}`,
      summaryManhours: "API処理中に問題が発生しました。",
      summaryPerformance: "OpenAIサーバー混雑などの可能性があります。",
      summaryOverall: "エラーが発生したため、総合評価は生成されませんでした。"
    }, { status: 500 });
  }
}
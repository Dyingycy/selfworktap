import { GoogleGenAI } from '@google/genai';
import { DailyBriefing, NewsArticle } from '@/types';

// In-memory cache for daily briefing to avoid repeatedly consuming API quotas
let cachedBriefing: { date: string; data: DailyBriefing } | null = null;

function getClient(userApiKey?: string): GoogleGenAI | null {
  const key = userApiKey || process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

export async function generateDailyBriefing(
  articles: NewsArticle[],
  userApiKey?: string,
  forceRefresh: boolean = false
): Promise<DailyBriefing> {
  const todayStr = new Date().toISOString().split('T')[0];

  if (!forceRefresh && cachedBriefing && cachedBriefing.date === todayStr) {
    return cachedBriefing.data;
  }

  const client = getClient(userApiKey);
  if (!client) {
    return getDefaultBriefing(articles);
  }

  const articlesContext = articles
    .slice(0, 15)
    .map((a, i) => `${i + 1}. [${a.sourceName}] ${a.title}: ${a.summary}`)
    .join('\n');

  const prompt = `你是一位顶尖的科技主编与 AI 智库顾问。请根据以下今天采集到的科技资讯与热点，为读者撰写一份精炼、高价值、富有人文与产业前瞻洞察的「今日科技晨报」。

新闻素材：
${articlesContext}

请严格按以下 JSON 格式返回，不要包含 markdown 标记或任何多余文字：
{
  "title": "今日科技风向标标题（15字内，具有洞察力）",
  "overview": "今日宏观科技趋势与核心脉络总述（100-150字，文笔精炼优美，直击要害）",
  "highlights": [
    {
      "title": "焦点新闻1精炼标题",
      "takeaway": "核心事实与进展（50字内）",
      "impact": "为什么重要及行业深远影响（50字内）"
    },
    {
      "title": "焦点新闻2精炼标题",
      "takeaway": "核心事实与进展（50字内）",
      "impact": "为什么重要及行业深远影响（50字内）"
    },
    {
      "title": "焦点新闻3精炼标题",
      "takeaway": "核心事实与进展（50字内）",
      "impact": "为什么重要及行业深远影响（50字内）"
    }
  ],
  "techTrends": [
    "趋势关键词1",
    "趋势关键词2",
    "趋势关键词3"
  ],
  "quoteOfTheDay": "一句启发思考的科技或极客名言/洞察金句"
}`;

  try {
    let rawText = '';
    try {
      // Primary: Try interactions API with gemini-3.8-flash
      const interaction = await client.interactions.create({
        model: 'gemini-3.8-flash',
        input: prompt,
      });
      rawText = interaction.output_text || '';
    } catch {
      // Fallback: Try models.generateContent with gemini-flash-latest / gemini-2.5-flash
      const resp = await client.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
      });
      rawText = resp.text || '';
    }

    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    const result: DailyBriefing = {
      date: todayStr,
      title: parsed.title || '今日前沿科技动态全景',
      overview: parsed.overview || '今日人工智能、移动生态与前沿技术正在加速渗透实际应用场景。',
      highlights: parsed.highlights || [],
      techTrends: parsed.techTrends || ['端侧算力', '智能体生态', '极客创新'],
      quoteOfTheDay: parsed.quoteOfTheDay || '科技最大的魅力，在于把未来的可能性具象在每一次日常迭代中。',
      generatedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    cachedBriefing = { date: todayStr, data: result };
    return result;
  } catch (err) {
    console.error('Gemini daily brief generation failed, using structured fallback:', err);
    return getDefaultBriefing(articles);
  }
}

export async function askGemini(
  title: string,
  content: string,
  question: string,
  userApiKey?: string
): Promise<{ answer: string; keyPoints: string[] }> {
  const client = getClient(userApiKey);
  if (!client) {
    return {
      answer:
        '⚠️ 尚未配置 Google Gemini API Key。请前往工作台右下角「设置」中填入您的 Gemini API Key，即可开启与大模型的实时深度交互。',
      keyPoints: ['未检测到 API Key', '支持在设置中免重启配置', '数据仅保存在您本地设备'],
    };
  }

  const prompt = `你是一位客观、敏锐且通俗易懂的资深科技分析师。
针对以下这则科技资讯/热点：
【标题】：${title}
【内容详情】：${content}

用户提出了以下问题：
"${question}"

请做出专业、切中要害、逻辑清晰的解答。
要求：
1. 语言亲切通俗，避免堆砌晦涩名词；
2. 给出 1-2 段深度阐述；
3. 提取 3 条核心要点清单（用 JSON 格式输出）。

请严格输出为以下格式的 JSON：
{
  "answer": "深度解答文本...",
  "keyPoints": ["要点1", "要点2", "要点3"]
}`;

  try {
    let rawText = '';
    try {
      const interaction = await client.interactions.create({
        model: 'gemini-3.8-flash',
        input: prompt,
      });
      rawText = interaction.output_text || '';
    } catch {
      const resp = await client.models.generateContent({
        model: 'gemini-flash-latest',
        contents: prompt,
      });
      rawText = resp.text || '';
    }

    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return {
      answer: parsed.answer || '已生成深度解读。',
      keyPoints: parsed.keyPoints || [],
    };
  } catch (error: any) {
    console.error('Gemini ask error:', error);
    return {
      answer: `分析时遇到问题: ${error.message || '请检查 API Key 是否有效或网络连接'}`,
      keyPoints: ['调用异常', '请在设置中检查 Gemini Key'],
    };
  }
}

function getDefaultBriefing(articles: NewsArticle[]): DailyBriefing {
  const todayStr = new Date().toISOString().split('T')[0];
  const top3 = articles.slice(0, 3);

  return {
    date: todayStr,
    title: '今日科技前沿与数智生活速报',
    overview:
      '今日全网科技关注点聚焦于下一代操作系统变革、大模型智能体实用落地以及数码硬件供应链的最新动态。极客生态呈现出向实用工具化与微型端侧 AI 全面迁移的清晰趋势。',
    highlights: top3.map((a, i) => ({
      title: a.title,
      takeaway: a.summary.slice(0, 48) + '...',
      impact: `来自【${a.sourceName}】，展现了当下开发者与大众热议的代表性方向。`,
      source: a.sourceName,
    })),
    techTrends: ['端侧大模型', '自主Agent', '折叠硬件', '鸿蒙生态'],
    quoteOfTheDay: '技术不是目的，创造触手可及的生活价值才是。',
    generatedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
  };
}

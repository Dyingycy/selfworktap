import { GoogleGenAI } from '@google/genai';
import { DailyBriefing, NewsArticle } from '@/types';

// In-memory cache for daily briefing to avoid repeatedly consuming API quotas
let cachedBriefing: { date: string; data: DailyBriefing } | null = null;

// Multi-model high-throughput fallback order
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.8-flash',
];

function getClient(userApiKey?: string): GoogleGenAI | null {
  const key = userApiKey?.trim();
  if (!key) return null;
  return new GoogleGenAI({ apiKey: key });
}

async function executeGeminiWithFallback(client: GoogleGenAI, prompt: string): Promise<string> {
  let lastErr: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const interaction = await client.interactions.create({
        model,
        input: prompt,
      });
      if (interaction && interaction.output_text) {
        return interaction.output_text;
      }
    } catch (err: any) {
      lastErr = err;
      console.warn(`[Gemini Fallback] Model ${model} failed, trying next:`, err.message?.slice(0, 80));
    }
  }

  throw lastErr || new Error('所有 Gemini 备用模型均无法响应');
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
    const rawText = await executeGeminiWithFallback(client, prompt);
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

  const prompt = `你是一位客观、敏锐且通俗易懂的资深科技分析师与个人随身外脑。
当前上下文或资讯：
【标题】：${title}
【内容详情】：${content}

用户的问题或任务：
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
    const rawText = await executeGeminiWithFallback(client, prompt);
    const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    
    try {
      const parsed = JSON.parse(cleanJson);
      return {
        answer: parsed.answer || rawText,
        keyPoints: parsed.keyPoints || [],
      };
    } catch {
      // Fallback if model returned plain markdown instead of JSON
      return {
        answer: rawText,
        keyPoints: ['已完成分析解答'],
      };
    }
  } catch (error: any) {
    console.error('Gemini ask error:', error);
    let friendly = error.message || '网络连接超时';
    if (friendly.includes('429') || friendly.includes('quota') || friendly.includes('RESOURCE_EXHAUSTED')) {
      friendly = '当前调用过于频繁，触发了 Google 的每分钟频次保护，请稍等 30 秒后再试。';
    }
    return {
      answer: `分析时遇到问题: ${friendly}`,
      keyPoints: ['调用异常', '请稍候重试'],
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
    highlights: top3.map((a) => ({
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

export async function decomposeTaskWithAi(
  taskTitle: string,
  userApiKey?: string
): Promise<string[]> {
  const client = getClient(userApiKey);
  if (!client) {
    // Smart heuristic decomposition if key not present
    return [
      `梳理「${taskTitle}」的核心目标与交付标准`,
      `准备所需资料并排查前置阻塞点`,
      `分步执行核心攻关环节`,
      `验收成果并做总结收尾`,
    ];
  }

  const prompt = `你是一个资深敏捷生产力教练。用户给出了一个待办目标任务：
"${taskTitle}"

请将其拆解为 3 至 4 个具体、清晰、极易立即着手执行的子步骤（Actionable Subtasks）。
要求：
1. 每个步骤简短干练（不超过 15 个字）；
2. 动词开头（如：梳理...、整理...、制定...、核对...、交付...）；
3. 严格遵循纯 JSON 字符串数组格式输出，不要有任何多余 markdown 标记、反引号或文字解释。
格式示例：
["明确核心需求与指标", "起草初版方案草稿", "与相关方沟通确认", "完成最终交付核对"]`;

  try {
    const raw = await executeGeminiWithFallback(client, prompt);
    const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((s: any) => String(s).trim()).filter(Boolean);
    }
  } catch (e) {
    console.warn('AI decomposition failed, fallback to heuristics:', e);
  }

  return [
    `明确「${taskTitle}」的关键里程碑`,
    `收集准备前置材料与清单`,
    `专注执行关键核心环节`,
    `自查验收并归档打卡`,
  ];
}

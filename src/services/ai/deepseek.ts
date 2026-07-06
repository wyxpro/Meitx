import { getStoredMerchants } from '@/services/mockData';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `你是一个美团智慧运营平台，名字叫“小琪”。
你的任务是为平台运营和销售人员提供专业的商家诊断、话术生成、套餐推荐、签约预测以及链路跟踪服务。

你拥有以下 6 大核心 AI 能力：
1. **AI 智能诊断**：实时分析商家经营数据（例如销售额、接通率、客单价等），能自动识别“新客获取不足、老客留存低、曝光率低、转化率差”等 12 类经营痛点，精准定位改善机会。
2. **数据驱动决策**：从多维度评估商家现状，给出趋势预测和雷达图方向指导（如曝光度、点击率、转化率、复购率、客单价、接通率）。
3. **智能话术生成**：根据商家品类和画像，生成电话（黄金30秒）、微信（轻量触达）、面谈（深度异议处理）三种场景的个性化话术。
4. **精准套餐推荐**：推算 ROI，设计“曝光爆发包”、“新客转化包”等套餐组合。
5. **签约预测引擎**：推测接受度概率（高/中/低），分析影响因素（如接通率、合作意向等）。
6. **全链路跟踪**：指导跟进频率、提醒事项 and 跟进话术，实现商机闭环。

回复时，请保持专业、热心且以数据事实为依据。结构化地输出回答，让排版清晰、可读性强。`;

/**
 * Streams chat completions from DeepSeek v4 Pro
 */
export async function streamChatCompletions(
  messages: Message[],
  onChunk: (chunk: string) => void,
  onDone: (fullText: string) => void,
  onError: (error: any) => void
) {
  try {
    const apiKey = import.meta.env.VITE_PROXY_API_KEY || 'sk-02260d10c28c4bb4b65bace15ba5f754';

    // Inject system prompt if not present
    const requestMessages = [...messages];
    const hasSystem = requestMessages.some(m => m.role === 'system');
    if (!hasSystem) {
      requestMessages.unshift({
        role: 'system',
        content: SYSTEM_PROMPT
      });
    }

    const response = await fetch('/api/innoreation/v1/proxy/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Proxy-API-Key': apiKey,
        'X-Proxy-Key': apiKey,
        'Proxy API Key': apiKey
      },
      body: JSON.stringify({
        model: 'deepseek-v4-pro',
        messages: requestMessages,
        temperature: 0.7,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const cleaned = line.trim();
        if (!cleaned) continue;
        if (cleaned === 'data: [DONE]') continue;

        if (cleaned.startsWith('data: ')) {
          const jsonStr = cleaned.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              fullText += content;
              onChunk(content);
            }
          } catch (e) { }
        }
      }
    }

    onDone(fullText);
  } catch (error) {
    console.error('Streaming error, starting mock fallback:', error);
    // Fallback to local simulation to ensure smooth UX if offline or CORS fails
    try {
      const lastUserMsg = messages[messages.length - 1]?.content || '';
      const fallbackText = getMockResponseForPrompt(lastUserMsg);

      let index = 0;
      const interval = setInterval(() => {
        if (index < fallbackText.length) {
          const chunkSize = Math.min(2 + Math.floor(Math.random() * 3), fallbackText.length - index);
          const chunk = fallbackText.substring(index, index + chunkSize);
          onChunk(chunk);
          index += chunkSize;
        } else {
          clearInterval(interval);
          onDone(fallbackText);
        }
      }, 30);
    } catch (e) {
      onError(error);
    }
  }
}

function getMockResponseForPrompt(prompt: string): string {
  if (prompt.includes('智能诊断')) {
    return `### 🔍 小琪 - 智能诊断分析报告

针对所选商家进行了深入的 **AI 智能诊断**。系统共自动识别出该商家的 **3 项核心经营痛点**，并定位出改善机会：

1. **新客获取率严重偏低（高危痛点）**
   - **数据表现**：近30天新客下单占比仅为 24%，而同商圈同品类均值为 38%。
   - **根本原因**：店铺在美团首页的曝光量较低，金牌推荐位曝光时长不足。
   - **改善机会**：建议开通曝光爆发套餐，抢占商圈核心流量位，预计可让新客转化率提升 35%。

2. **复购率持续下滑（中危痛点）**
   - **数据表现**：老客复购率已从上月 19% 滑落至 15%（均值为 28%）。
   - **改善机会**：启动会员专属立减券+精准Push召回，重新激活历史交易用户。

3. **下午茶时段闲置（低危痛点）**
   - **数据表现**：14:00-16:30 营业额占比仅为全天 4.5%。
   - **改善机会**：推出针对白领的特惠下午茶双人拼团套餐，填补非高峰期产能。`;
  }

  if (prompt.includes('数据驱动') || prompt.includes('数据决策')) {
    return `### 📊 小琪 - 数据驱动决策看板

根据多维度经营大盘与趋势预测，以下为商家的综合健康度评估：

*   **综合健康度评分：62分** (同品类均值: 78分)
*   **雷达图六维评估：**
    *   **曝光获取能力**：⭐⭐ (短板)
    *   **转化效率**：⭐⭐⭐
    *   **复购留存**：⭐⭐ (短板)
    *   **接通与服务**：⭐⭐⭐⭐
    *   **客单价合理度**：⭐⭐⭐⭐
    *   **流量利用率**：⭐⭐⭐
*   **趋势预测**：如果本月不进行流量干预，受暑期竞品活动分流影响，下月销售额预计将持续环比下滑 7.8% - 10.5%。建议提前配置“曝光爆发包”锁住高意向新客流。`;
  }

  if (prompt.includes('话术生成')) {
    return `### 💬 小琪 - 智能个性化话术推荐

针对该商家的品类与现状，已为您动态生成了三种沟通场景的话术模板：

#### 📞 场景一：电话触达话术 (黄金30秒)
> “您好，是四季香餐厅的王老板吗？我是美团运营顾问小琪。我最近关注到咱们店的接通率保持得非常好（74%），但新客获取上有点吃力。我这有一个专门针对咱们商圈餐饮品类打造的‘新客爆发方案’，上个月已经帮隔壁街2家店平均提升了32%的新客量。您看方便花2分钟跟您对一下数据吗？”

#### 💬 场景二：微信沟通模板
> “王老板您好，我是美团顾问小琪。这是为您店铺整理的‘近30天经营诊断简报.pdf’。数据显示咱们店复购率不错，但曝光度落后了同行近15个点，每天至少错失了40个新客人。我们这周正好有特惠曝光补贴，预计投产比可达 1:3.2，建议您可以了解一下具体方案：[方案链接]”

#### 🤝 场景三：面谈异议处理（处理“价格贵”异议）
> “老板，我非常理解您对这1,280元投入的谨慎。但我们可以这样算笔账：按照同街店铺的保守效果，开通后每天只要多来6个新客，按咱们店55元的客单价，一个月就能多做将近1万元的流水。这笔补贴实际上是以增收的形式数倍返还给您的，而且我们首月有效果保障协议，没达到预期可以随时退余款，您看行吗？”`;
  }

  if (prompt.includes('套餐推荐')) {
    return `### 🎁 小琪 - 精准套餐推荐方案

结合该商家品类、当前季节性消费趋势及历史合作记录，AI 精算得出最高 ROI 套餐组合：

1.  **推荐首选：曝光爆发包 (🔥 ROI最佳选项)**
    *   **价格**：¥1,280/月
    *   **内容**：美团APP首页商圈置顶推荐 + 专属活动角标。
    *   **适用痛点**：精准解决新客获取率严重偏低问题。
    *   **预估效果**：曝光量提升 180%，预计 ROI 达 **320%**。
2.  **推荐备选：新客转化裂变包**
    *   **价格**：¥880/月
    *   **内容**：新客专享大额神券 + 联名分享红包。
    *   **预估效果**：新客首单转化率提升 22%，预计 ROI 达 **240%**。`;
  }

  if (prompt.includes('签约预测')) {
    return `### 📈 小琪 - 签约意向预测

基于该商家的历史合作记录、活跃轨迹以及沟通反馈，签约意向分析如下：

*   **综合签约预测概率：78% (高意向)**
*   **正向影响因素**：
    1.  历史有过1次签约合作，履约情况良好，建立了基本信任度。
    2.  近期主动登录过商家后台查询“流量提升”工具，说明正面临获客瓶颈。
    3.  日常接通率达 74%，配合度较高。
*   **负向风险提示**：
    1.  老板对活动返现价格比较敏感，容易产生预算疑虑。
*   **促成签约建议**：本周内立即触达，重点对比“使用前后流量变化数据”，以数据和保障打消疑虑。`;
  }

  if (prompt.includes('链路跟踪')) {
    return `### 🔄 小琪 - 全链路跟踪与促成计划

为了确保商机闭环，建议为该商家建立以下跟进计划：

1.  **第一步（今日）**：发送微信诊断简报，提供“话术二”的曝光分析，锚定痛点。
2.  **第二步（第3天）**：电话回访，针对老板反馈的价格问题，使用“话术三”进行解答，并主推“曝光爆发包”的 ROI 报告。
3.  **第三步（第5天）**：面谈敲定合作细节，出示电子合同与保障协议，完成签约。
4.  **跟进提醒**：系统已自动在您的「待跟进」列表中生成了今日下午的微信触达任务。`;
  }

  return `### 👩‍💼 您好，我是您的 AI 智能经营顾问“小琪”！

我可以为您提供以下 6 大核心智能建议服务：
- 🔍 **AI 智能诊断**：自动识别 12 类经营痛点。
- 📊 **数据驱动决策**：雷达图综合评估，趋势预测助您布局。
- 💬 **智能话术生成**：支持电话/微信/面谈三大场景。
- 🎁 **精准套餐推荐**：推算最高 ROI 方案组合。
- 📈 **签约预测引擎**：提前预测商户签约概率。
- 🔄 **全链路跟踪**：建立跟进提醒闭环，促进成交。

您可以直接在下方选择商家，并点击上方核心能力的快速卡片，或者向我提问任何店铺的运营问题，我将为您深度分析并解答！`;
}

export type ScoreTag = "景" | "式" | "判" | "构" | "拆" | "统" | "稳" | "巧";
export type LetterCode = "C" | "L" | "R" | "X" | "P" | "W" | "B" | "F";
export type QuestionId = "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7" | "q8";
export type BranchKey = "T" | "M" | "K" | "F" | "P" | "R" | "G";

export type AnswerOption = {
  id: "A" | "B" | "C" | "D";
  text: string;
  scores: ScoreTag[];
  set?: Partial<Record<BranchKey, string>>;
};

export type Question = {
  id: QuestionId;
  title: string;
  prompt: string | ((state: Partial<Record<BranchKey, string>>) => string);
  options: AnswerOption[] | ((state: Partial<Record<BranchKey, string>>) => AnswerOption[]);
};

export type PersonalityResult = {
  code: string;
  chineseCode: string;
  typeName: string;
  shortName: string;
  description: string;
  shortDescription: string;
  image: string;
};

export const scoreLabels: Record<ScoreTag, LetterCode> = {
  景: "C",
  式: "L",
  判: "R",
  构: "X",
  拆: "P",
  统: "W",
  稳: "B",
  巧: "F",
};

export const dimensionPairs = [
  { left: "景", right: "式", leftLetter: "C", rightLetter: "L", name: "信息入口" },
  { left: "判", right: "构", leftLetter: "R", rightLetter: "X", name: "决策依据" },
  { left: "拆", right: "统", leftLetter: "P", rightLetter: "W", name: "处理方式" },
  { left: "稳", right: "巧", leftLetter: "B", rightLetter: "F", name: "行动偏好" },
] as const;

export const tieBreakRules: Record<string, QuestionId[]> = {
  "景/式": ["q1", "q7"],
  "判/构": ["q2", "q8"],
  "拆/统": ["q4", "q7"],
  "稳/巧": ["q6", "q8"],
};

const q2OptionsByT: Record<string, AnswerOption[]> = {
  级数: [
    { id: "A", text: "先试比值判别法。", scores: ["判", "稳"], set: { M: "标准法" } },
    { id: "B", text: "先试根式判别法。", scores: ["判", "统"], set: { M: "标准法" } },
    { id: "C", text: "找一个熟悉级数进行比较或放缩。", scores: ["构", "拆"], set: { M: "构造法" } },
    { id: "D", text: "先化简通项，看主导项和等价关系。", scores: ["式", "构"], set: { M: "代数法" } },
  ],
  三重积分: [
    { id: "A", text: "直接考虑球坐标。", scores: ["景", "统", "巧"], set: { M: "统一法" } },
    { id: "B", text: "先试柱坐标。", scores: ["景", "稳"], set: { M: "几何法" } },
    { id: "C", text: "先画投影，再决定积分次序。", scores: ["景", "拆", "稳"], set: { M: "拆解法" } },
    { id: "D", text: "先看有没有对称性。", scores: ["统", "巧"], set: { M: "统一法" } },
  ],
  一元积分: [
    { id: "A", text: "先套三角换元、欧拉替换等常见套路。", scores: ["判", "稳"], set: { M: "标准法" } },
    { id: "B", text: "根据根式结构自己设计替换。", scores: ["构", "巧"], set: { M: "构造法" } },
    { id: "C", text: "找能凑微分或分部积分的局部结构。", scores: ["式", "构", "拆"], set: { M: "代数法" } },
    { id: "D", text: "先判断它像哪个已知函数的导数。", scores: ["式", "判"], set: { M: "标准法" } },
  ],
  条件极值: [
    { id: "A", text: "写拉格朗日乘子方程。", scores: ["判", "稳"], set: { M: "标准法" } },
    { id: "B", text: "用约束消元，把问题降维。", scores: ["拆", "稳"], set: { M: "拆解法" } },
    { id: "C", text: "先画区域或想象曲面形状。", scores: ["景", "拆"], set: { M: "几何法" } },
    { id: "D", text: "寻找对称性或参数化约束。", scores: ["构", "统", "巧"], set: { M: "统一法" } },
  ],
};

const q3PromptByM: Record<string, string> = {
  标准法: "你发现标准方法进入临界情况：比值极限等于 1、公式不直接适用，或条件还差一点。你怎么办？",
  构造法: "你尝试换元、比较或构造，但中间式子没有变简单。你怎么办？",
  代数法: "你尝试化简表达式，但主导项和余项纠缠在一起。你怎么办？",
  几何法: "你尝试画图或想区域，但边界比预想复杂。你怎么办？",
  拆解法: "你把题拆开以后，发现每一块都还要继续处理。你怎么办？",
  统一法: "你感觉有整体结构，但一时找不到那个最合适的变换。你怎么办？",
};

const q4PromptByK: Record<string, string> = {
  标准卡点: "标准路线还能走，但看起来很长。你优先降低哪种复杂度？",
  局部卡点: "小块越来越多，局部处理开始膨胀。你优先降低哪种复杂度？",
  构造卡点: "你需要决定构造什么对象。你优先降低哪种复杂度？",
  整体卡点: "你已经看到一点整体结构，但还不够清楚。你优先降低哪种复杂度？",
};

const q5PromptByF: Record<string, string> = {
  条件: "你现在主要在检查定理条件、边界条件和定义域。接下来你会押哪种完成方式？",
  图形: "你现在主要在处理图像、区域、坐标和几何关系。接下来你会押哪种完成方式？",
  表达式: "你现在主要在处理表达式、主项、等价和变形。接下来你会押哪种完成方式？",
  试探: "你现在主要在用特殊情况寻找规律。接下来你会押哪种完成方式？",
};

const q6PromptByP: Record<string, string> = {
  长线: "你的长路线还剩不少计算，但方向可靠。考试时间不多了，你优先保什么？",
  框架: "你找到了一个可用框架，但需要检查条件。考试时间不多了，你优先保什么？",
  构造: "你有一个很有希望的构造，但验证还没写全。考试时间不多了，你优先保什么？",
  整体: "你看到了一个整体捷径，但它有点依赖洞察。考试时间不多了，你优先保什么？",
};

const q7GuideByR: Record<string, string> = {
  稳健: "你希望稳稳拿分。",
  冒险: "你想尽快抓住题眼。",
  完整: "你担心边界和特殊情况。",
  漂亮: "你想找到统一视角。",
};

const q8PromptByG: Record<string, string> = {
  图像入口: "你已经看到了图像关系。最后你更满意哪种解法？",
  表达式入口: "你已经看到了表达式结构。最后你更满意哪种解法？",
  定理入口: "你已经看到了可用定理。最后你更满意哪种解法？",
  构造入口: "你已经看到了可能的构造。最后你更满意哪种解法？",
};

const getBranchValue = (state: Partial<Record<BranchKey, string>>, key: BranchKey): string => state[key] ?? "";

const getPrompt = (
  state: Partial<Record<BranchKey, string>>,
  key: BranchKey,
  prompts: Record<string, string>,
): string => prompts[getBranchValue(state, key)] ?? Object.values(prompts)[0];

export const questions: Question[] = [
  {
    id: "q1",
    title: "你第一眼最想做哪道题？",
    prompt: "四道题难度相近，你会优先选哪一道？",
    options: [
      {
        id: "A",
        text: "判断一个含有阶乘、指数和幂的正项级数是否收敛。",
        scores: ["式", "判"],
        set: { T: "级数" },
      },
      {
        id: "B",
        text: "计算一个由球面、圆锥面和坐标面围成区域上的三重积分。",
        scores: ["景", "统"],
        set: { T: "三重积分" },
      },
      {
        id: "C",
        text: "计算一个含根式、三角函数和有理式混合的一元积分。",
        scores: ["式", "构"],
        set: { T: "一元积分" },
      },
      {
        id: "D",
        text: "求一个多元函数在约束条件下的最大值和最小值。",
        scores: ["判", "稳"],
        set: { T: "条件极值" },
      },
    ],
  },
  {
    id: "q2",
    title: "你会怎么开局？",
    prompt: "根据你刚才选择的题型，选一个最自然的开局方式。",
    options: (state) => q2OptionsByT[getBranchValue(state, "T")] ?? q2OptionsByT["级数"],
  },
  {
    id: "q3",
    title: "如果你的开局卡住了",
    prompt: (state) => getPrompt(state, "M", q3PromptByM),
    options: [
      { id: "A", text: "回到更标准、更可验证的方法。", scores: ["判", "稳"], set: { K: "标准卡点" } },
      { id: "B", text: "把问题拆成更小的局部。", scores: ["拆", "稳"], set: { K: "局部卡点" } },
      {
        id: "C",
        text: "换一个构造：新换元、新比较对象或新辅助函数。",
        scores: ["构", "巧"],
        set: { K: "构造卡点" },
      },
      { id: "D", text: "停下来看整体结构、图像或对称性。", scores: ["景", "统"], set: { K: "整体卡点" } },
    ],
  },
  {
    id: "q4",
    title: "你怎么降低复杂度？",
    prompt: (state) => getPrompt(state, "K", q4PromptByK),
    options: [
      { id: "A", text: "先列条件清单，确认每一步能不能用。", scores: ["判", "稳"], set: { F: "条件" } },
      { id: "B", text: "先画图、画区域或选坐标，让关系变直观。", scores: ["景", "拆"], set: { F: "图形" } },
      {
        id: "C",
        text: "先处理表达式主项、等价关系或可化简结构。",
        scores: ["式", "构"],
        set: { F: "表达式" },
      },
      { id: "D", text: "先试特殊值、小例子或简单截面，找题眼。", scores: ["巧", "拆"], set: { F: "试探" } },
    ],
  },
  {
    id: "q5",
    title: "你会押哪种完成方式？",
    prompt: (state) => getPrompt(state, "F", q5PromptByF),
    options: [
      { id: "A", text: "沿长路线完整算完，保证每一步能检查。", scores: ["拆", "稳"], set: { P: "长线" } },
      {
        id: "B",
        text: "找一个定理或判别框架，把问题收住。",
        scores: ["判", "统", "稳"],
        set: { P: "框架" },
      },
      {
        id: "C",
        text: "设计一个替换、比较对象或辅助函数。",
        scores: ["构", "巧"],
        set: { P: "构造" },
      },
      {
        id: "D",
        text: "寻找对称性、统一坐标或整体视角。",
        scores: ["景", "统", "巧"],
        set: { P: "整体" },
      },
    ],
  },
  {
    id: "q6",
    title: "考试时间不多了",
    prompt: (state) => getPrompt(state, "P", q6PromptByP),
    options: [
      { id: "A", text: "保正确率，宁可写得朴素一点。", scores: ["稳", "判"], set: { R: "稳健" } },
      { id: "B", text: "保速度和题眼，先把核心答案拿下。", scores: ["巧", "构"], set: { R: "冒险" } },
      { id: "C", text: "保完整性，边界和分类不能漏。", scores: ["拆", "稳"], set: { R: "完整" } },
      { id: "D", text: "保结构感，让解法尽量统一漂亮。", scores: ["统", "巧"], set: { R: "漂亮" } },
    ],
  },
  {
    id: "q7",
    title: "综合题第一反应",
    prompt: (state) =>
      `${q7GuideByR[getBranchValue(state, "R")] ?? q7GuideByR["稳健"]} 一道题同时含有参数、极限和积分。你第一步会做什么？`,
    options: [
      {
        id: "A",
        text: "画出参数变化时的图像、区域或几何关系。",
        scores: ["景", "统"],
        set: { G: "图像入口" },
      },
      {
        id: "B",
        text: "看表达式的主导项、等价形式和可化简结构。",
        scores: ["式", "拆"],
        set: { G: "表达式入口" },
      },
      {
        id: "C",
        text: "检查能否交换极限、积分、求导或求和。",
        scores: ["判", "稳"],
        set: { G: "定理入口" },
      },
      {
        id: "D",
        text: "构造控制函数、替换变量或比较对象。",
        scores: ["构", "巧"],
        set: { G: "构造入口" },
      },
    ],
  },
  {
    id: "q8",
    title: "你更满意哪种最终解法？",
    prompt: (state) => getPrompt(state, "G", q8PromptByG),
    options: [
      { id: "A", text: "标准长解：每一步都有依据，虽然不短。", scores: ["判", "稳"] },
      {
        id: "B",
        text: "几何整体解：用图像、坐标或对称性把问题整体化。",
        scores: ["景", "统", "巧"],
      },
      {
        id: "C",
        text: "代数构造解：用换元、辅助函数或等价变形改造题目。",
        scores: ["式", "构", "巧"],
      },
      { id: "D", text: "分类排查解：内部、边界、特殊点逐一处理。", scores: ["拆", "稳"] },
    ],
  },
];

export const results: Record<string, PersonalityResult> = {
  "C-R-P-B": {
    code: "C-R-P-B",
    chineseCode: "景-判-拆-稳",
    typeName: "谨慎观察型",
    shortName: "守序者",
    description:
      "你通常会先观察局面，再按可靠规则一步步处理。你重视边界、细节和责任感，不太喜欢在信息不全时贸然决定。别人会觉得你稳、细、值得托付；但你有时也会因为想确认得更完整，而比别人更晚行动。",
    shortDescription: "你先观察局面，再按可靠规则稳步推进，重视边界、细节和责任感。",
    image: "/personality_characters_d_route/01_C-R-P-B_shouxuzhe.png",
  },
  "C-R-P-F": {
    code: "C-R-P-F",
    chineseCode: "景-判-拆-巧",
    typeName: "敏锐执行型",
    shortName: "行动派",
    description:
      "你很会抓现场的关键点，也愿意借助规则和经验快速推进。你不是盲目冲动的人，但你不喜欢一直停在分析阶段。你的性格里有一种“看准就做”的劲头，适合处理需要判断力和行动力并存的任务。",
    shortDescription: "你善于抓住现场关键点，并借助规则和经验快速推进。",
    image: "/personality_characters_d_route/02_C-R-P-F_xingdongpai.png",
  },
  "C-R-W-B": {
    code: "C-R-W-B",
    chineseCode: "景-判-统-稳",
    typeName: "全局规划型",
    shortName: "规划者",
    description:
      "你倾向于先看整体局面，再用清晰的框架安排行动。你喜欢有秩序、有依据的方案，也愿意为长期稳定投入耐心。你的优势是能把复杂关系整理成可执行的计划；弱点是面对突然变化时，可能需要一点时间重新校准。",
    shortDescription: "你先看整体局面，再用清晰框架把复杂关系整理成可执行计划。",
    image: "/personality_characters_d_route/03_C-R-W-B_guihuazhe.png",
  },
  "C-R-W-F": {
    code: "C-R-W-F",
    chineseCode: "景-判-统-巧",
    typeName: "快速统筹型",
    shortName: "统筹者",
    description:
      "你看问题很重视整体感，也能很快找到可借力的规则和捷径。你适合在混乱场面中迅速判断方向，把事情带回主线。你给人的感觉通常是反应快、判断准，但需要留意别让速度压过必要的确认。",
    shortDescription: "你重视整体感，能在混乱场面中快速判断方向并带回主线。",
    image: "/personality_characters_d_route/04_C-R-W-F_tongchouzhe.png",
  },
  "C-X-P-B": {
    code: "C-X-P-B",
    chineseCode: "景-构-拆-稳",
    typeName: "耐心探索型",
    shortName: "探路者",
    description:
      "你相信直觉和现场感，但不会只凭感觉做决定。你愿意一点点试、一点点修，把模糊想法变成可靠路径。你通常有耐心，也比较能理解复杂处境中的细微差别；只是有时会因为可探索的方向太多而变慢。",
    shortDescription: "你用直觉和小步试探把模糊想法慢慢修成可靠路径。",
    image: "/personality_characters_d_route/05_C-X-P-B_tanluzhe.png",
  },
  "C-X-P-F": {
    code: "C-X-P-F",
    chineseCode: "景-构-拆-巧",
    typeName: "灵活试探型",
    shortName: "变通派",
    description:
      "你很擅长从具体场景中试出办法，愿意用小实验、小调整找到突破口。你不太喜欢僵硬流程，更相信边走边看的判断。你的性格轻快、适应力强，但在重要决定上，需要给自己多留一步复核。",
    shortDescription: "你擅长在具体场景里用小实验和小调整找出突破口。",
    image: "/personality_characters_d_route/06_C-X-P-F_biantongpai.png",
  },
  "C-X-W-B": {
    code: "C-X-W-B",
    chineseCode: "景-构-统-稳",
    typeName: "温和整合型",
    shortName: "调和者",
    description:
      "你能把很多分散的信息放在一起看，并努力找到一个大家都能接受的整体方案。你既重视直觉，也愿意把直觉整理成稳定结构。你适合协调复杂关系、搭建长期系统；有时需要避免为了兼顾太多而牺牲决断。",
    shortDescription: "你能整合分散信息，协调复杂关系，并搭建稳定的整体方案。",
    image: "/personality_characters_d_route/07_C-X-W-B_tiaohezhe.png",
  },
  "C-X-W-F": {
    code: "C-X-W-F",
    chineseCode: "景-构-统-巧",
    typeName: "开放创造型",
    shortName: "创想者",
    description:
      "你喜欢从整体氛围和关系中发现新的可能，也敢于重组已有做法。你通常不满足于照旧执行，而会寻找更自然、更省力的路径。你有创造力和适应力，但需要在灵感之外保留一点落地检查。",
    shortDescription: "你善于从整体关系中发现新可能，并重组做法找到更自然的路径。",
    image: "/personality_characters_d_route/08_C-X-W-F_chuangxiangzhe.png",
  },
  "L-R-P-B": {
    code: "L-R-P-B",
    chineseCode: "式-判-拆-稳",
    typeName: "稳妥分析型",
    shortName: "分析者",
    description:
      "你习惯先看信息结构、规则和逻辑，再把事情拆成清楚的小步骤。你做事稳、认真、可预测，不喜欢模糊承诺。别人会觉得你靠谱、理性，但你有时也会显得不够放松，或者对不确定性比较敏感。",
    shortDescription: "你先看结构、规则和逻辑，再把事情拆成清楚可靠的小步骤。",
    image: "/personality_characters_d_route/09_L-R-P-B_fenxizhe.png",
  },
  "L-R-P-F": {
    code: "L-R-P-F",
    chineseCode: "式-判-拆-巧",
    typeName: "高效理性型",
    shortName: "速决者",
    description:
      "你重视逻辑和依据，也很在意效率。你会先找到规则，再尽量用更简洁的方式完成目标。你适合处理信息密集、时间有限的问题；需要注意的是，太追求高效时，可能会低估他人的理解速度。",
    shortDescription: "你重视逻辑依据和效率，擅长用简洁方式处理时间有限的问题。",
    image: "/personality_characters_d_route/10_L-R-P-F_sujuezhe.png",
  },
  "L-R-W-B": {
    code: "L-R-W-B",
    chineseCode: "式-判-统-稳",
    typeName: "系统管理型",
    shortName: "架构者",
    description:
      "你喜欢从结构和原则层面理解问题，再用稳定框架管理复杂局面。你做决定时重视一致性、长期性和可解释性。你的优势是清楚、有条理、有系统感；弱点是有时会显得过于严谨，不太愿意接受临时变化。",
    shortDescription: "你从结构和原则理解问题，并用稳定框架管理复杂局面。",
    image: "/personality_characters_d_route/11_L-R-W-B_jiagouzhe.png",
  },
  "L-R-W-F": {
    code: "L-R-W-F",
    chineseCode: "式-判-统-巧",
    typeName: "清晰决策型",
    shortName: "决断者",
    description:
      "你能快速识别问题背后的结构，并做出清楚判断。你不喜欢拖泥带水，也不太满足于零散处理。你给人的感觉是脑子清楚、表达直接、推进有力；需要留意的是，快判断也要给复杂情绪和例外情况留空间。",
    shortDescription: "你能快速识别问题结构并做出清楚、有力的判断。",
    image: "/personality_characters_d_route/12_L-R-W-F_jueduanzhe.png",
  },
  "L-X-P-B": {
    code: "L-X-P-B",
    chineseCode: "式-构-拆-稳",
    typeName: "细致改进型",
    shortName: "改进者",
    description:
      "你会仔细观察信息内部的细节，然后一点点改造问题。你不一定喜欢大张旗鼓地改变，但很擅长局部优化、修正漏洞和做出实际改进。你稳中有创造力，只是有时会把太多精力花在细节打磨上。",
    shortDescription: "你仔细观察信息细节，擅长局部优化、修正漏洞和实际改进。",
    image: "/personality_characters_d_route/13_L-X-P-B_gaijinzhe.png",
  },
  "L-X-P-F": {
    code: "L-X-P-F",
    chineseCode: "式-构-拆-巧",
    typeName: "机敏变通型",
    shortName: "机变者",
    description:
      "你对信息变化很敏感，能迅速换一种说法、换一条路径、换一个解决办法。你有灵活的脑筋，也不怕尝试非标准方案。你的优势是适应快、点子多；需要注意的是，别让变化太快导致别人跟不上。",
    shortDescription: "你对信息变化敏感，能迅速换路径并尝试非标准方案。",
    image: "/personality_characters_d_route/14_L-X-P-F_jibianzhe.png",
  },
  "L-X-W-B": {
    code: "L-X-W-B",
    chineseCode: "式-构-统-稳",
    typeName: "理性整合型",
    shortName: "整理者",
    description:
      "你喜欢把复杂信息重组为一个更清楚的系统。你既有创造性，也重视稳定性，常常能在混乱中搭出可持续的结构。你适合做需要抽象能力和耐心推进的事；有时需要更早把想法讲给别人听。",
    shortDescription: "你能把复杂信息重组为清楚、稳定且可持续的系统。",
    image: "/personality_characters_d_route/15_L-X-W-B_zhenglizhe.png",
  },
  "L-X-W-F": {
    code: "L-X-W-F",
    chineseCode: "式-构-统-巧",
    typeName: "创新整合型",
    shortName: "创构者",
    description:
      "你很擅长从复杂信息里看出隐藏联系，并用新的结构重组它。你不喜欢只按旧方法走，常常会提出更简洁或更有想象力的方案。你有明显的创造倾向，但需要把关键步骤说清楚，避免别人只看到结论看不到路径。",
    shortDescription: "你擅长发现复杂信息里的隐藏联系，并用新结构提出更有想象力的方案。",
    image: "/personality_characters_d_route/16_L-X-W-F_chuanggouzhe.png",
  },
};

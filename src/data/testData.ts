export type ScoreTag = "景" | "式" | "判" | "构" | "拆" | "统" | "稳" | "巧";
export type LetterCode = "C" | "L" | "R" | "X" | "P" | "W" | "B" | "F";
export type QuestionId = "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7" | "q8";
export type BranchKey = "T" | "M" | "K";

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
  "景/式": ["q1", "q6"],
  "判/构": ["q2", "q7"],
  "拆/统": ["q3", "q8"],
  "稳/巧": ["q4", "q5"],
};

const q2OptionsByT: Record<string, AnswerOption[]> = {
  级数: [
    { id: "A", text: "看相邻两项之比，极限判别法。", scores: ["判", "稳"], set: { M: "标准法" } },
    { id: "B", text: "开 n 次根，根式判别法。", scores: ["判", "统"], set: { M: "标准法" } },
    { id: "C", text: "找一个熟悉的级数，比较判别法。", scores: ["构", "拆"], set: { M: "构造法" } },
    { id: "D", text: "判断通项里到底是哪一部分在主导。", scores: ["式", "构"], set: { M: "代数法" } },
  ],
  三重积分: [
    { id: "A", text: "区域适合球坐标还是柱坐标。", scores: ["景", "统", "巧"], set: { M: "统一法" } },
    { id: "B", text: "图像在绕哪一条轴转。", scores: ["景", "稳"], set: { M: "几何法" } },
    { id: "C", text: "投影能不能写清楚。", scores: ["景", "拆", "稳"], set: { M: "拆解法" } },
    { id: "D", text: "积分有没有对称性。", scores: ["统", "巧"], set: { M: "统一法" } },
  ],
  一元积分: [
    { id: "A", text: "适不适合常见积分手段。", scores: ["判", "稳"], set: { M: "标准法" } },
    { id: "B", text: "可不可以变量替换。", scores: ["构", "巧"], set: { M: "构造法" } },
    { id: "C", text: "可不可以凑微分、拆分或分部积分。", scores: ["式", "构", "拆"], set: { M: "代数法" } },
    { id: "D", text: "可不可以观察得原函数。", scores: ["式", "判"], set: { M: "标准法" } },
  ],
  条件极值: [
    { id: "A", text: "必要条件方程能不能直接列。", scores: ["判", "稳"], set: { M: "标准法" } },
    { id: "B", text: "约束能不能先消掉一个变量。", scores: ["拆", "稳"], set: { M: "拆解法" } },
    { id: "C", text: "约束图形大概长什么样。", scores: ["景", "拆"], set: { M: "几何法" } },
    { id: "D", text: "变量有没有对称性或参数化入口。", scores: ["构", "统", "巧"], set: { M: "统一法" } },
  ],
};

const q3PromptByM: Record<string, string> = {
  标准法: "常规方法没奏效，",
  构造法: "你没有找到合适的对象，",
  代数法: "化简后还是很复杂，",
  几何法: "图形看不太明白，",
  拆解法: "问题变多了，",
  统一法: "你的解法用不了，",
};

const q4PromptByK: Record<string, string> = {
  回查条件: "你确定了真的没有算错，",
  拆小块: "你已经把问题规模变小了，",
  换构造: "你换了条路径，",
  看整体: "你评估了整体结构，",
};

const getBranchValue = (state: Partial<Record<BranchKey, string>>, key: BranchKey): string => state[key] ?? "";

const getTopic = (state: Partial<Record<BranchKey, string>>): string => getBranchValue(state, "T") || "级数";

const getPrompt = (
  state: Partial<Record<BranchKey, string>>,
  key: BranchKey,
  prompts: Record<string, string>,
): string => prompts[getBranchValue(state, key)] ?? Object.values(prompts)[0];

const withGuide = (
  state: Partial<Record<BranchKey, string>>,
  key: BranchKey,
  guides: Record<string, string>,
  routePrompts: Record<string, string>,
): string => `${getPrompt(state, key, guides)}${routePrompts[getTopic(state)] ?? routePrompts["级数"]}`;

const q3PromptsByT: Record<string, string> = {
  级数: "判别法的极限临界值还是不清楚。你下一步会怎么做？",
  三重积分: "区域很复杂。你下一步会怎么做？",
  一元积分: "各种变形后还是很麻烦。你下一步会怎么做？",
  条件极值: "候选点和边界开始变多。你下一步会怎么做？",
};

const q3OptionsByT: Record<string, AnswerOption[]> = {
  级数: [
    { id: "A", text: "换一个比较对象。", scores: ["构", "巧"], set: { K: "换构造" } },
    { id: "B", text: "检查判别法条件和临界值。", scores: ["判", "稳"], set: { K: "回查条件" } },
    { id: "C", text: "重新判断通项整体像哪类级数。", scores: ["景", "统"], set: { K: "看整体" } },
    { id: "D", text: "把通项拆分，再分别估计。", scores: ["拆", "稳"], set: { K: "拆小块" } },
  ],
  三重积分: [
    { id: "A", text: "换坐标，希望边界变简单。", scores: ["构", "巧"], set: { K: "换构造" } },
    { id: "B", text: "重新检查每个边界面对应的不等式。", scores: ["判", "稳"], set: { K: "回查条件" } },
    { id: "C", text: "画图看区域整体形状。", scores: ["景", "统"], set: { K: "看整体" } },
    { id: "D", text: "先只处理一个投影面。", scores: ["拆", "稳"], set: { K: "拆小块" } },
  ],
  一元积分: [
    { id: "A", text: "换一个变量重新尝试。", scores: ["构", "巧"], set: { K: "换构造" } },
    { id: "B", text: "重新检查模板、定义域和符号。", scores: ["判", "稳"], set: { K: "回查条件" } },
    { id: "C", text: "先判断它整体像哪类原函数。", scores: ["景", "统"], set: { K: "看整体" } },
    { id: "D", text: "把被积函数拆成几段处理。", scores: ["拆", "稳"], set: { K: "拆小块" } },
  ],
  条件极值: [
    { id: "A", text: "换一种参数化或消元方式。", scores: ["构", "巧"], set: { K: "换构造" } },
    { id: "B", text: "重新检查存在性、约束边界和必要条件。", scores: ["判", "稳"], set: { K: "回查条件" } },
    { id: "C", text: "先看约束图形和等值线关系。", scores: ["景", "统"], set: { K: "看整体" } },
    { id: "D", text: "分开处理内部点、边界点和特殊点。", scores: ["拆", "稳"], set: { K: "拆小块" } },
  ],
};

const q4PromptsByT: Record<string, string> = {
  级数: "这道级数题还没写完。你优先写什么？",
  三重积分: "这道三重积分题还没写完。你优先写什么？",
  一元积分: "这道一元积分题还没写完。你优先写什么？",
  条件极值: "这道条件极值题还没写完。你优先写什么？",
};

const q4OptionsByT: Record<string, AnswerOption[]> = {
  级数: [
    { id: "A", text: "关键极限或比较对象。", scores: ["巧", "构"] },
    { id: "B", text: "补临界值、正项条件和特殊情况。", scores: ["拆", "稳"] },
    { id: "C", text: "宁可少写，也确保判别法和结论无误。", scores: ["稳", "判"] },
    { id: "D", text: "让推导形成一条主线。", scores: ["统", "巧"] },
  ],
  三重积分: [
    { id: "A", text: "关键坐标变换和雅可比。", scores: ["巧", "构"] },
    { id: "B", text: "补边界、投影边缘和分块。", scores: ["拆", "稳"] },
    { id: "C", text: "宁可少算，也确保区域和上下界无误。", scores: ["稳", "判"] },
    { id: "D", text: "让阅卷人一眼看懂区域和坐标。", scores: ["统", "巧"] },
  ],
  一元积分: [
    { id: "A", text: "关键替换和化简后的积分。", scores: ["巧", "构"] },
    { id: "B", text: "补符号、常数、分段和反代范围。", scores: ["拆", "稳"] },
    { id: "C", text: "宁可结果保守，也确保换元合法。", scores: ["稳", "判"] },
    { id: "D", text: "让整个思路自然连贯。", scores: ["统", "巧"] },
  ],
  条件极值: [
    { id: "A", text: "最可能的极值点和关键代入。", scores: ["巧", "构"] },
    { id: "B", text: "补边界、端点和特殊参数。", scores: ["拆", "稳"] },
    { id: "C", text: "宁可少展开，也确保候选点来源合法。", scores: ["稳", "判"] },
    { id: "D", text: "让约束和极值位置关系更直观。", scores: ["统", "巧"] },
  ],
};

export const questions: Question[] = [
  {
    id: "q1",
    title: "四张卷子同时摆在你面前，你会选择做哪张？",
    prompt: "卷子的分值和难度都差不多。你会更愿意从哪一题开始？",
    options: [
      {
        id: "A",
        text: "正项级数：通项含阶乘、指数和幂。",
        scores: ["式", "判"],
        set: { T: "级数" },
      },
      {
        id: "B",
        text: "三重积分：区域由球面、圆锥面和坐标面围成。",
        scores: ["景", "统"],
        set: { T: "三重积分" },
      },
      {
        id: "C",
        text: "一元积分：式子里混着根式、三角函数和有理式。",
        scores: ["式", "构"],
        set: { T: "一元积分" },
      },
      {
        id: "D",
        text: "条件极值：函数带约束，要找最大最小值。",
        scores: ["判", "稳"],
        set: { T: "条件极值" },
      },
    ],
  },
  {
    id: "q2",
    title: "你在草稿纸上写下的第一步是什么？",
    prompt: (state) =>
      ({
        级数: "一个正项级数同时含有 n!、指数和幂函数。你优先看什么？",
        三重积分: "区域由球面、圆锥面和坐标面围成。你优先看什么？",
        一元积分: "一个积分里同时有根式和三角函数。你优先看什么？",
        条件极值: "题目给了函数和约束。你优先看什么？",
      })[getTopic(state)] ?? "一个正项级数同时含有 n!、指数和幂函数。你优先看什么？",
    options: (state) => q2OptionsByT[getBranchValue(state, "T")] ?? q2OptionsByT["级数"],
  },
  {
    id: "q3",
    title: "这么做好像不行，你怎么调整？",
    prompt: (state) => withGuide(state, "M", q3PromptByM, q3PromptsByT),
    options: (state) => q3OptionsByT[getTopic(state)] ?? q3OptionsByT["级数"],
  },
  {
    id: "q4",
    title: "考试只剩几分钟了！",
    prompt: (state) => withGuide(state, "K", q4PromptByK, q4PromptsByT),
    options: (state) => q4OptionsByT[getTopic(state)] ?? q4OptionsByT["级数"],
  },
  {
    id: "q5",
    title: "别人和你方法不同",
    prompt: "考试结束后，你发现有人用了和你完全不同的方法，而且同样做对了。你的第一反应是什么？",
    options: [
      { id: "A", text: "先怀疑：这个方法真的可靠吗？", scores: ["判", "稳"] },
      { id: "B", text: "先好奇：他为什么会想到这里？", scores: ["景", "统"] },
      { id: "C", text: "先分析：两种方法到底差在哪一步？", scores: ["式", "拆"] },
      { id: "D", text: "先兴奋：这个方法以后还能怎么用？", scores: ["构", "巧"] },
    ],
  },
  {
    id: "q6",
    title: "哪种题最容易让你烦？",
    prompt: "下面四种题，你最不想遇到的是哪道？",
    options: [
      { id: "A", text: "没有明确方法，不知道该用哪个定理。", scores: ["判", "稳"] },
      { id: "B", text: "图形、空间关系太复杂，一时看不出整体。", scores: ["景", "统"] },
      { id: "C", text: "推导特别长，一步一步容易出错。", scores: ["式", "拆"] },
      { id: "D", text: "明明会做，但总觉得有更好的方法。", scores: ["构", "巧"] },
    ],
  },
  {
    id: "q7",
    title: "老师刚写完题目",
    prompt: "老师刚写完题目，你最期待他下一句话是什么？",
    options: [
      { id: "A", text: "“这题直接用这个定理。”", scores: ["判", "稳"] },
      { id: "B", text: "“我们先看这题的整体思路。”", scores: ["景", "统"] },
      { id: "C", text: "“这一步我多写一点细节。”", scores: ["式", "拆"] },
      { id: "D", text: "“其实还有一种更巧的方法。”", scores: ["构", "巧"] },
    ],
  },
  {
    id: "q8",
    title: "考试前最后一小时",
    prompt: "考试前最后一小时，你最可能做什么？",
    options: [
      { id: "A", text: "再翻一遍公式和定理。", scores: ["判", "稳"] },
      { id: "B", text: "回顾各小节之间的联系。", scores: ["景", "统"] },
      { id: "C", text: "再做几道典型题。", scores: ["式", "拆"] },
      { id: "D", text: "看整理好的技巧和易错点。", scores: ["构", "巧"] },
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
    image: "personality_characters_d_route/01_C-R-P-B_shouxuzhe.png",
  },
  "C-R-P-F": {
    code: "C-R-P-F",
    chineseCode: "景-判-拆-巧",
    typeName: "敏锐执行型",
    shortName: "行动派",
    description:
      "你很会抓现场的关键点，也愿意借助规则和经验快速推进。你不是盲目冲动的人，但你不喜欢一直停在分析阶段。你的性格里有一种“看准就做”的劲头，适合处理需要判断力和行动力并存的任务。",
    shortDescription: "你善于抓住现场关键点，并借助规则和经验快速推进。",
    image: "personality_characters_d_route/02_C-R-P-F_xingdongpai.png",
  },
  "C-R-W-B": {
    code: "C-R-W-B",
    chineseCode: "景-判-统-稳",
    typeName: "全局规划型",
    shortName: "规划者",
    description:
      "你倾向于先看整体局面，再用清晰的框架安排行动。你喜欢有秩序、有依据的方案，也愿意为长期稳定投入耐心。你的优势是能把复杂关系整理成可执行的计划；弱点是面对突然变化时，可能需要一点时间重新校准。",
    shortDescription: "你先看整体局面，再用清晰框架把复杂关系整理成可执行计划。",
    image: "personality_characters_d_route/03_C-R-W-B_guihuazhe.png",
  },
  "C-R-W-F": {
    code: "C-R-W-F",
    chineseCode: "景-判-统-巧",
    typeName: "快速统筹型",
    shortName: "统筹者",
    description:
      "你看问题很重视整体感，也能很快找到可借力的规则和捷径。你适合在混乱场面中迅速判断方向，把事情带回主线。你给人的感觉通常是反应快、判断准，但需要留意别让速度压过必要的确认。",
    shortDescription: "你重视整体感，能在混乱场面中快速判断方向并带回主线。",
    image: "personality_characters_d_route/04_C-R-W-F_tongchouzhe.png",
  },
  "C-X-P-B": {
    code: "C-X-P-B",
    chineseCode: "景-构-拆-稳",
    typeName: "耐心探索型",
    shortName: "探路者",
    description:
      "你相信直觉和现场感，但不会只凭感觉做决定。你愿意一点点试、一点点修，把模糊想法变成可靠路径。你通常有耐心，也比较能理解复杂处境中的细微差别；只是有时会因为可探索的方向太多而变慢。",
    shortDescription: "你用直觉和小步试探把模糊想法慢慢修成可靠路径。",
    image: "personality_characters_d_route/05_C-X-P-B_tanluzhe.png",
  },
  "C-X-P-F": {
    code: "C-X-P-F",
    chineseCode: "景-构-拆-巧",
    typeName: "灵活试探型",
    shortName: "变通派",
    description:
      "你很擅长从具体场景中试出办法，愿意用小实验、小调整找到突破口。你不太喜欢僵硬流程，更相信边走边看的判断。你的性格轻快、适应力强，但在重要决定上，需要给自己多留一步复核。",
    shortDescription: "你擅长在具体场景里用小实验和小调整找出突破口。",
    image: "personality_characters_d_route/06_C-X-P-F_biantongpai.png",
  },
  "C-X-W-B": {
    code: "C-X-W-B",
    chineseCode: "景-构-统-稳",
    typeName: "温和整合型",
    shortName: "调和者",
    description:
      "你能把很多分散的信息放在一起看，并努力找到一个大家都能接受的整体方案。你既重视直觉，也愿意把直觉整理成稳定结构。你适合协调复杂关系、搭建长期系统；有时需要避免为了兼顾太多而牺牲决断。",
    shortDescription: "你能整合分散信息，协调复杂关系，并搭建稳定的整体方案。",
    image: "personality_characters_d_route/07_C-X-W-B_tiaohezhe.png",
  },
  "C-X-W-F": {
    code: "C-X-W-F",
    chineseCode: "景-构-统-巧",
    typeName: "开放创造型",
    shortName: "创想者",
    description:
      "你喜欢从整体氛围和关系中发现新的可能，也敢于重组已有做法。你通常不满足于照旧执行，而会寻找更自然、更省力的路径。你有创造力和适应力，但需要在灵感之外保留一点落地检查。",
    shortDescription: "你善于从整体关系中发现新可能，并重组做法找到更自然的路径。",
    image: "personality_characters_d_route/08_C-X-W-F_chuangxiangzhe.png",
  },
  "L-R-P-B": {
    code: "L-R-P-B",
    chineseCode: "式-判-拆-稳",
    typeName: "稳妥分析型",
    shortName: "分析者",
    description:
      "你习惯先看信息结构、规则和逻辑，再把事情拆成清楚的小步骤。你做事稳、认真、可预测，不喜欢模糊承诺。别人会觉得你靠谱、理性，但你有时也会显得不够放松，或者对不确定性比较敏感。",
    shortDescription: "你先看结构、规则和逻辑，再把事情拆成清楚可靠的小步骤。",
    image: "personality_characters_d_route/09_L-R-P-B_fenxizhe.png",
  },
  "L-R-P-F": {
    code: "L-R-P-F",
    chineseCode: "式-判-拆-巧",
    typeName: "高效理性型",
    shortName: "速决者",
    description:
      "你重视逻辑和依据，也很在意效率。你会先找到规则，再尽量用更简洁的方式完成目标。你适合处理信息密集、时间有限的问题；需要注意的是，太追求高效时，可能会低估他人的理解速度。",
    shortDescription: "你重视逻辑依据和效率，擅长用简洁方式处理时间有限的问题。",
    image: "personality_characters_d_route/10_L-R-P-F_sujuezhe.png",
  },
  "L-R-W-B": {
    code: "L-R-W-B",
    chineseCode: "式-判-统-稳",
    typeName: "系统管理型",
    shortName: "架构者",
    description:
      "你喜欢从结构和原则层面理解问题，再用稳定框架管理复杂局面。你做决定时重视一致性、长期性和可解释性。你的优势是清楚、有条理、有系统感；弱点是有时会显得过于严谨，不太愿意接受临时变化。",
    shortDescription: "你从结构和原则理解问题，并用稳定框架管理复杂局面。",
    image: "personality_characters_d_route/11_L-R-W-B_jiagouzhe.png",
  },
  "L-R-W-F": {
    code: "L-R-W-F",
    chineseCode: "式-判-统-巧",
    typeName: "清晰决策型",
    shortName: "决断者",
    description:
      "你能快速识别问题背后的结构，并做出清楚判断。你不喜欢拖泥带水，也不太满足于零散处理。你给人的感觉是脑子清楚、表达直接、推进有力；需要留意的是，快判断也要给复杂情绪和例外情况留空间。",
    shortDescription: "你能快速识别问题结构并做出清楚、有力的判断。",
    image: "personality_characters_d_route/12_L-R-W-F_jueduanzhe.png",
  },
  "L-X-P-B": {
    code: "L-X-P-B",
    chineseCode: "式-构-拆-稳",
    typeName: "细致改进型",
    shortName: "改进者",
    description:
      "你会仔细观察信息内部的细节，然后一点点改造问题。你不一定喜欢大张旗鼓地改变，但很擅长局部优化、修正漏洞和做出实际改进。你稳中有创造力，只是有时会把太多精力花在细节打磨上。",
    shortDescription: "你仔细观察信息细节，擅长局部优化、修正漏洞和实际改进。",
    image: "personality_characters_d_route/13_L-X-P-B_gaijinzhe.png",
  },
  "L-X-P-F": {
    code: "L-X-P-F",
    chineseCode: "式-构-拆-巧",
    typeName: "机敏变通型",
    shortName: "机变者",
    description:
      "你对信息变化很敏感，能迅速换一种说法、换一条路径、换一个解决办法。你有灵活的脑筋，也不怕尝试非标准方案。你的优势是适应快、点子多；需要注意的是，别让变化太快导致别人跟不上。",
    shortDescription: "你对信息变化敏感，能迅速换路径并尝试非标准方案。",
    image: "personality_characters_d_route/14_L-X-P-F_jibianzhe.png",
  },
  "L-X-W-B": {
    code: "L-X-W-B",
    chineseCode: "式-构-统-稳",
    typeName: "理性整合型",
    shortName: "整理者",
    description:
      "你喜欢把复杂信息重组为一个更清楚的系统。你既有创造性，也重视稳定性，常常能在混乱中搭出可持续的结构。你适合做需要抽象能力和耐心推进的事；有时需要更早把想法讲给别人听。",
    shortDescription: "你能把复杂信息重组为清楚、稳定且可持续的系统。",
    image: "personality_characters_d_route/15_L-X-W-B_zhenglizhe.png",
  },
  "L-X-W-F": {
    code: "L-X-W-F",
    chineseCode: "式-构-统-巧",
    typeName: "创新整合型",
    shortName: "创构者",
    description:
      "你很擅长从复杂信息里看出隐藏联系，并用新的结构重组它。你不喜欢只按旧方法走，常常会提出更简洁或更有想象力的方案。你有明显的创造倾向，但需要把关键步骤说清楚，避免别人只看到结论看不到路径。",
    shortDescription: "你擅长发现复杂信息里的隐藏联系，并用新结构提出更有想象力的方案。",
    image: "personality_characters_d_route/16_L-X-W-F_chuanggouzhe.png",
  },
};

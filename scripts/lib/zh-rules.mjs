// Cantonese-colloquial detection rules shared by scripts/check-zh.mjs and its test (scripts/test-check-zh.mjs).
// Characters that are also ordinary written Chinese are allowed in their written senses (關係, 係數, 邊緣, 邊界, 周邊, 左邊 …,
// and 返回, 返還 …); only the colloquial uses are flagged. Do not loosen these rules to make a check pass: fix the text.

// Cantonese-only characters (no written-Chinese use).
export const CHARS = '嘅咗喺唔嚟啲睇揀嗰咁冇俾佢啱嘢哋乜咩嘥啩噉嗮咪撳搵攞嚿畀郁';

export const RULES = [
  [new RegExp(`[${CHARS}]`, 'u'), '廣東話口語字'],
  [/(?<![關聯])係(?!數|指)/u, '「係」（書面語用「是」；「關係」「係數」除外）'],
  [/邊[個類度啲種條隻幾樣]/u, '「邊＋量詞」（書面語用「哪」）'],
  [/呢(?![喃絨])/u, '「呢」（書面語用「這」）'],
  [/點解|點樣|點會|點做|即刻|而家|依家|同埋|唔該|邊度/u, '「點解／點樣」（書面語用「為什麼／如何／立即／現在」）'],
  [/返(?=[去嚟學轉屋工番])/u, '「返去／返嚟／返學／返轉」等口語「返」（書面語用「回去／回來／回到」；「返回」「返還」除外）'],
];

/** Returns [{why, at}] for every rule that matches the line (first match per rule). */
export const scanLine = line => {
  const out = [];
  for (const [re, why] of RULES) {
    const m = new RegExp(re.source, 'u').exec(line);
    if (m) out.push({why, at: m.index ?? 0});
  }
  return out;
};

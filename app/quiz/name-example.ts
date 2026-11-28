import type {QuizRegionId} from './catalogue';

/**
 * The example in the placeholder of the typing box (Quiz level 2): one structure of the region itself, English and Chinese, written without a side word.
 * scripts/test-quiz-example-names.mjs checks that every entry exists in the question data of its region, so an example is never a structure the region does not have.
 * A region without an entry shows a plain prompt; a region added later (an organ's Quiz) adds one line here.
 */
export const NAME_EXAMPLE: Partial<Record<QuizRegionId, [string, string]>> = {
  'lower-limb': ['Sartorius', '縫匠肌'],
  'upper-limb': ['Supraspinatus', '棘上肌'],
  thorax: ['Azygos vein', '奇靜脈'],
  back: ['Semispinalis capitis', '頭半棘肌'],
  heart: ['Bicuspid valve', '二尖瓣'],
  lung: ['Lingula of left lung', '左肺舌葉'],
  brain: ['Hippocampus', '海馬'],
  'head-neck': ['Masseter', '咬肌'],
  ear: ['Tympanic membrane', '鼓膜'],
  stomach: ['Pyloric antrum', '幽門竇'],
};
/** Placeholder of the typing box for a region and answer language. */
export const namePlaceholder = (region: QuizRegionId, language: 'en' | 'zh' | 'any'): string => {
  const e = NAME_EXAMPLE[region];
  if (!e) return language === 'zh' ? '輸入中文名稱' : language === 'en' ? 'Type the name' : '輸入名稱';
  return language === 'zh' ? `例如：${e[1]}` : `e.g. ${e[0]}`;
};

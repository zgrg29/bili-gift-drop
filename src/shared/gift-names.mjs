// Curated gift-name glossary. Translations are display aids; the original
// platform name is always kept. Japanese readings are approximate Mandarin
// katakana, not an official Bilibili reading.
const entries = Object.freeze({
  '小心心': {ja: '小さなハート', en: 'Little heart', kana: 'シャオシンシン'},
  '辣条': {ja: 'スパイシースナック', en: 'Spicy strip', kana: 'ラーティアオ'},
  '棒棒糖': {ja: 'ロリポップ', en: 'Lollipop', kana: 'バンバンタン'},
  '小花花': {ja: '小さな花', en: 'Little flower', kana: 'シャオホアホア'},
  '粉丝团灯牌': {ja: 'ファンクラブバッジ', en: 'Fan club badge', kana: 'フェンスートゥアン・トンパイ'},
  '薯条': {ja: 'フライドポテト', en: 'French fries', kana: 'シューティアオ'},
  '人气票': {ja: '人気投票券', en: 'Popularity ticket', kana: 'レンチーピャオ'},
  '生日蛋糕': {ja: 'バースデーケーキ', en: 'Birthday cake', kana: 'シェンリ・ダンガオ'},
  '玫瑰': {ja: 'バラ', en: 'Rose', kana: 'メイグイ'},
  '干杯': {ja: '乾杯', en: 'Cheers', kana: 'ガンベイ'},
  '打call': {ja: 'コール', en: 'Cheer', kana: 'ダーコール'},
  '牛哇': {ja: 'すごい', en: 'Wow', kana: 'ニウワ'},
  '小电视': {ja: '小さなテレビ', en: 'Little TV', kana: 'シャオディエンシー'},
  '亿圆': {ja: '1億円', en: '100M yuan', kana: 'イーユエン'},
  '粉丝牌': {ja: 'ファンバッジ', en: 'Fan badge', kana: 'フェンスーパイ'},
  '节操': {ja: '節操', en: 'Integrity', kana: 'ジエツァオ'},
  '幸运星': {ja: 'ラッキースター', en: 'Lucky star', kana: 'シンユンシン'},
  '小星星': {ja: '小さな星', en: 'Little star', kana: 'シャオシンシン'},
  '雪花': {ja: '雪の花', en: 'Snowflake', kana: 'シュエホア'},
  '烟花': {ja: '花火', en: 'Fireworks', kana: 'ヤンホア'},
  '火箭': {ja: 'ロケット', en: 'Rocket', kana: 'ホージエン'},
  '嘉年华': {ja: 'カーニバル', en: 'Carnival', kana: 'ジアニエンフア'},
  '摩天轮': {ja: '観覧車', en: 'Ferris wheel', kana: 'モーティエンルン'},
  '城堡': {ja: 'お城', en: 'Castle', kana: 'チェンバオ'},
  '钻石': {ja: 'ダイヤ', en: 'Diamond', kana: 'ズアンシー'},
  '皇冠': {ja: '王冠', en: 'Crown', kana: 'フアングアン'},
  '奖杯': {ja: 'トロフィー', en: 'Trophy', kana: 'ジアンベイ'},
  '爱心': {ja: 'ハート', en: 'Heart', kana: 'アイシン'},
  '花束': {ja: '花束', en: 'Bouquet', kana: 'ホアシュー'},
  '蛋糕': {ja: 'ケーキ', en: 'Cake', kana: 'ダンガオ'},
  '礼物': {ja: 'ギフト', en: 'Gift', kana: 'リーヴー'},
  '盲盒': {ja: 'ブラインドボックス', en: 'Blind box', kana: 'マンホー'}
});

export function giftDisplayName(name, language, translation = true) {
  const original = String(name ?? '');
  if (!translation || !original || language === 'zh-CN') return original;
  const entry = entries[original];
  if (!entry) return original;
  const label = language === 'ja' ? entry.ja : entry.en;
  if (!label) return original;
  const parts = [label];
  if (language === 'ja' && entry.kana) parts.push(entry.kana);
  const open = language === 'en' ? ' (' : '（';
  const close = language === 'en' ? ')' : '）';
  return `${original}${open}${parts.join(' / ')}${close}`;
}

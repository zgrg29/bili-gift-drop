import {t} from '../shared/i18n/index.mjs';

// Startup instructions must be readable before users choose a panel language.
export function consoleText(key,args={}){
  return ['zh-CN','ja','en'].map(language=>t(language,key,args)).join('\n');
}

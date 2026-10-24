import zh from './zh-CN.mjs';
import ja from './ja.mjs';
import en from './en.mjs';
export const resources={'zh-CN':zh,ja,en};
export function t(language,key,args={}){return (resources[language]?.[key]??resources.en[key]??key).replace(/\{(\w+)\}/g,(_,k)=>String(args[k]??''));}

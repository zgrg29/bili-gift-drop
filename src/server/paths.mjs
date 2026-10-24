import {fileURLToPath} from 'node:url';
import path from 'node:path';
export const root=fileURLToPath(new URL('../../',import.meta.url));
export const runtimeRoot=process.env.BILI_GIFT_DATA_DIR?path.resolve(process.env.BILI_GIFT_DATA_DIR):root;

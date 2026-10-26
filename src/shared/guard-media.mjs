import {guardDefaultRatio} from './guard.mjs';

// Browser metadata is authoritative for images/GIFs and video dimensions.
// No media playback, queue timing or configuration is changed while probing.
export class GuardMedia {
  entries=new Map();
  constructor(changed){this.changed=changed;}
  // True when the ratio is known (default asset, loaded media or failed probe).
  ready(config,level){
    const url=config['guardAsset'+level];if(!url)return true;
    const entry=this.entries.get(url);return !!entry&&(entry.ratio!=null||entry.failed===true);
  }
  ratio(config,level){
    const url=config['guardAsset'+level],fallback=guardDefaultRatio(level);
    if(!url)return fallback;
    if(this.entries.has(url))return this.entries.get(url).ratio??fallback;
    const entry={ratio:null};this.entries.set(url,entry);
    if(this.entries.size>64)this.entries.delete(this.entries.keys().next().value);
    const video=/\.(mp4|webm)$/.test(url),node=video?document.createElement('video'):new Image();
    const finish=()=>{const w=video?node.videoWidth:node.naturalWidth,h=video?node.videoHeight:node.naturalHeight;if(w>0&&h>0)entry.ratio=w/h;else entry.failed=true;
      node.onload=node.onloadedmetadata=node.onerror=null;
      if(video){node.removeAttribute('src');node.load();}
      this.changed();
    };
    if(video){node.preload='metadata';node.onloadedmetadata=finish;}else node.onload=finish;
    node.onerror=finish;node.src=url;return fallback;
  }
}

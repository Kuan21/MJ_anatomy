export const namingKey=(name:string)=>name.toLowerCase().replace(/\b(?:left|right)\b/g,' ').replace(/[._]+/g,' ').replace(/\s+/g,' ').trim();

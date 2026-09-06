export type Fuel = 'Бензин' | 'Дизель' | 'Mild hybrid' | 'Plug-in hybrid' | 'Электро';
export interface Source {id:string; title:string; publisher:string; url:string; date:string; scope:string}
export interface Volume {value:number; relation:'около'|'более'|'менее'; metric:'произведено'|'продано'; scope:string; asOf:string; source:string}
export interface Powertrain {id:string; name:string; fuel:Fuel; power:number; powerUnit:'кВт'|'hp'; torque:number|null; gearbox:string|null; drive:string|null; market:string; asOf:string; source:string; note?:string}
export interface Revision {year:number; kind:'Рестайлинг'|'Техническое обновление'; title:string; source:string}
export interface Rating {agency:string; year:number; tested:string; components:{label:string; value:number}[]; source:string}
export interface Generation {id:string; label:string; code:string; start:number; end:number|null; dateScope:string; description:string; source:string; revisions:Revision[]; revisionCoverage:'partial'; powertrains:Powertrain[]; volume:Volume|null; assembly:string[]; rating:Rating|null; photo?:Photo}
export interface Photo {url:string; page:string; author:string; license:string; licenseUrl:string; subject:string}
export interface ModelFamily {id:string; brand:string; name:string; aliases:string[]; tagline:string; summary:string; body:string[]; source:string; countries:string[]; countryScope:string; volume:Volume|null; generations:Generation[]}
export interface IndexModel {id:string; make:string; name:string; source:string}
export interface IndexSnapshot {version:number; retrievedAt:string; makeCount:number; modelCount:number; scope:string; source:string; models:IndexModel[]}
export interface Filters {query:string; brand:string; year:string; fuel:string; body:string; country:string; savedOnly:boolean}
export const EMPTY_FILTERS:Filters={query:'',brand:'',year:'',fuel:'',body:'',country:'',savedOnly:false};
export function normalize(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/ё/g,'е').replace(/[^a-zа-я0-9]+/g,' ').trim();}
export function matchesText(value:string,query:string){const haystack=normalize(value);return normalize(query).split(' ').filter(Boolean).every(word=>haystack.includes(word));}
export function familyMatches(f:ModelFamily,filters:Filters,saved:string[]=[]){
 const searchable=[f.brand,f.name,...f.aliases,...f.generations.flatMap(g=>[g.label,g.code,...g.powertrains.map(p=>p.name)])].join(' ');
 if(!matchesText(searchable,filters.query)||filters.brand&&normalize(f.brand)!==normalize(filters.brand)||filters.body&&!f.body.includes(filters.body)||filters.country&&!f.countries.includes(filters.country)||filters.savedOnly&&!saved.includes(f.id))return false;
 return f.generations.some(g=>(!filters.year||g.start<=Number(filters.year)&&(g.end===null||g.end>=Number(filters.year)))&&(!filters.fuel||g.powertrains.some(p=>p.fuel===filters.fuel)));
}
export function formatYears(g:Generation){return `${g.start}–${g.end??'н. в.'}`;}
export function formatVolume(v:Volume|null){return v?`${v.relation} ${new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(v.value/1_000_000)} млн`:'Нет подтверждённых данных';}
export function parseSelection(raw:string|null,allowed:string[]){return [...new Set((raw??'').split(',').filter(id=>allowed.includes(id)))].slice(0,4);}
export function validateCatalog(families:ModelFamily[],sources:Source[]):string[]{
 const errors:string[]=[],ids=new Set<string>(),sourceIds=new Set(sources.map(s=>s.id));
 const addId=(id:string)=>{if(ids.has(id))errors.push(`duplicate id: ${id}`);ids.add(id);};
 const source=(id:string)=>{if(!sourceIds.has(id))errors.push(`unknown source: ${id}`);};
 const volume=(v:Volume|null)=>{if(!v)return;source(v.source);if(!Number.isFinite(v.value)||v.value<0||!v.scope||!v.asOf)errors.push('invalid volume');};
 for(const s of sources){addId(s.id);if(!/^https:\/\//.test(s.url)||!s.date||!s.scope)errors.push(`invalid source: ${s.id}`);}
 for(const f of families){addId(f.id);source(f.source);volume(f.volume);
 for(const g of f.generations){addId(g.id);source(g.source);volume(g.volume);if(!Number.isInteger(g.start)||g.end!==null&&g.end<g.start||!g.dateScope)errors.push(`invalid dates: ${g.id}`);
 for(const r of g.revisions){source(r.source);if(r.year<g.start||g.end!==null&&r.year>g.end)errors.push(`revision outside generation: ${g.id}`);}
 for(const p of g.powertrains){addId(p.id);source(p.source);if(p.power<=0||!p.market||!p.asOf||p.torque!==null&&p.torque<0)errors.push(`invalid powertrain: ${p.id}`);}
 if(g.rating){source(g.rating.source);for(const c of g.rating.components)if(c.value<0||c.value>100)errors.push(`invalid rating: ${g.id}`);}
 }}return errors;
}

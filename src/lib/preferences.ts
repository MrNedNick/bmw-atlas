import {useEffect,useState} from 'react';
export function useSaved(){
 const read=()=>{try {const value=JSON.parse(localStorage.getItem('motor-atlas.garage')??'[]');return Array.isArray(value)?value.filter((v):v is string=>typeof v==='string'):[];}catch{return [];}};
 const [saved,setSaved]=useState<string[]>(read);
 useEffect(()=>{const listener=(e:StorageEvent)=>{if(e.key==='motor-atlas.garage'||e.key===null)setSaved(read());};window.addEventListener('storage',listener);return()=>window.removeEventListener('storage',listener);},[]);
 function toggle(id:string){setSaved(current=>{const next=current.includes(id)?current.filter(x=>x!==id):[...current,id];try{localStorage.setItem('motor-atlas.garage',JSON.stringify(next));}catch{/* Keep this tab usable when storage is unavailable. */}return next;});}
 return {saved,toggle};
}
export function useTheme(){
 const [theme,setTheme]=useState(()=>{try{return localStorage.getItem('motor-atlas.theme')==='light'?'light':'dark';}catch{return 'dark';}});
 useEffect(()=>{document.documentElement.dataset.theme=theme;try{localStorage.setItem('motor-atlas.theme',theme);}catch{/* Theme remains usable without storage. */}},[theme]);
 return {theme,toggleTheme:()=>setTheme(t=>t==='dark'?'light':'dark')};
}

import {mkdir, writeFile, rename} from 'node:fs/promises';
const brands=['VOLKSWAGEN','BMW','MERCEDES-BENZ','AUDI','TOYOTA','LEXUS','HONDA','ACURA','MAZDA','NISSAN','INFINITI','FORD','LINCOLN','CHEVROLET','CADILLAC','BUICK','GMC','DODGE','JEEP','CHRYSLER','VOLVO','SUBARU','MITSUBISHI','HYUNDAI','KIA','PORSCHE','JAGUAR','LAND ROVER','MINI','TESLA','SUZUKI','SAAB','FIAT','ALFA ROMEO','BENTLEY','ROLLS-ROYCE','FERRARI','LAMBORGHINI','ASTON MARTIN','PEUGEOT','RENAULT','SKODA'];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(path){
 const url=`https://vpic.nhtsa.dot.gov/api/vehicles/${path}?format=json`;
 for(let i=0;i<3;i++)try {const r=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{'User-Agent':'MotorAtlas/0.1 catalogue research'}});if(!r.ok)throw new Error(`${r.status}`);const j=await r.json();if(!Array.isArray(j.Results))throw new Error('Invalid results');return j.Results;}catch(e){if(i===2)throw e;await sleep(1000*2**i);}
}
await mkdir('public/data',{recursive:true});
const makes=await get('GetMakesForVehicleType/car');
const selected=makes.filter(m=>brands.includes(m.MakeName.toUpperCase()));
const models=[],sources=[],failed=[];
for(const make of selected){
 try {const rows=await get(`GetModelsForMakeId/${make.MakeId}`); for(const row of rows){if(!row.Model_Name?.trim())continue;models.push({id:`vpic-${row.Make_ID}-${row.Model_ID}`,make:row.Make_Name,name:row.Model_Name,source:'vpic'});}sources.push({make:make.MakeName,id:make.MakeId,count:rows.length});console.log(make.MakeName,rows.length);}catch(e){failed.push(make.MakeName);console.error(make.MakeName,String(e));}
 await sleep(300);
}
if(failed.length)throw new Error(`Incomplete import; previous snapshot preserved. Failed: ${failed.join(', ')}`);
const unique=[...new Map(models.map(m=>[m.id,m])).values()].sort((a,b)=>a.make.localeCompare(b.make)||a.name.localeCompare(b.name));
if(unique.length<100)throw new Error('Unexpectedly small catalogue; not promoting');
const payload={version:1,retrievedAt:new Date().toISOString(),source:'https://vpic.nhtsa.dot.gov/api/',scope:'NHTSA vPIC: manufacturer-reported model names; primarily US-regulatory coverage. Not a global specification database. Model lists may include non-passenger derivatives for selected makes.',makeCount:sources.length,modelCount:unique.length,sources,models:unique};
await writeFile('public/data/catalog.json.tmp',JSON.stringify(payload));await rename('public/data/catalog.json.tmp','public/data/catalog.json');console.log('Snapshot promoted:',unique.length,'names',sources.length,'makes');

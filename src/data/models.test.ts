import {expect,it} from 'vitest';
import {families} from './models';
import {sources} from './sources';
import {EMPTY_FILTERS,familyMatches,validateCatalog} from '../domain/catalog';
it('validates every researched fact and reference',()=>expect(validateCatalog(families,sources)).toEqual([]));
it('finds Cyrillic and model-code aliases',()=>{expect(families.filter(f=>familyMatches(f,{...EMPTY_FILTERS,query:'гольф 7'})).map(f=>f.id)).toEqual(['volkswagen-golf']);expect(families.filter(f=>familyMatches(f,{...EMPTY_FILTERS,query:'Octavia A7'})).map(f=>f.id)).toEqual(['skoda-octavia']);});
it('combines fuel and year on the same generation',()=>{expect(familyMatches(families[2],{...EMPTY_FILTERS,year:'2000',fuel:'Mild hybrid'})).toBe(false);expect(familyMatches(families[2],{...EMPTY_FILTERS,year:'2024',fuel:'Mild hybrid'})).toBe(true);});
it('does not advertise missing engine records as electric facts',()=>expect(families.filter(f=>familyMatches(f,{...EMPTY_FILTERS,fuel:'Электро'}))).toEqual([]));

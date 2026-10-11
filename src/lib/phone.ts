import {getCountries,getCountryCallingCode,parsePhoneNumberFromString,type CountryCode} from 'libphonenumber-js/min';
export {getCountryCallingCode};
export type {CountryCode};
const names=new Intl.DisplayNames(['en'],{type:'region'});
export const countries=getCountries().map(code=>({code,name:names.of(code)||code,dialCode:getCountryCallingCode(code)})).sort((a,b)=>a.name.localeCompare(b.name,'en'));
export function supportedCountry(value:unknown):value is CountryCode{return typeof value==='string'&&countries.some(c=>c.code===value)}
export function internationalPhone(value:string,country:CountryCode){
 if(!value.trim())return '';
 const parsed=parsePhoneNumberFromString(value,{defaultCountry:country,extract:false});
 return parsed?.number||`+${getCountryCallingCode(country)}${value.replace(/\D/g,'')}`;
}
export function phoneRegion(value:string,fallback:CountryCode='GH'):CountryCode{
 const parsed=parsePhoneNumberFromString(value);
 return parsed?.country||(parsed?.countryCallingCode===getCountryCallingCode(fallback)?fallback:getCountries().find(c=>getCountryCallingCode(c)===parsed?.countryCallingCode))||fallback;
}
export function restorePhone(value:string,country?:unknown,phoneCountry?:unknown,nationalPhone?:unknown){
 const parsed=parsePhoneNumberFromString(value);
 const selected=supportedCountry(country)?country:phoneRegion(value);
 return {country:selected,phoneCountry:supportedCountry(phoneCountry)?phoneCountry:phoneRegion(value,selected),nationalPhone:typeof nationalPhone==='string'?nationalPhone:parsed?.nationalNumber||value};
}

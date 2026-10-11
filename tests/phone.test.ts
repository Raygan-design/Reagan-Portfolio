import {test} from 'node:test';
import assert from 'node:assert/strict';
import {internationalPhone,restorePhone,getCountryCallingCode} from '../src/lib/phone';
test('normalises local WhatsApp numbers without duplicating national prefixes',()=>{
 assert.equal(internationalPhone('024 123 4567','GH'),'+233241234567');
 assert.equal(internationalPhone('07700 900123','GB'),'+447700900123');
 assert.equal(internationalPhone('+447700900123','GH'),'+447700900123');
 assert.equal(internationalPhone('','GH'),'');
 assert.equal(getCountryCallingCode('NG'),'234');
});
test('preserves meaningful Italian leading zero and shared calling codes',()=>{
 assert.equal(internationalPhone('02 3661 8300','IT'),'+390236618300');
 assert.equal(getCountryCallingCode('US'),'1');assert.equal(getCountryCallingCode('CA'),'1');
});
test('restores old international numbers and independent code choices',()=>{
 assert.deepEqual(restorePhone('+447700900123'),{country:'GB',phoneCountry:'GB',nationalPhone:'7700900123'});
 assert.deepEqual(restorePhone('+447700900123','GH','GB','07700 900123'),{country:'GH',phoneCountry:'GB',nationalPhone:'07700 900123'});
 assert.equal(restorePhone('','invalid','invalid').country,'GH');
});

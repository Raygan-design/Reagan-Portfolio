import {test} from 'node:test';
import assert from 'node:assert/strict';
import {verifiedRequestOrigin} from '../src/lib/request-origin';
const canonical = 'https://reagan-portfolio-phi.vercel.app';
const request = (url: string, origin?: string) => new Request(url, {headers: origin ? {origin} : {}});

test('custom domain remains usable when canonical setting still names the old alias', () => {
  assert.equal(verifiedRequestOrigin(request('https://www.reaganmarfo.com/api/support', 'https://www.reaganmarfo.com'), canonical), 'https://www.reaganmarfo.com');
  assert.equal(verifiedRequestOrigin(request(canonical + '/api/support', canonical), 'https://www.reaganmarfo.com'), canonical);
});
test('missing, opaque and foreign origins cannot submit payment requests', () => {
  for (const origin of [undefined, 'null', 'https://attacker.example', 'https://www.reaganmarfo.com.attacker.example', 'http://www.reaganmarfo.com']) {
    assert.equal(verifiedRequestOrigin(request('https://www.reaganmarfo.com/api/support', origin), canonical), null);
  }
});
test('canonical origin remains accepted behind an internal server address', () => {
  assert.equal(verifiedRequestOrigin(request('http://localhost:3000/api/support', 'https://www.reaganmarfo.com'), 'https://www.reaganmarfo.com'), 'https://www.reaganmarfo.com');
});

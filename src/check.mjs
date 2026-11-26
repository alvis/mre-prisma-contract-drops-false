// rehydrates the flag column's codec from the emitted contract, as the runtime client does
import { readFileSync } from 'node:fs';
import { arktypeJsonCodecRegistry } from '@prisma/orm-extension-arktype-json/codecs';
import { flag } from './contract.ts';

const contract = JSON.parse(readFileSync(new URL('./generated/contract.json', import.meta.url), 'utf8'));
const json = JSON.stringify(contract);
const typeParams = JSON.parse(json.slice(json.indexOf('{"expression"'), json.indexOf('}]}', json.indexOf('{"expression"')) + 3));

console.log('schema json IR:  ', JSON.stringify(flag.json));
console.log('contract.json IR:', JSON.stringify(typeParams.jsonIr));

const descriptor = arktypeJsonCodecRegistry.descriptorFor('arktype/json@1');
descriptor.factory(typeParams);
console.log('codec rehydrated');

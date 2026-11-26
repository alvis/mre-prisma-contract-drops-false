import arktypeJsonPack from '@prisma/orm-extension-arktype-json/pack';
import { arktypeJson } from '@prisma/orm-extension-arktype-json/column-types';
import { defineContract, field, model, type } from '@prisma/orm-postgres/contract-builder';
import { type as ark } from 'arktype';

// a feature flag: its JSON IR holds { unit: false } and { unit: true }
export const flag = ark('boolean');

export const contract = defineContract({ extensions: { arktypeJson: arktypeJsonPack } }, () => ({
  models: {
    Setting: model('Setting', {
      fields: {
        id: field.column(type.Uuid()).id(),
        flag: field.column(arktypeJson(flag)),
      },
    }).sql({ table: 'setting' }),
  },
}));

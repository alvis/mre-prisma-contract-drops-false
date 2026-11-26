import arktypeJson from '@prisma/orm-extension-arktype-json/control';
import { defineConfig } from '@prisma/orm-postgres/config';
import { definePrismaConfig } from 'prisma/config';

export default definePrismaConfig({
  orm: defineConfig({
    contract: './src/contract.ts',
    output: './src/generated',
    extensions: [arktypeJson],
  }),
});

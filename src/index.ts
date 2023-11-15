import type { DMMF } from '@prisma/generator-helper';
import { PluginOptions, resolvePath } from '@zenstackhq/sdk';
import { Model } from '@zenstackhq/sdk/ast';
import { generate } from './generator';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';

export const name = 'ZenStack MarkDown';

export default async function run(model: Model, options: PluginOptions, dmmf: DMMF.Document) {
    if (process.env.DISABLE_ZENSTACK_MD === 'true' || options.disable) {
        return;
    }
    const result = await generate(model, options, dmmf);

    let outFile = (options.output as string) ?? './schema.md';
    outFile = resolvePath(outFile, options);

    if (!fs.existsSync(path.dirname(outFile))) {
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
    }
    await writeFile(outFile, result);
}

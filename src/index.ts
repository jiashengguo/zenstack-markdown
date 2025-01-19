import type { DMMF } from '@prisma/generator-helper';
import { PluginOptions, resolvePath } from '@zenstackhq/sdk';
import { Model } from '@zenstackhq/sdk/ast';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';
import { aiGenerate } from './ai-generator';
import MermaidGenerator from './mermaid-generator';
import PolicyGenerator from './policy-generator';
import dotenv from 'dotenv';
import { generate } from './generator';
dotenv.config();

export const name = 'ZenStack MarkDown';

export const mermaidGenerator = new MermaidGenerator();
export const policyGenerator = new PolicyGenerator();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function run(model: Model, options: PluginOptions, dmmf: DMMF.Document) {
    if (process.env.DISABLE_ZENSTACK_MD === 'true' || options.disable) {
        return;
    }

    const isAiKeyProvided = ['XAI_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY'].some(
        (key) => process.env[key] !== undefined
    );

    if (!isAiKeyProvided) {
        console.warn(
            `\nYou could generate more meaningful doc using AI.\nSet OPENAI_API_KEY, ANTHROPIC_API_KEY or XAI_API_KEY in .env `
        );
    }

    const result = isAiKeyProvided ? await aiGenerate(model) : await generate(model);

    let outFile = (options.output as string) ?? './schema.md';
    outFile = resolvePath(outFile, options);

    if (!fs.existsSync(path.dirname(outFile))) {
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
    }
    await writeFile(outFile, result);
}

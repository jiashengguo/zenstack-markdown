import { DMMF } from '@prisma/generator-helper';
import { PluginOptions } from '@zenstackhq/sdk';
import { DataModel, Model, isDataModel } from '@zenstackhq/sdk/ast';
import MermaidGenerator from './mermaid-generator';
import PolicyGenerator from './policy-generator';

const mermaidGenerator = new MermaidGenerator();
const policyGenerator = new PolicyGenerator();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generate(model: Model, options: PluginOptions, dmmf: DMMF.Document) {
    const dataModels = model.declarations.filter((x) => isDataModel(x)) as DataModel[];

    const headings = dataModels.map((x) => `- [${x.name}](#${x.name})`).join('\n');

    const modelChapter = dataModels
        .map((x) => {
            return [`## ${x.name}`, mermaidGenerator.generate(x), policyGenerator.generate(x)].join('\n');
        })
        .join('\n');

    const content = [
        '# ZModel',
        '> Generated by [`ZenStack-markdown`](https://github.com/jiashengguo/zenstack-markdown)',
        headings,
        modelChapter,
    ].join('\n\n');

    return content;
}

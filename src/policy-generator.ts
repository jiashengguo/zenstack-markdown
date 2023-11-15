import { getLiteral } from '@zenstackhq/sdk';
import { DataModel, DataModelAttribute } from '@zenstackhq/sdk/ast';
import ZModelCodeGenerator from './zmodel-code-generator';

export default class PolicyGenerator {
    public readonly CRUD = ['create', 'read', 'update', 'delete'];
    private zModelGenerator: ZModelCodeGenerator = new ZModelCodeGenerator();

    generate(dataModel: DataModel) {
        const groupByCrud = dataModel.attributes
            .filter((x) => ['@@allow', '@@deny'].includes(x.decl.ref?.name || ''))
            .reduce<Record<string, DataModelAttribute[]>>((group, x) => {
                const ops = getLiteral<string>(x.args[0].value);
                if (ops) {
                    const splitOps = ops == 'all' ? this.CRUD : ops.split(',').map((x) => x.trim());

                    splitOps.forEach((op) => {
                        group[op] = group[op] || [];
                        group[op].push(x);
                    });
                }

                return group;
            }, {});

        return this.CRUD.map((x) => {
            //deny first
            const rules = groupByCrud[x]
                ? groupByCrud[x]
                      .sort((a) => {
                          return a.decl.ref?.name == '@@deny' ? -1 : 1;
                      })
                      .map(
                          (x) =>
                              `  - ${
                                  x.decl.ref?.name == '@@deny' ? '❌' : '✅'
                              }${this.zModelGenerator.generateExpression(x.args[1].value)}`
                      )
                      .join('\n')
                : [];

            return [`- ${x.toUpperCase()}`, rules].join('\n');
        }).join('\n');
    }
}

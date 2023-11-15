import { isForeignKeyField, isIdField, isRelationshipField } from '@zenstackhq/sdk';
import { DataModel, DataModelField } from '@zenstackhq/sdk/ast';

export default class MermaidGenerator {
    generate(dataModel: DataModel) {
        const fields = dataModel.fields
            .filter((x) => !isRelationshipField(x))
            .map((x) => {
                return [
                    x.type.type || x.type.reference?.ref?.name,
                    x.name,
                    isIdField(x) ? 'PK' : isForeignKeyField(x) ? 'FK' : '',
                    x.type.optional ? '"?"' : '',
                ].join(' ');
            })
            .map((x) => `  ${x}`)
            .join('\n');

        const relations = dataModel.fields
            .filter((x) => isRelationshipField(x))
            .map((x) => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const oppositeModel = x.type.reference!.ref as DataModel;

                const oppositeField = oppositeModel.fields.find(
                    (x) => x.type.reference?.ref == dataModel
                ) as DataModelField;

                const currentType = x.type;
                const oppositeType = oppositeField.type;

                let relation = '';

                if (currentType.array && oppositeType.array) {
                    //many to many
                    relation = '}o--o{';
                } else if (currentType.array && !oppositeType.array) {
                    //one to many
                    relation = '||--o{';
                } else if (!currentType.array && oppositeType.array) {
                    //many to one
                    relation = '}o--||';
                } else {
                    //one to one
                    relation = currentType.optional ? '||--o|' : '|o--||';
                }

                return [`"${dataModel.name}"`, relation, `"${oppositeField.$container.name}": ${x.name}`].join(' ');
            })
            .join('\n');

        return ['```mermaid', 'erDiagram', `"${dataModel.name}" {\n${fields}\n}`, relations, '```'].join('\n');
    }
}

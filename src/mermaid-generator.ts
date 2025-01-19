import { isForeignKeyField, isIdField, isRelationshipField } from '@zenstackhq/sdk';
import { DataModel, DataModelField, isTypeDef, TypeDef } from '@zenstackhq/sdk/ast';

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

        const jsonFields = dataModel.fields
            .filter((x) => isTypeDef(x.type.reference?.ref))
            .map((x) => {
                return this.generateTypeDef(x.type.reference?.ref as TypeDef, dataModel.name);
            })
            .join('\n');

        return ['```mermaid', 'erDiagram', `"${dataModel.name}" {\n${fields}\n}`, relations, jsonFields, '```'].join(
            '\n'
        );
    }

    generateTypeDef(typeDef: TypeDef, relatedEntityName: string): string {
        const fields = typeDef.fields
            .map((x) => {
                return [x.type.type || x.type.reference?.ref?.name, x.name, x.type.optional ? '"?"' : ''].join(' ');
            })
            .map((x) => `  ${x}`)
            .join('\n');

        const jsonFields = typeDef.fields
            .filter((x) => isTypeDef(x.type.reference?.ref))
            .map((x) => this.generateTypeDef(x.type.reference?.ref as TypeDef, typeDef.name))
            .join('\n');

        return [
            `"${typeDef.name}" {\n${fields}\n} \n"${relatedEntityName}" ||--|| "${typeDef.name}": has`,
            jsonFields,
        ].join('\n');
    }
}

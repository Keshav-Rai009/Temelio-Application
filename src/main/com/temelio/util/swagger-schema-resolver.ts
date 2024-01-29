export class SwaggerSchemaResolver {
    private readonly primitives = ["string", "number", "boolean"];
    private readonly complexSchemaProperties = ['oneOf', 'anyOf', 'allOf', 'not']

    resolve(propertySchema: any, propertyName: string, TSModels: Map<string, string>): string {
        const propertyType = propertySchema["type"];
        const propertyFormat = propertySchema["format"];
        const enums: string[] = propertySchema["enum"];
        const schemaRef: string = propertySchema["$ref"];

        // enums has type - 'string' - a primitive
        if (enums) {
            return this.resolveSwaggerEnums(propertyName.toUpperCase(), enums, TSModels)
        }

        if (this.isPrimitiveType(propertyType)) {
            return propertyType;
        }

        if (propertyType === "object") {
            return this.resolveSwaggerObject(propertySchema, TSModels)
        }

        if (propertyType === "array") {
            return this.resolveSwaggerArray(propertyName, propertySchema, TSModels)
        }

        if (schemaRef) {
            return this.resolveSwaggerRef(schemaRef);
        }

        if (propertyFormat === "int32" || propertyFormat === "double" || propertyFormat === "int64" || propertyType === 'integer') {
            return 'number';
        }

        if (propertyFormat === "uuid") {
            return "string";
        }

        if (propertyFormat === "date-time" || propertyFormat === "date") {
            return "Date";
        }

        const complexProperty = this.getComplexProperty(Object.keys(propertySchema))
        if (complexProperty) {
            return this.resolveComplexSchema(propertyName, complexProperty, propertySchema, TSModels);
        }

        return propertyType;
    }

    private isPrimitiveType(type: string) {
        return this.primitives.includes(type);
    }

    private isComplexSchema(properties: string[]) {
        return properties.some(property => this.complexSchemaProperties.includes(property));
    }

    private getComplexProperty(properties: string[]) {
        return properties.find(property => this.complexSchemaProperties.includes(property));
    }

    private resolveSwaggerObject(schema: any, TSModels: Map<string, string>) {
        const properties = schema["properties"];
        const propertyNames = Object.keys(properties);
        let objectModel = '{';
        propertyNames.forEach((property, i) => {
            const schema = properties[property as keyof typeof properties];
            const modelType = this.resolve(schema, property, TSModels);
            objectModel += (i < propertyNames.length - 1 ? ` ${property}:${modelType},` : ` ${property}:${modelType} `);
        })
        objectModel += '}';
        return objectModel;
    }

    private resolveSwaggerEnums(enumName: string, enums: Array<string>, TSModels: Map<string, string>) {
        let enumModel = `export enum ${enumName} {`;
        enums.forEach((e, j) => {
            enumModel += (j < enums.length - 1 ? ` ${e},` : ` ${e} `);
        })
        enumModel += `}`;
        TSModels.set(enumName, enumModel);
        return enumName;
    }

    private resolveSwaggerArray(propertyName: string, schema: any, TSModels: Map<string, string>) {
        const arrayItems = schema.items;
        const arrayType = arrayItems.type;
        const resolvedType = this.resolve(arrayItems, propertyName, TSModels);
        return arrayType === 'object' ? '[' + resolvedType + ']' : resolvedType + '[]';
    }

    private resolveSwaggerRef(schemaRef: string) {
        const splits = schemaRef.split("/");
        const referencedSchema = splits[splits.length - 1];
        return referencedSchema;
    }

    private resolveComplexSchema(propertyName: string, complexProperty: string, schema: any, TSModels: Map<string, string>) {
        const complexSchemaItems = schema[complexProperty as keyof typeof schema];
        let complexType = ""
        switch (complexProperty) {
            // T1 | T2
            case 'oneOf':
            case 'anyOf':
                complexSchemaItems.forEach((complexItem: any, j: any) => {
                    const type = this.resolve(complexItem, propertyName, TSModels);
                    complexType += (j < complexSchemaItems.length - 1 ? ` ${type} | ` : ` ${type} `);
                });
                return complexType;

            //T1 & T2
            case 'allOf':
                complexSchemaItems.forEach((complexItem: any, j: any) => {
                    const type = this.resolve(complexItem, propertyName, TSModels);
                    complexType += (j < complexSchemaItems.length - 1 ? ` ${type} & ` : ` ${type} `);
                });
                return complexType;

            // !(T1 | T2)
            case 'not':
                complexSchemaItems.forEach((complexItem: any, j: any) => {
                    const type = this.resolve(complexItem, propertyName, TSModels);
                    complexType += (j < complexSchemaItems.length - 1 ? ` ${type} | ` : ` ${type} `);
                });
                return '! (' + complexType + ')';
            default:
                return propertyName;
        }
    }

}

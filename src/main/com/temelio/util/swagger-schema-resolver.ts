export class SwaggerSchemaResolver {
    private readonly primitives = ["string", "number", "boolean"];
    private readonly complexSchemaProperties = ['oneOf', 'anyOf', 'allOf', 'not']

    resolve(propertySchema: any, propertyName: string, additionalTSTypes: string, TSModels: Map<string, string>): any {
        const propertyType = propertySchema["type"];
        const propertyFormat = propertySchema["format"];
        const enums: string[] = propertySchema["enum"];
        const schemaRef: string = propertySchema["$ref"];

        // enums has type - 'string' - a primitive
        if (enums) {
            return this.resolveSwaggerEnums(propertyName.toUpperCase(), enums, additionalTSTypes, TSModels)
        }

        if (this.isPrimitiveType(propertyType) && !propertyFormat) {
            return { propertyType, additionalTSTypes };
        }

        if (propertyType === "object") {
            return this.resolveSwaggerObject(propertySchema, additionalTSTypes, TSModels)
        }

        if (propertyType === "array") {
            return this.resolveSwaggerArray(propertyName, propertySchema, additionalTSTypes, TSModels)
        }

        if (schemaRef) {
            return { propertyType: this.resolveSwaggerRef(schemaRef), additionalTSTypes };
        }

        if (propertyFormat === "int32" || propertyFormat === "double" || propertyFormat === "int64" || propertyType === 'integer') {
            return { propertyType: "number", additionalTSTypes };
        }

        if (propertyFormat === "uuid") {
            return { propertyType: "string", additionalTSTypes };
        }

        if (propertyFormat === "date-time" || propertyFormat === "date") {
            return { propertyType: "Date", additionalTSTypes };
        }

        const complexProperty = this.getComplexProperty(Object.keys(propertySchema))
        if (complexProperty) {
            return { propertyType: this.resolveComplexSchema(propertyName, complexProperty, propertySchema, additionalTSTypes, TSModels), additionalTSTypes };
        }

        return { propertyType, additionalTSTypes };
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

    private resolveSwaggerObject(schema: any, additionalTSTypes: string, TSModels: Map<string, string>) {
        const properties = schema["properties"] ? schema["properties"] : schema["additionalProperties"];
        if (!properties) {
            return { propertyType: '{}', additionalTSTypes }
        }
        const propertyNames = Object.keys(properties);
        let objectModel = '{';
        propertyNames.forEach((property, i) => {
            const schema = properties[property as keyof typeof properties];
            const { propertyType } = this.resolve(schema, property, additionalTSTypes, TSModels);
            objectModel += (i < propertyNames.length - 1 ? ` ${property}:${propertyType},` : ` ${property}:${propertyType} `);
        })
        objectModel += '}';
        return { propertyType: objectModel, additionalTSTypes };
    }

    private resolveSwaggerEnums(enumName: string, enums: Array<string>, additionalTSTypes: string, TSModels: Map<string, string>) {
        let enumModel = `export enum ${enumName} {`;
        enums.forEach((e, j) => {
            enumModel += (j < enums.length - 1 ? ` ${e},` : ` ${e} `);
        })
        enumModel += `}`;
        additionalTSTypes += enumModel;
        TSModels.set(enumName, enumModel);
        return { propertyType: enumName, additionalTSTypes };
    }

    private resolveSwaggerArray(propertyName: string, schema: any, additionalTSTypes: string, TSModels: Map<string, string>) {
        const arrayItems = schema.items;
        const arrayType = arrayItems.type;
        const { propertyType } = this.resolve(arrayItems, propertyName, additionalTSTypes, TSModels);
        return { propertyType: arrayType === 'object' ? '[' + propertyType + ']' : propertyType + '[]', additionalTSTypes };
    }

    private resolveSwaggerRef(schemaRef: string) {
        const splits = schemaRef.split("/");
        const referencedSchema = splits[splits.length - 1];
        return referencedSchema;
    }

    private resolveComplexSchema(propertyName: string, complexProperty: string, schema: any, additionalTSTypes: string, TSModels: Map<string, string>) {
        const complexSchemaItems = schema[complexProperty as keyof typeof schema];
        let complexType = ""
        switch (complexProperty) {
            // T1 | T2
            case 'oneOf':
            case 'anyOf':
                complexSchemaItems.forEach((complexItem: any, j: any) => {
                    const { propertyType } = this.resolve(complexItem, propertyName, additionalTSTypes, TSModels);
                    complexType += (j < complexSchemaItems.length - 1 ? ` ${propertyType} | ` : ` ${propertyType} `);
                });
                return complexType;

            //T1 & T2
            case 'allOf':
                complexSchemaItems.forEach((complexItem: any, j: any) => {
                    const { propertyType } = this.resolve(complexItem, propertyName, additionalTSTypes, TSModels);
                    complexType += (j < complexSchemaItems.length - 1 ? ` ${propertyType} & ` : ` ${propertyType} `);
                });
                return complexType;

            // !(T1 | T2)
            case 'not':
                complexSchemaItems.forEach((complexItem: any, j: any) => {
                    const { propertyType } = this.resolve(complexItem, propertyName, additionalTSTypes, TSModels);
                    complexType += (j < complexSchemaItems.length - 1 ? ` ${propertyType} | ` : ` ${propertyType} `);
                });
                return '! (' + complexType + ')';
            default:
                return propertyName;
        }
    }

}

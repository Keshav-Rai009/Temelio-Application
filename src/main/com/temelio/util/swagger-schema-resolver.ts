export class SwaggerSchemaResolver {
    private readonly primitives = ["string", "number", "boolean"];

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

        return propertyType;
    }

    private isPrimitiveType(type: string) {
        return this.primitives.includes(type);
    }

    private resolveSwaggerObject(schema: any, TSModels: Map<string, string>) {
        const properties = schema["properties"];
        const propertyNames = Object.keys(properties);
        let objectModel = '{';
        propertyNames.forEach((property, i) => {
            const schema = properties[property as keyof typeof properties];
            const modelType = this.resolve(schema, property, TSModels);
            objectModel += (i < propertyNames.length - 1 ? `  ${property}:${modelType},` : `    ${property}:${modelType}`);
        })
        objectModel += '}';
        return objectModel;
    }

    private resolveSwaggerEnums(enumName: string, enums: Array<string>, TSModels: Map<string, string>) {
        let enumModel = `export enum ${enumName} {`;
        enums.forEach((e, j) => {
            enumModel += (j < enums.length - 1 ? `    ${e},` : `    ${e}`);
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

}

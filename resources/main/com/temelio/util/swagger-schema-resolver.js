"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerSchemaResolver = void 0;
class SwaggerSchemaResolver {
    constructor() {
        this.primitives = ["string", "number", "boolean"];
    }
    resolve(propertySchema, propertyName, TSModels) {
        const propertyType = propertySchema["type"];
        const propertyFormat = propertySchema;
        const enums = propertySchema["enum"];
        const schemaRef = propertySchema["$ref"];
        // enums has type - 'string' - a primitive
        if (enums) {
            return this.resolveSwaggerEnums(propertyName.toUpperCase(), enums, TSModels);
        }
        if (this.isPrimitiveType(propertyType)) {
            return propertyType;
        }
        if (propertyType === "object") {
            return this.resolveSwaggerObject(propertySchema, TSModels);
        }
        if (propertyType === "array") {
            return this.resolveSwaggerArray(propertyName, propertySchema, TSModels);
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
    isPrimitiveType(type) {
        return this.primitives.includes(type);
    }
    resolveSwaggerObject(schema, TSModels) {
        const properties = schema["properties"];
        const propertyNames = Object.keys(properties);
        let objectModel = '{';
        propertyNames.forEach((property, i) => {
            const schema = properties[property];
            const modelType = this.resolve(schema, property, TSModels);
            objectModel += (i < propertyNames.length - 1 ? `  ${property}:${modelType},` : `    ${property}:${modelType}`);
        });
        objectModel += '}';
        return objectModel;
    }
    resolveSwaggerEnums(enumName, enums, TSModels) {
        let enumModel = `export enum ${enumName} {`;
        enums.forEach((e, j) => {
            enumModel += (j < enums.length - 1 ? `    ${e},` : `    ${e}`);
        });
        enumModel += `}`;
        TSModels.set(enumName, enumModel);
        return enumName;
    }
    resolveSwaggerArray(propertyName, schema, TSModels) {
        const arrayItems = schema.items;
        const arrayType = arrayItems.type;
        const resolvedType = this.resolve(arrayItems, propertyName, TSModels);
        return arrayType === 'object' ? '[' + resolvedType + ']' : resolvedType + '[]';
    }
    resolveSwaggerRef(schemaRef) {
        const splits = schemaRef.split("/");
        const referencedSchema = splits[splits.length - 1];
        return referencedSchema;
    }
}
exports.SwaggerSchemaResolver = SwaggerSchemaResolver;
//# sourceMappingURL=swagger-schema-resolver.js.map
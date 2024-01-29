"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerSchemaResolver = void 0;
class SwaggerSchemaResolver {
    constructor() {
        this.primitives = ["string", "number", "boolean"];
        this.complexSchemaProperties = ['oneOf', 'anyOf', 'allOf', 'not'];
    }
    resolve(propertySchema, propertyName, additionalTSTypes, TSModels) {
        const propertyType = propertySchema["type"];
        const propertyFormat = propertySchema["format"];
        const enums = propertySchema["enum"];
        const schemaRef = propertySchema["$ref"];
        // enums has type - 'string' - a primitive
        if (enums) {
            return this.resolveSwaggerEnums(propertyName.toUpperCase(), enums, additionalTSTypes, TSModels);
        }
        if (this.isPrimitiveType(propertyType)) {
            return { propertyType, additionalTSTypes };
        }
        if (propertyType === "object") {
            return this.resolveSwaggerObject(propertySchema, additionalTSTypes, TSModels);
        }
        if (propertyType === "array") {
            return this.resolveSwaggerArray(propertyName, propertySchema, additionalTSTypes, TSModels);
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
        const complexProperty = this.getComplexProperty(Object.keys(propertySchema));
        if (complexProperty) {
            return { propertyType: this.resolveComplexSchema(propertyName, complexProperty, propertySchema, additionalTSTypes, TSModels), additionalTSTypes };
        }
        return { propertyType, additionalTSTypes };
    }
    isPrimitiveType(type) {
        return this.primitives.includes(type);
    }
    isComplexSchema(properties) {
        return properties.some(property => this.complexSchemaProperties.includes(property));
    }
    getComplexProperty(properties) {
        return properties.find(property => this.complexSchemaProperties.includes(property));
    }
    resolveSwaggerObject(schema, additionalTSTypes, TSModels) {
        const properties = schema["properties"];
        const propertyNames = Object.keys(properties);
        let objectModel = '{';
        propertyNames.forEach((property, i) => {
            const schema = properties[property];
            const { propertyType } = this.resolve(schema, property, additionalTSTypes, TSModels);
            objectModel += (i < propertyNames.length - 1 ? ` ${property}:${propertyType},` : ` ${property}:${propertyType} `);
        });
        objectModel += '}';
        return { propertyType: objectModel, additionalTSTypes };
    }
    resolveSwaggerEnums(enumName, enums, additionalTSTypes, TSModels) {
        let enumModel = `export enum ${enumName} {`;
        enums.forEach((e, j) => {
            enumModel += (j < enums.length - 1 ? ` ${e},` : ` ${e} `);
        });
        enumModel += `}`;
        additionalTSTypes += enumModel;
        TSModels.set(enumName, enumModel);
        return { propertyType: enumName, additionalTSTypes };
    }
    resolveSwaggerArray(propertyName, schema, additionalTSTypes, TSModels) {
        const arrayItems = schema.items;
        const arrayType = arrayItems.type;
        const { propertyType } = this.resolve(arrayItems, propertyName, additionalTSTypes, TSModels);
        return { propertyType: arrayType === 'object' ? '[' + propertyType + ']' : propertyType + '[]', additionalTSTypes };
    }
    resolveSwaggerRef(schemaRef) {
        const splits = schemaRef.split("/");
        const referencedSchema = splits[splits.length - 1];
        return referencedSchema;
    }
    resolveComplexSchema(propertyName, complexProperty, schema, additionalTSTypes, TSModels) {
        const complexSchemaItems = schema[complexProperty];
        let complexType = "";
        switch (complexProperty) {
            // T1 | T2
            case 'oneOf':
            case 'anyOf':
                complexSchemaItems.forEach((complexItem, j) => {
                    const { propertyType } = this.resolve(complexItem, propertyName, additionalTSTypes, TSModels);
                    complexType += (j < complexSchemaItems.length - 1 ? ` ${propertyType} | ` : ` ${propertyType} `);
                });
                return complexType;
            //T1 & T2
            case 'allOf':
                complexSchemaItems.forEach((complexItem, j) => {
                    const { propertyType } = this.resolve(complexItem, propertyName, additionalTSTypes, TSModels);
                    complexType += (j < complexSchemaItems.length - 1 ? ` ${propertyType} & ` : ` ${propertyType} `);
                });
                return complexType;
            // !(T1 | T2)
            case 'not':
                complexSchemaItems.forEach((complexItem, j) => {
                    const { propertyType } = this.resolve(complexItem, propertyName, additionalTSTypes, TSModels);
                    complexType += (j < complexSchemaItems.length - 1 ? ` ${propertyType} | ` : ` ${propertyType} `);
                });
                return '! (' + complexType + ')';
            default:
                return propertyName;
        }
    }
}
exports.SwaggerSchemaResolver = SwaggerSchemaResolver;
//# sourceMappingURL=swagger-schema-resolver.js.map
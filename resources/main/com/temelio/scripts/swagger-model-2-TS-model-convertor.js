"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SwaggerModel2TSModelGenerator = void 0;
const temelioSwagger_json_1 = __importDefault(require("../assets/temelioSwagger.json"));
class SwaggerModel2TSModelGenerator {
    constructor() {
        // input JSON should never be distored by the script
        this.swaggerModels = temelioSwagger_json_1.default.components.schemas;
        // token should never be kept in codebase - should be in some key store DB or secrets vault.
        this.grandSubmissionsCSVFilePath = "/Users/I511589/Desktop/Projects/Temelio Application/src/main/com/temelio/assets/nonprofit_submission_data.csv";
    }
    // constructor(
    //     private readonly csvParser: CSVParser,
    //     private readonly httpUtil: HTTPUtil
    // ) { }
    convert() {
        return __awaiter(this, void 0, void 0, function* () {
            const modelNames = Object.keys(this.swaggerModels);
            let TSModels = [];
            // for (const modelName of modelNames.slice(0, 4)) {
            //     const modelSchema = models[modelName];
            //     const modelType = modelSchema.type;
            //     const modelProperties = modelSchema.properties;
            //     //console.log( modelSchema,modelType,modelProperties);
            //     const propertyNames = Object.keys(modelProperties);
            //     console.log(`export interface ${modelName} {`);
            //     let TSModel = `export interface ${modelName} {`;
            //     //<T> inter {[name: string]: string;};
            //     //class modelName {};
            //     propertyNames.forEach((property, i) => {
            //         const propertySchema = modelProperties[property];
            //         const propertyType = propertySchema.type;
            //         const propertyFormat = propertySchema.format;
            //         const enums = propertySchema.enum;
            //         const propertyFields = Object.values(propertySchema);
            //         const propertyItems = propertySchema.items;
            //         //console.log(propertyFields);
            //         // primitives
            //         if (isPrimitiveType(propertyType) && propertyFields.length === 1) {
            //             TSModel += (i < propertyNames.length - 1 ? `    ${property}: ${propertyType},` : `    ${property}: ${propertyType}`)
            //             console.log(i < propertyNames.length - 1 ? `    ${property}: ${propertyType},` : `    ${property}: ${propertyType}`);
            //         }
            //         else if (enums) {
            //             const enumName = property.toUpperCase()
            //             console.log(`export interface ${enumName} {`)
            //             enums.forEach((e: any, j: any) => {
            //                 console.log(j < enums.length - 1 ? `    ${e}: ${e},` : `    ${e}: ${e}`);
            //             })
            //             console.log(`}`);
            //             TSModel += (i < propertyNames.length - 1 ? `    ${property}: ${enumName},` : `    ${property}: ${enumName}`)
            //         }
            //         else if (propertyFormat === "int32" || propertyFormat === "double" || propertyFormat === "int64") {
            //             const type = "number";
            //             TSModel += (i < propertyNames.length - 1 ? `    ${property}: ${type},` : `    ${property}: ${type}`)
            //             console.log(i < propertyNames.length - 1 ? `    ${property}: ${type},` : `    ${property}: ${type}`);
            //         }
            //         else if (propertyFormat === "uuid") {
            //             const type = "GUID";
            //             TSModel += (i < propertyNames.length - 1 ? `    ${property}: ${type},` : `    ${property}: ${type}`)
            //             console.log(i < propertyNames.length - 1 ? `    ${property}: ${type},` : `    ${property}: ${type}`);
            //         }
            //         else if (propertyFormat === "date-time" || propertyFormat === "date") {
            //             const type = "Date";
            //             TSModel += (i < propertyNames.length - 1 ? `    ${property}: ${type},` : `    ${property}: ${type}`)
            //             console.log(i < propertyNames.length - 1 ? `    ${property}: ${type},` : `    ${property}: ${type}`);
            //         }
            //         // else if(propertyItems)
            //         // {
            //         //     const type = "number";
            //         //     TSModel+=(i <propertyNames.length-1?`    ${property}: ${type},`:`    ${property}: ${type}`)
            //         //     console.log(i <propertyNames.length-1?`    ${property}: ${type},`:`    ${property}: ${type}`);
            //         // }
            //         else if (propertyType === "array") {
            //             const arrayItems = propertySchema.items;
            //             const arrayFields = Object.keys(arrayItems);
            //             arrayFields.forEach((field, i) => {
            //                 if (isPrimitiveType(field)) {
            //                     TSModel += (i < propertyNames.length - 1 ? `    ${field}: ${arrayItems[field]},` : `    ${field}: ${arrayItems[field]}`)
            //                     console.log(i < propertyNames.length - 1 ? `    ${field}: ${arrayItems[field]},` : `    ${field}: ${arrayItems[field]}`);
            //                 }
            //                 // to be handled
            //                 if (field === "$ref") {
            //                     const splits = arrayItems[field].split("/");
            //                     const referencedSchema = splits[splits.length - 1];
            //                     TSModel += (i < propertyNames.length - 1 ? `    ${property}: ${referencedSchema}[],` : `    ${property}: ${referencedSchema}[]`)
            //                     console.log(i < propertyNames.length - 1 ? `    ${property}: ${referencedSchema}[],` : `    ${property}: ${referencedSchema}[]`);
            //                 }
            //             })
            //         }
            //     })
            //     TSModel += `}`;
            //     console.log(`}`);
            //     console.log(TSModel);
            //     TSModels.push(TSModel);
            //     fs.writeFileSync('../TSModels.json', TSModels.toString());
            // }
            console.log(TSModels);
        });
    }
}
exports.SwaggerModel2TSModelGenerator = SwaggerModel2TSModelGenerator;
//# sourceMappingURL=swagger-model-2-TS-model-convertor.js.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const fs = __importStar(require("fs"));
const util = __importStar(require("util"));
const temelioSwagger_json_1 = __importDefault(require("../assets/temelioSwagger.json"));
/**
 * Converts any swagger schema into typesafe TypeScript local object models
 * Supported Swagger version - 3.0.x
 * Limitations: On [allOf, not] types - <TS does not have equivalent types>
 * @generates: TS Model class for each schema property and stores all TS Models in a text file <TSModel.txt>
 * @return: A map of TypeScript Models
*/
class SwaggerModel2TSModelGenerator {
    constructor(swaggerSchemaResolver) {
        this.swaggerSchemaResolver = swaggerSchemaResolver;
        // input JSON should never be distored by the script
        this.swaggerModels = temelioSwagger_json_1.default.components.schemas;
        this.swaggerVersion = temelioSwagger_json_1.default.openapi;
        this.TSModelsFilePath = "/Users/I511589/Desktop/Projects/Temelio Application/src/main/com/temelio/assets/TSModels.txt";
        this.TSModelDirPath = "/Users/I511589/Desktop/Projects/Temelio Application/src/main/com/temelio/model/";
    }
    generateTSModels() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isValidVersion(this.swaggerVersion)) {
                console.error("ABORTING !!! Please provide a swagger file having version 3.0.x");
                return;
            }
            if (!this.swaggerModels) {
                console.error("ABORTING !!! Distorted swagger file.");
                return;
            }
            const modelNames = Object.keys(this.swaggerModels);
            let TSModels = new Map();
            for (const modelName of modelNames) {
                const modelSchema = this.swaggerModels[modelName];
                const modelProperties = modelSchema.properties;
                const propertyNames = Object.keys(modelProperties);
                let TSModel = `export interface ${modelName} {`;
                let additionalModels = '';
                propertyNames.forEach((property, i) => {
                    const propertySchema = modelProperties[property];
                    const { propertyType, additionalTSTypes } = this.swaggerSchemaResolver.resolve(propertySchema, property, additionalModels, TSModels);
                    TSModel += (i < propertyNames.length - 1 ? `  ${property}: ${propertyType},` : `  ${property}: ${propertyType} `);
                    additionalModels = additionalTSTypes;
                });
                TSModel += `}`;
                TSModels.set(modelName, TSModel);
                // creates TS Model classes for each schema property - appended '1' so that used models are not changed.
                // usage - simple remove '' from the string and import appropriate files and use :) 
                fs.writeFileSync(this.TSModelDirPath + modelName + '1.ts', util.inspect(TSModel + '  ' + additionalModels), 'utf-8');
            }
            // stores all TS Model classes for each schema property
            fs.writeFileSync(this.TSModelsFilePath, util.inspect(TSModels), 'utf-8');
            console.log("SUCCESS !!! Generated TS Models from the given swagger file :)");
            return TSModels;
        });
    }
    isValidVersion(semver) {
        if (!semver)
            return false;
        const semverSplits = semver.split('.');
        return semverSplits[0] === '3' && semverSplits[1] === '0' && parseInt(semverSplits[2]) >= 0;
    }
}
exports.SwaggerModel2TSModelGenerator = SwaggerModel2TSModelGenerator;
//# sourceMappingURL=swagger-model-2-TS-model-generator.js.map
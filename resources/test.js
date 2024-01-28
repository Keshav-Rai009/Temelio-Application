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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
function generateTypeScriptTypes(swaggerJson) {
    const typeScriptCode = [];
    for (const definitionName in swaggerJson) {
        if (swaggerJson.hasOwnProperty(definitionName)) {
            const properties = swaggerJson[definitionName].properties;
            const typeScriptDefinition = `interface ${definitionName} {`;
            typeScriptCode.push(typeScriptDefinition);
            for (const propertyName in properties) {
                if (properties.hasOwnProperty(propertyName)) {
                    const propertyType = mapSwaggerTypeToTypeScript(properties[propertyName].type);
                    const propertyDeclaration = `${propertyName}: ${propertyType};`;
                    typeScriptCode.push(propertyDeclaration);
                }
            }
            typeScriptCode.push('}');
            typeScriptCode.push(''); // Add an empty line for better readability
        }
    }
    return typeScriptCode.join('\n');
}
function mapSwaggerTypeToTypeScript(swaggerType) {
    // Map Swagger types to TypeScript types as needed
    switch (swaggerType.toLowerCase()) {
        case 'string':
            return 'string';
        case 'number':
            return 'number';
        case 'integer':
            return 'number'; // You might want to use 'number' or 'bigint' based on your use case
        case 'boolean':
            return 'boolean';
        // Add more cases as needed
        default:
            return 'any';
    }
}
// Read Swagger JSON from file
const swaggerJsonFile = '.assets/swagger.json';
const swaggerJsonContent = fs.readFileSync(swaggerJsonFile, 'utf-8');
const swaggerJson = JSON.parse(swaggerJsonContent);
// Generate TypeScript types
const typeScriptTypes = generateTypeScriptTypes(swaggerJson);
// Output the TypeScript types
console.log(typeScriptTypes);
//# sourceMappingURL=test.js.map
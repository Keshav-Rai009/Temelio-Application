import * as fs from 'fs';
import * as util from 'util';
import swaggerJson from "../assets/temelioSwagger.json";
import { SwaggerSchemaResolver } from "../util/swagger-schema-resolver";


/**
 * Converts any swagger schema into typesafe TypeScript local object models
 * Supported Swagger version - 3.0.x
 * Limitations: On [allOf, not] types - <TS does not have equivalent types>
 * @generates: TS Model class for each schema property and stores all TS Models in a text file <TSModel.txt>
 * @return: A map of TypeScript Models 
*/

export class SwaggerModel2TSModelGenerator {
    // input JSON should never be distored by the script
    private readonly swaggerModels = swaggerJson.components.schemas;
    private readonly swaggerVersion = swaggerJson.openapi;
    private readonly TSModelsFilePath = "/Users/I511589/Desktop/Projects/Temelio Application/src/main/com/temelio/assets/TSModels.txt";
    private readonly TSModelDirPath = "/Users/I511589/Desktop/Projects/Temelio Application/src/main/com/temelio/model/";

    constructor(
        private readonly swaggerSchemaResolver: SwaggerSchemaResolver,
    ) { }

    public async generateTSModels() {
        if (!this.isValidVersion(this.swaggerVersion)) {
            console.error("ABORTING !!! Please provide a swagger file having version 3.0.x");
            return;
        }

        if (!this.swaggerModels) {
            console.error("ABORTING !!! Distorted swagger file.");
            return;
        }

        const modelNames = Object.keys(this.swaggerModels);
        let TSModels: Map<string, string> = new Map();

        for (const modelName of modelNames) {
            const modelSchema = this.swaggerModels[modelName as keyof typeof this.swaggerModels];
            const modelProperties = modelSchema.properties;
            const propertyNames = Object.keys(modelProperties);
            let TSModel = `export interface ${modelName} {`;
            let additionalModels = '';
            propertyNames.forEach((property, i) => {
                const propertySchema = modelProperties[property as keyof typeof modelProperties];
                const { propertyType, additionalTSTypes } = this.swaggerSchemaResolver.resolve(propertySchema, property, additionalModels, TSModels);
                TSModel += (i < propertyNames.length - 1 ? `  ${property}: ${propertyType},` : `  ${property}: ${propertyType} `);
                additionalModels = additionalTSTypes;
            })
            TSModel += `}`;
            TSModels.set(modelName, TSModel);
            // creates TS Model classes for each schema property
            fs.writeFileSync(this.TSModelDirPath + modelName + '1.ts', util.inspect(TSModel + '  ' + additionalModels), 'utf-8');
        }

        // stores all TS Model classes for each schema property
        fs.writeFileSync(this.TSModelsFilePath, util.inspect(TSModels), 'utf-8');
        console.log("SUCCESS !!! Generated TS Models from the given swagger file :)");
        return TSModels;
    }

    private isValidVersion(semver: string): boolean {
        if (!semver) return false;
        const semverSplits = semver.split('.');
        return semverSplits[0] === '3' && semverSplits[1] === '0' && parseInt(semverSplits[2]) >= 0;
    }
}
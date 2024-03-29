import * as fs from 'fs';
import * as util from 'util';
import swaggerJson from "../assets/temelioSwagger.json";
import { SwaggerSchemaResolver } from "../util/swagger-schema-resolver";
import { Console } from 'console';


/**
 * Converts any swagger schema into typesafe TypeScript local object models
 * Supported Swagger versions - 3.0.x : stable, 2.x: in dev
 * Limitations: On [allOf, not] types - <TS does not have equivalent types>
 * @generates: TS Model class for each schema property and stores all TS Models in a text file <TSModel.txt>
 * @return: A map of TypeScript Models 
*/

export class SwaggerModel2TSModelGenerator {
    private readonly swaggerVersion = this.getSwaggerSemver(swaggerJson);
    // input JSON should never be distored by the script
    private readonly swaggerModels = this.getSwaggerModels(swaggerJson, this.swaggerVersion);
    private readonly TSModelsFilePath = "/Users/I511589/Desktop/Projects/Temelio Application/src/main/com/temelio/assets/TSModels.txt";
    private readonly TSModelDirPath = "/Users/I511589/Desktop/Projects/Temelio Application/src/main/com/temelio/model/";

    constructor(
        private readonly swaggerSchemaResolver: SwaggerSchemaResolver,
    ) { }

    public async generateTSModels() {
        try {
            if (!this.isValidVersion(this.swaggerVersion)) {
                console.error("ABORTING !!! Please provide a swagger file having version 2.x or 3.0.x");
                return;
            }

            if (!this.swaggerModels) {
                console.log("No swagger model found...");
                return;
            }

            const modelNames = Object.keys(this.swaggerModels);
            let TSModels: Map<string, string> = new Map();

            for (const modelName of modelNames) {
                if (modelName === "Function0") {
                    console.log("aaa")
                }
                const modelSchema = this.swaggerModels[modelName as keyof typeof this.swaggerModels];
                const modelProperties = modelSchema.properties;
                let TSModel = `export interface ${modelName} {`;
                let additionalModels = '';

                if (!modelProperties) {
                    continue;
                }
                else {
                    const propertyNames = Object.keys(modelProperties);
                    propertyNames.forEach((property, i) => {
                        const propertySchema = modelProperties[property as keyof typeof modelProperties];
                        const { propertyType, additionalTSTypes } = this.swaggerSchemaResolver.resolve(propertySchema, property, additionalModels, TSModels);
                        TSModel += (i < propertyNames.length - 1 ? `  ${property}: ${propertyType},` : `  ${property}: ${propertyType} `);
                        additionalModels = additionalTSTypes;
                    })
                }

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
        }
        catch (e) {
            console.error("Error generating TypeScript models from given swagger file. More details : " + e)
        }
    }

    private getSwaggerSemver(swaggerJson: any): string {
        return swaggerJson.openapi ? swaggerJson.openapi : swaggerJson.swagger;
    }

    private getSwaggerModels(swaggerJson: any, swaggerSemver: string): any {
        switch (swaggerSemver) {
            case "2.0":
                return swaggerJson.definitions;
            default:
                return swaggerJson.components.schemas
        }
    }

    //Supported Swagger versions - 3.0.x : stable, 2.x: in dev
    private isValidVersion(semver: string): boolean {
        if (!semver) return false;
        const semverRegex = /[2-3]\d*[\.0-9]\d*(\.[0-99])*$/g
        return semverRegex.test(semver);
    }
}
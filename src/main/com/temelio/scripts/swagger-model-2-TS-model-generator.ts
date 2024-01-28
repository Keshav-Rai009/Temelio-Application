import * as fs from 'fs';
import * as util from 'util';
import swaggerJson from "../assets/temelioSwagger.json";
import { SwaggerSchemaResolver } from "../util/swagger-schema-resolver";


/**
 * Converts any swagger schema into typesafe Type Script local object models
 * Supported Swagger version - 3.0.2
 * Limitations: Excludes allOf, notOf, oneOf, not types
 * @return: A map of Type Script Models
*/

export class SwaggerModel2TSModelGenerator {
    // input JSON should never be distored by the script
    private readonly swaggerModels = swaggerJson.components.schemas;
    private readonly TSModelsFilePath = "/Users/I511589/Desktop/Projects/Temelio Application/src/main/com/temelio/assets/TSModels.txt";

    constructor(
        private readonly swaggerSchemaResolver: SwaggerSchemaResolver,
    ) { }

    public async generateTSModels() {
        const modelNames = Object.keys(this.swaggerModels);
        let TSModels: Map<string, string> = new Map();

        for (const modelName of modelNames) {
            const modelSchema = this.swaggerModels[modelName as keyof typeof this.swaggerModels];
            const modelProperties = modelSchema.properties;
            const propertyNames = Object.keys(modelProperties);
            let TSModel = `export interface ${modelName} {`;

            propertyNames.forEach((property, i) => {
                const propertySchema = modelProperties[property as keyof typeof modelProperties];
                const propertyType = this.swaggerSchemaResolver.resolve(propertySchema, property, TSModels);
                TSModel += (i < propertyNames.length - 1 ? `    ${property}: ${propertyType},` : `    ${property}: ${propertyType}`);
            })
            TSModel += `}`;
            TSModels.set(modelName, TSModel);
        }

        fs.writeFileSync(this.TSModelsFilePath, util.inspect(TSModels), 'utf-8');
        console.log("SUCCESS !!! Generated TS Models from the given swagger file :)");
        return TSModels;
    }
}
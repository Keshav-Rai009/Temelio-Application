"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_model_2_TS_model_generator_1 = require("./main/com/temelio/scripts/swagger-model-2-TS-model-generator");
const swagger_schema_resolver_1 = require("./main/com/temelio/util/swagger-schema-resolver");
const non_profits_uploader_1 = require("./main/com/temelio/scripts/non-profits-uploader");
const csv_parser_1 = require("./main/com/temelio/parsers/csv-parser");
const csv_util_1 = require("./main/com/temelio/util/csv-util");
const http_util_1 = require("./main/com/temelio/util/http-util");
/**
 * PROBLEM 1
 * Converts any swagger schema into typesafe TypeScript local object models
 * Supported Swagger version - 3.0.x
 * Limitations: On [allOf, not] types - <TS does not have equivalent types>
 * @generates: TS Model class e.g.< Address1.ts > for each schema property in model directory and stores all TS Models in a text file <TSModel.txt> under assets
 * @return: A map of TypeScript Models
*/
const TSModels = new swagger_model_2_TS_model_generator_1.SwaggerModel2TSModelGenerator(new swagger_schema_resolver_1.SwaggerSchemaResolver()).generateTSModels();
const nonProfitsUploader = new non_profits_uploader_1.NonProfitsUploader(new csv_parser_1.CSVParser(new csv_util_1.CSVUtil()), new http_util_1.HTTPUtil());
/**
* PROBLEM 3
* Reads and parses the Non Profits and Grand submissions CSV file and uploads data into the Temelio Server
* Authentication : Bearer token
*/
nonProfitsUploader.parseCSVAndUploadNonProfits();
//# sourceMappingURL=index.js.map
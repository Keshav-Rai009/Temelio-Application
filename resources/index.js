"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_model_2_TS_model_generator_1 = require("./main/com/temelio/scripts/swagger-model-2-TS-model-generator");
const swagger_schema_resolver_1 = require("./main/com/temelio/util/swagger-schema-resolver");
const non_profits_uploader_1 = require("./main/com/temelio/scripts/non-profits-uploader");
const csv_parser_1 = require("./main/com/temelio/parsers/csv-parser");
const csv_parser_util_1 = require("./main/com/temelio/util/csv-parser-util");
const http_util_1 = require("./main/com/temelio/util/http-util");
const TSModels = new swagger_model_2_TS_model_generator_1.SwaggerModel2TSModelGenerator(new swagger_schema_resolver_1.SwaggerSchemaResolver()).generateTSModels();
const nonProfitsUploader = new non_profits_uploader_1.NonProfitsUploader(new csv_parser_1.CSVParser(new csv_parser_util_1.CSVParserUtil()), new http_util_1.HTTPUtil());
nonProfitsUploader.parseCSVAndUploadNonProfits();
//# sourceMappingURL=index.js.map
import { SwaggerModel2TSModelGenerator } from "./main/com/temelio/scripts/swagger-model-2-TS-model-generator";
import { SwaggerSchemaResolver } from "./main/com/temelio/util/swagger-schema-resolver";
import { NonProfitsUploader } from "./main/com/temelio/scripts/non-profits-uploader";
import { CSVParser } from "./main/com/temelio/parsers/csv-parser";
import { CSVUtil } from "./main/com/temelio/util/csv-util";
import { HTTPUtil } from "./main/com/temelio/util/http-util";

/**
 * Converts any swagger schema into typesafe Type Script local object models
 * Supported Swagger version - 3.0.2
 * Limitations: Excludes allOf, notOf, oneOf, not types
 * @return: A map of Type Script Models and stores in a text file
*/
const TSModels = new SwaggerModel2TSModelGenerator(new SwaggerSchemaResolver()).generateTSModels();

const nonProfitsUploader = new NonProfitsUploader(new CSVParser(new CSVUtil()), new HTTPUtil());
/**
* Reads and parses the Non Profits and Grand submissions CSV file and uploads data into the Temelio Server
*/
nonProfitsUploader.parseCSVAndUploadNonProfits();
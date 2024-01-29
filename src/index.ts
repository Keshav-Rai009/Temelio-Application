import { SwaggerModel2TSModelGenerator } from "./main/com/temelio/scripts/swagger-model-2-TS-model-generator";
import { SwaggerSchemaResolver } from "./main/com/temelio/util/swagger-schema-resolver";
import { NonProfitsUploader } from "./main/com/temelio/scripts/non-profits-uploader";
import { CSVParser } from "./main/com/temelio/parsers/csv-parser";
import { CSVUtil } from "./main/com/temelio/util/csv-util";
import { HTTPUtil } from "./main/com/temelio/util/http-util";

/**
 * Converts any swagger schema into typesafe TypeScript local object models
 * Supported Swagger version - 3.0.x
 * Limitations: On [allOf, not] types - <TS does not have equivalent types>
 * @generates: TS Model class for each schema property and stores all TS Models in a text file <TSModel.txt>
 * @return: A map of TypeScript Models 
*/
const TSModels = new SwaggerModel2TSModelGenerator(new SwaggerSchemaResolver()).generateTSModels();

const nonProfitsUploader = new NonProfitsUploader(new CSVParser(new CSVUtil()), new HTTPUtil());
/**
* Reads and parses the Non Profits and Grand submissions CSV file and uploads data into the Temelio Server
*/
//nonProfitsUploader.parseCSVAndUploadNonProfits();
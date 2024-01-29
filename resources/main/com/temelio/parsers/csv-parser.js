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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSVParser = void 0;
const csv_parse_1 = require("csv-parse");
const promises_1 = require("stream/promises");
class CSVParser {
    constructor(csvUtil) {
        this.csvUtil = csvUtil;
    }
    parseCSV(csvFilePath, fileCols) {
        return __awaiter(this, void 0, void 0, function* () {
            let allColsData = [];
            const csvFileContent = this.csvUtil.readCSV(csvFilePath);
            const parser = (0, csv_parse_1.parse)(csvFileContent, {
                delimiter: ",",
                columns: fileCols,
                fromLine: 2,
                relax_column_count: true,
                cast: (columnValue) => columnValue
            }, (error, data) => {
                if (error) {
                    console.error("Error reading CSV File" + csvFilePath + "More details:'" + error.message);
                    return;
                }
                allColsData = data;
                return allColsData;
            });
            yield (0, promises_1.finished)(parser);
            return allColsData;
        });
    }
}
exports.CSVParser = CSVParser;
//# sourceMappingURL=csv-parser.js.map
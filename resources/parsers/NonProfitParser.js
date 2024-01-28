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
const path = __importStar(require("path"));
const csv_parse_1 = require("csv-parse");
function parseNonProfiData() {
    const csvFilePath = path.resolve(__dirname, '../assets/nonprofit_data.csv');
    const headers = ['Legal Name', 'EIN', 'mission', 'HQ Address 1', "HQ City", "HQ State", "HQ Zip Code"];
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    console.log(fileContent);
    (0, csv_parse_1.parse)(fileContent, {
        delimiter: ',',
        columns: headers,
        fromLine: 2,
        cast: (columnValue, context) => {
            if (context.column === 'geoNameId') {
                return parseInt(columnValue, 10);
            }
            return columnValue;
        }
    }, (error, result) => {
        if (error) {
            console.error(error);
        }
        console.log("Result", result);
    });
}
;
parseNonProfiData();
//# sourceMappingURL=NonProfitParser.js.map
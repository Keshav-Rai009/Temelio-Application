import * as fs from "fs";
import * as path from "path";


export class CSVUtil {

    readCSV(csvFilePath: string) {
        const csvFile = path.resolve(__dirname, csvFilePath);
        const csvFileContent = fs.readFileSync(csvFile, {
            encoding: "utf-8",
        });
        return csvFileContent;
    }
}



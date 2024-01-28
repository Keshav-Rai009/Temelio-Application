import { parse } from "csv-parse";
import { CSVUtil } from "../util/csv-util";
import { finished } from "stream/promises";


export class CSVParser {
  constructor(
    private readonly csvUtil: CSVUtil
  ) { }

  async parseCSV(csvFilePath: string, fileCols: string[]) {
    let allColsData: any[] = []
    const csvFileContent = this.csvUtil.readCSV(csvFilePath);
    const parser = parse(
      csvFileContent,
      {
        delimiter: ",",
        columns: fileCols,
        fromLine: 2,
        relax_column_count: true,
        cast: (columnValue) =>
          columnValue
      },
      (error, data: any[]) => {
        if (error) {
          console.error("Error reading CSV File" + csvFilePath + "More details:'" + error.message);
          return;
        }
        allColsData = data;
        return allColsData;
      });
    await finished(parser)
    return allColsData;
  }
}


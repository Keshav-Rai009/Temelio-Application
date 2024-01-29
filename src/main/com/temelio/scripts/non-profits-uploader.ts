import * as uuid from "uuid";
import { NonProfit } from "../model/NonProfit";
import { Address } from "../model/Address";
import { Duration } from "../model/Duration"
import { GrandSubmission } from "../model/GrandSubmission";
import { CSVParser } from "../parsers/csv-parser";
import { HTTPUtil } from "../util/http-util";

export class NonProfitsUploader {
  private readonly ENDPOINT_BASE_URL = "http://localhost:8080/nonprofits";
  // token should never be kept in codebase - should be in some key store DB or secrets vault.
  private readonly BEARER_TOKEN = "eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vYXN5bmMtb25ib2FyZGluZy1rci03N2kyZW5hbC5hdXRoZW50aWNhdGlvbi5zYXAuaGFuYS5vbmRlbWFuZC5jb20vdG9rZW5fa2V5cyIsImtpZCI6ImRlZmF1bHQtand0LWtleS0tODMzNjczNTMyIiwidHlwIjoiSldUIn0";
  private readonly nonProfitsCSVFilePath = "../assets/nonprofit_data.csv";
  private readonly grandSubmissionsCSVFilePath = "../assets/nonprofit_submission_data.csv";

  // csv header cols
  private readonly grandSubmissionsCols = [
    "Nonprofit Legal Name",
    "Grant Submission Name",
    "Stage",
    "Foundation Owner",
    "Requested Amount",
    "Awarded Amount",
    "Grant Type",
    "Tags",
    "Duration Start",
    "Duration End",
    "Additional File Folder Path",
    "Grant Submission Id",
  ];

  private readonly nonProfitCols = [
    "Legal Name",
    "Foundation POC Email",
    "EIN",
    "DBA",
    "Phone Number",
    "Mission",
    "Vision",
    "Has Fiscal Sponsor",
    "Fiscal Sponsor Name",
    "Fiscal Sponsor EIN",
    "Fiscal Sponsor Email",
    "Fiscal Sponsor Primary Contact Name",
    "Fiscal Sponsor Primary Contact Email",
    "Fiscal Sponsor Address 1",
    "Fiscal Sponsor Address 2",
    "Fiscal Sponsor City",
    "Fiscal Sponsor State",
    "Fiscal Sponsor Zipcode",
    "Fiscal Sponsor Country",
    "Org Email",
    "Description",
    "Primary Contact Email",
    "Website",
    "HQ Address 1",
    "HQ Address 2",
    "HQ City",
    "HQ State",
    "HQ Zip Code",
    "HQ Country",
    "Mailing Address 1",
    "Mailing Address 2",
    "Mailing Address City",
    "Mailing Address State",
    "Mailing Address Zip Code",
    "Mailing Address Country",
    "Facebook",
    "Twitter",
    "Instagram",
    "LinkedIn",
    "Guidestar Profile",
    "Legal Status",
    "Founding Date",
    "partner-type",
    "Nonprofit Id",
  ];
  constructor(
    private readonly csvParser: CSVParser,
    private readonly httpUtil: HTTPUtil
  ) { }

  /**
  * Reads and parses the Non Profits and Grand submissions CSV file and uploads data into the Temelio Service
  */

  public async parseCSVAndUploadNonProfits() {
    const nonProfitsData = await this.csvParser.parseCSV(this.nonProfitsCSVFilePath, this.nonProfitCols);
    const GrandSubmissionsData = await this.csvParser.parseCSV(this.grandSubmissionsCSVFilePath, this.grandSubmissionsCols);
    const grandSubmissions = new Array();

    GrandSubmissionsData.forEach((submission: { [x: string]: any; }) => {
      const duration: Duration = { grandStart: submission["Duration Start"], grandEnd: submission["Duration End"] }
      const GrandSubmission: GrandSubmission = { id: uuid.v4(), nonProfitName: submission["Nonprofit Legal Name"], nonProfitId: "", grandName: submission["Grant Submission Name"], grandType: submission["Grant Type"], requestedAmount: submission["Requested Amount"], awardedAmount: submission["Awarded Amount"], tags: [submission["Tags"]], duration: duration };
      // send data to Temelio Service
      grandSubmissions.push(GrandSubmission);
    })

    for (const npData of nonProfitsData) {
      const nonProfitName = npData["Legal Name"];
      const address: Address = {
        street: npData["HQ Address 1"],
        city: npData["HQ City"],
        state: npData["HQ State"],
        zip: npData["HQ Zip Code"],
      };
      const nonProfit: NonProfit = {
        id: "",
        legalName: nonProfitName,
        EIN: npData["EIN"],
        mission: npData["Mission"],
        address: address,
        grandSubmissions: [],
      };
      // send non profits data to Temelio Service
      try {
        await this.addNonProfit(nonProfit);
      } catch (e) {
        console.log("Non profits data upload failed. More details:" + e);
        return;
      }
    }

    let nonProfitsInServer;
    try {
      nonProfitsInServer = await this.getNonProfits();
    } catch (e) {
      console.log("Error fetching non profits data. More details:" + e);
      return;
    }

    for (const submission of grandSubmissions) {
      // foreign key in Grand submissions CSV - Non Profit name
      const nonProfitForSubmission = nonProfitsInServer.find(
        (np: { legalName: string }) =>
          np.legalName === submission.nonProfitName
      );

      if (!nonProfitForSubmission) {
        console.log(
          "No non profit found for submission:" + submission.legalName
        );
      }

      // send grand submissions data to Temelio Service
      try {
        await this.addGrandSubmission(submission, nonProfitForSubmission.id);
      } catch (e) {
        console.log(
          "Grand Submissions data upload failed. More details:" + e
        );
      }
    }

    console.log("SUCCESS !!! Uploaded all non profits data into the temelio server :)");

  }

  private async addNonProfit(nonProfit: any): Promise<any> {
    return await this.httpUtil.executeWithPayload(this.ENDPOINT_BASE_URL, "POST", nonProfit, this.BEARER_TOKEN);
  }

  private async getNonProfits(): Promise<any> {
    return await this.httpUtil.execute(this.ENDPOINT_BASE_URL, "GET", this.BEARER_TOKEN);
  }

  private async addGrandSubmission(grandSubmission: any, nonProfitId: string): Promise<any> {
    return await this.httpUtil.executeWithPayload(this.ENDPOINT_BASE_URL + "/" + nonProfitId + "/submissions", "POST", grandSubmission, this.BEARER_TOKEN);
  }

}


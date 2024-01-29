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
exports.NonProfitsUploader = void 0;
const uuid = __importStar(require("uuid"));
class NonProfitsUploader {
    constructor(csvParser, httpUtil) {
        this.csvParser = csvParser;
        this.httpUtil = httpUtil;
        this.ENDPOINT_BASE_URL = "http://localhost:8080/nonprofits";
        // token should never be kept in codebase - should be in some key store DB or secrets vault.
        this.BEARER_TOKEN = "eyJhbGciOiJSUzI1NiIsImprdSI6Imh0dHBzOi8vYXN5bmMtb25ib2FyZGluZy1rci03N2kyZW5hbC5hdXRoZW50aWNhdGlvbi5zYXAuaGFuYS5vbmRlbWFuZC5jb20vdG9rZW5fa2V5cyIsImtpZCI6ImRlZmF1bHQtand0LWtleS0tODMzNjczNTMyIiwidHlwIjoiSldUIn0";
        this.nonProfitsCSVFilePath = "../assets/nonprofit_data.csv";
        this.grandSubmissionsCSVFilePath = "../assets/nonprofit_submission_data.csv";
        // csv header cols
        this.grandSubmissionsCols = [
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
        this.nonProfitCols = [
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
    }
    /**
    * Reads and parses the Non Profits and Grand submissions CSV file and uploads data into the Temelio Service
    */
    parseCSVAndUploadNonProfits() {
        return __awaiter(this, void 0, void 0, function* () {
            const nonProfitsData = yield this.csvParser.parseCSV(this.nonProfitsCSVFilePath, this.nonProfitCols);
            const GrandSubmissionsData = yield this.csvParser.parseCSV(this.grandSubmissionsCSVFilePath, this.grandSubmissionsCols);
            const grandSubmissions = new Array();
            GrandSubmissionsData.forEach((submission) => {
                const duration = { grandStart: submission["Duration Start"], grandEnd: submission["Duration End"] };
                const GrandSubmission = { id: uuid.v4(), nonProfitName: submission["Nonprofit Legal Name"], nonProfitId: "", grandName: submission["Grant Submission Name"], grandType: submission["Grant Type"], requestedAmount: submission["Requested Amount"], awardedAmount: submission["Awarded Amount"], tags: [submission["Tags"]], duration: duration };
                // send data to Temelio Service
                grandSubmissions.push(GrandSubmission);
            });
            for (const npData of nonProfitsData) {
                const nonProfitName = npData["Legal Name"];
                const address = {
                    street: npData["HQ Address 1"],
                    city: npData["HQ City"],
                    state: npData["HQ State"],
                    zip: npData["HQ Zip Code"],
                };
                const nonProfit = {
                    id: "",
                    legalName: nonProfitName,
                    EIN: npData["EIN"],
                    mission: npData["Mission"],
                    address: address,
                    grandSubmissions: [],
                };
                // send non profits data to Temelio Service
                try {
                    yield this.addNonProfit(nonProfit);
                }
                catch (e) {
                    console.log("Non profits data upload failed. More details:" + e);
                    return;
                }
            }
            let nonProfitsInServer;
            try {
                nonProfitsInServer = yield this.getNonProfits();
            }
            catch (e) {
                console.log("Error fetching non profits data. More details:" + e);
                return;
            }
            for (const submission of grandSubmissions) {
                // foreign key in Grand submissions CSV - Non Profit name
                const nonProfitForSubmission = nonProfitsInServer.find((np) => np.legalName === submission.nonProfitName);
                if (!nonProfitForSubmission) {
                    console.log("No non profit found for submission:" + submission.legalName);
                }
                // send grand submissions data to Temelio Service
                try {
                    yield this.addGrandSubmission(submission, nonProfitForSubmission.id);
                }
                catch (e) {
                    console.log("Grand Submissions data upload failed. More details:" + e);
                }
            }
            console.log("SUCCESS !!! Uploaded all non profits data into the temelio server :)");
        });
    }
    addNonProfit(nonProfit) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.httpUtil.executeWithPayload(this.ENDPOINT_BASE_URL, "POST", nonProfit, this.BEARER_TOKEN);
        });
    }
    getNonProfits() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.httpUtil.execute(this.ENDPOINT_BASE_URL, "GET", this.BEARER_TOKEN);
        });
    }
    addGrandSubmission(grandSubmission, nonProfitId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.httpUtil.executeWithPayload(this.ENDPOINT_BASE_URL + "/" + nonProfitId + "/submissions", "POST", grandSubmission, this.BEARER_TOKEN);
        });
    }
}
exports.NonProfitsUploader = NonProfitsUploader;
//# sourceMappingURL=non-profits-uploader.js.map
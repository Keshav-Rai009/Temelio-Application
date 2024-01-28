import { Address } from "./Address"
import { GrandSubmission } from "./GrandSubmission";
export interface NonProfit {
    id: string
    legalName: string,
    EIN: string,
    mission: string,
    address: Address,
    grandSubmissions: GrandSubmission[]
}
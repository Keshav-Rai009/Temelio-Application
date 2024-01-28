import { Duration } from "./Duration"
export interface GrandSubmission {
    id: string,
    nonProfitName: string,
    nonProfitId: string,
    grandName: string,
    requestedAmount: string,
    awardedAmount: string,
    grandType: GRANDTYPE,
    tags: string[],
    duration: Duration
}

export enum GRANDTYPE {
    OPERATING_GRANT,
    PROJECT_GRANT,
    OTHER
}
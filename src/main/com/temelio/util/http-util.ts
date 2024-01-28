export class HTTPUtil {

    async execute(endpoint: string, methodType: string, bearerToken: string) {
        try {
            const response = await fetch(endpoint, {
                method: methodType,
                headers: {
                    "Content-Type": "application/json",
                    Authorization:
                        "Bearer " + bearerToken
                },
            });
            const data = await response.json();
            return data;
        } catch (e) {
            console.log("Error executing endpoint: " + endpoint + " type: " + methodType + ". More details:" + e);
            throw e;
        }
    }

    async executeWithPayload(endpoint: string, methodType: string, payload: any, bearerToken: string) {
        try {
            const response = await fetch(endpoint, {
                method: methodType,
                body: JSON.stringify(payload),
                headers: {
                    "Content-Type": "application/json",
                    Authorization:
                        "Bearer " + bearerToken
                },
            });
            const data = await response.json();
            return data;
        } catch (e) {
            console.log("Error executing endpoint: " + endpoint + " type: " + methodType + ". More details:" + e);
            throw e;
        }
    }
}



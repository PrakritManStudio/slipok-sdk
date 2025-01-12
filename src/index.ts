import type {
  QuotaResponseSuccess,
  QuotaResponseError,
  SlipResponseSuccess,
  SlipResponseError,
} from "./types";

const BASE_API_URL = "https://api.slipok.com/api/line/apikey/";

export default class SlipOk {
  private apiKey: string;
  private branchId: string;

  constructor(apiKey: string, branchId: string) {
    if (!apiKey || typeof apiKey !== "string") {
      throw Error("SlipOk: API key is invalid");
    }
    if (!branchId || typeof branchId !== "string" || !/^\d+$/.test(branchId)) {
      throw Error("SlipOk: Branch ID is invalid");
    }

    this.apiKey = apiKey;
    this.branchId = branchId;
  }

  async checkQuota(): Promise<QuotaResponseSuccess | QuotaResponseError> {
    const url = `${BASE_API_URL}${this.branchId}/quota`;
    const headers = {
      "x-authorization": this.apiKey,
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch(url, { method: "GET", headers }).then(
        async (res) => await res.json()
      );
      if (response?.success && response?.data && !response?.code) {
        const { data } = response;
        return { success: true, data } as QuotaResponseSuccess;
      }
      const { code, message } = response;
      return { success: false, code, message } as QuotaResponseError;
    } catch (error) {
      console.error("SlipOk: Error fetching quota:", error);
      throw error;
    }
  }

  async checkSlip(data: {
    data?: string;
    url?: string;
    files?: File;
    amount?: number;
    log: boolean;
  }): Promise<SlipResponseSuccess | SlipResponseError> {
    const url = `${BASE_API_URL}${this.branchId}`;
    const headers = {
      "x-authorization": this.apiKey,
      "Content-Type": "multipart/form-data",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      }).then(async (res) => await res.json());
      if (response?.success && response?.data && !response?.code) {
        const { data } = response;
        return { success: true, data } as SlipResponseSuccess;
      }
      const { code, message } = response;
      return { success: false, code, message } as SlipResponseError;
    } catch (error) {
      console.error("SlipOk: Error fetching slip:", error);
      throw error;
    }
  }
}
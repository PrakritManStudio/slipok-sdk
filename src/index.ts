import type {
  QuotaResponseSuccess,
  QuotaResponseError,
  SlipResponseSuccess,
  SlipResponseError,
} from "./types";

// Constants
const BASE_API_URL = "https://api.slipok.com/api/line/apikey";
const DEFAULT_TIMEOUT = 10000;
const DEFAULT_RETRIES = 2;

/**
 * รหัสข้อผิดพลาดของ SDK
 * @enum {string}
 */
export enum SdkErrorCode {
  /** เมื่อ API key หรือ Branch ID ไม่ถูกต้อง */
  INVALID_CLIENT = "INVALID_CLIENT",
  /** เมื่อเกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย */
  NETWORK_ERROR = "NETWORK_ERROR",
}

/**
 * คลาสสำหรับจัดการข้อผิดพลาดของ SDK
 * @extends Error
 */
export class SdkError extends Error {
  /**
   * สร้างอินสแตนซ์ของ SdkError
   * @param {string} message - ข้อความแสดงข้อผิดพลาด
   * @param {SdkErrorCode} code - รหัสข้อผิดพลาด
   * @param {number} [statusCode] - รหัสสถานะ HTTP (ถ้ามี)
   * @param {unknown} [response] - ข้อมูลการตอบกลับ (ถ้ามี)
   */
  constructor(
    message: string,
    public code: SdkErrorCode,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "SlipOkSdkError";
  }
}

/**
 * การตั้งค่าสำหรับ SDK
 * @interface
 */
interface SdkConfig {
  /** URL ของ API */
  baseUrl?: string;
  /** เวลาหมดเวลาในการเรียก API (มิลลิวินาที) */
  timeout?: number;
  /** จำนวนครั้งในการลองใหม่เมื่อเกิดข้อผิดพลาด */
  retries?: number;
  /** ตัวจัดการ log */
  logger?: Logger;
}

/**
 * อินเตอร์เฟซสำหรับการจัดการ log
 * @interface
 */
interface Logger {
  /** บันทึก log ระดับ debug */
  debug(message: string, ...args: any[]): void;
  /** บันทึก log ระดับ info */
  info(message: string, ...args: any[]): void;
  /** บันทึก log ระดับ error */
  error(message: string, ...args: any[]): void;
}

/**
 * คลาส SlipOk สำหรับตรวจสอบสลิปการโอนเงินและโควต้าการใช้งาน
 */
export default class SlipOk {
  private readonly apiKey: string;
  private readonly branchId: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retries: number;
  private readonly logger?: Logger;

  /**
   * สร้างอินสแตนซ์ของ SlipOk
   * @param {string} apiKey - API key สำหรับเข้าถึง SlipOk API
   * @param {string} branchId - รหัสสาขาที่ต้องการตรวจสอบ
   * @param {SdkConfig} [config] - การตั้งค่าเพิ่มเติมสำหรับ SDK
   * @throws {SdkError} เมื่อ API key หรือ Branch ID ไม่ถูกต้อง
   */
  constructor(apiKey: string, branchId: string, config?: SdkConfig) {
    if (!apiKey?.trim()) {
      throw new SdkError("API key is invalid", SdkErrorCode.INVALID_CLIENT);
    }
    if (!branchId?.trim() || !/^\d+$/.test(branchId)) {
      throw new SdkError("Branch ID is invalid", SdkErrorCode.INVALID_CLIENT);
    }

    this.apiKey = apiKey;
    this.branchId = branchId;
    this.baseUrl = config?.baseUrl || BASE_API_URL;
    this.timeout = config?.timeout || DEFAULT_TIMEOUT;
    this.retries = config?.retries || DEFAULT_RETRIES;
    this.logger = config?.logger;
  }

  /**
   * เรียก API พร้อมระบบลองใหม่อัตโนมัติ
   * @param {string} url - URL ที่ต้องการเรียก
   * @param {RequestInit} options - ตัวเลือกสำหรับ fetch
   * @param {number} [attempt=1] - ครั้งที่กำลังพยายาม
   * @returns {Promise<Response>} ผลการเรียก API
   * @throws {SdkError} เมื่อเกิดข้อผิดพลาดในการเชื่อมต่อ
   * @private
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    attempt = 1
  ): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      this.logger?.error(
        `Request failed (attempt ${attempt}/${this.retries}):`,
        error
      );

      if (attempt >= this.retries) {
        throw new SdkError(
          "Network request failed",
          SdkErrorCode.NETWORK_ERROR,
          undefined,
          error
        );
      }

      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
      return this.fetchWithRetry(url, options, attempt + 1);
    }
  }

  /**
   * ตรวจสอบโควต้าการใช้งานที่เหลือ
   * @returns {Promise<QuotaResponseSuccess | QuotaResponseError>} ข้อมูลโควต้าที่เหลือหรือข้อผิดพลาด
   * @throws {Error} เมื่อเกิดข้อผิดพลาดในการเรียก API
   */
  async checkQuota(): Promise<QuotaResponseSuccess | QuotaResponseError> {
    this.logger?.debug("Checking quota");
    try {
      const url = `${this.baseUrl}/${this.branchId}/quota`;
      const response = await this.fetchWithRetry(url, {
        method: "GET",
        headers: {
          "x-authorization": this.apiKey,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data?.success && data?.data && !data?.code) {
        return { success: true, data } as QuotaResponseSuccess;
      }
      const { code, message } = data;
      return { success: false, code, message } as QuotaResponseError;
    } catch (error) {
      if (error instanceof SdkError) {
        throw error;
      }
      throw new SdkError(
        "Network request failed",
        SdkErrorCode.NETWORK_ERROR,
        undefined,
        error
      );
    }
  }

  /**
   * ตรวจสอบสลิปการโอนเงิน
   * @param {Object} data - ข้อมูลสลิป
   * @param {string} [data.data] - ข้อมูล QR Code ในสลิป
   * @param {string} [data.url] - URL ของรูปภาพสลิป
   * @param {File} [data.files] - ไฟล์รูปภาพสลิป
   * @param {number} [data.amount] - จำนวนเงินที่ต้องการตรวจสอบ
   * @param {boolean} data.log - เปิด/ปิดการบันทึก log
   * @returns {Promise<SlipResponseSuccess | SlipResponseError>} ผลการตรวจสอบสลิปหรือข้อผิดพลาด
   * @throws {Error} เมื่อเกิดข้อผิดพลาดในการเรียก API
   */
  async checkSlip(dataPayload: {
    data?: string;
    url?: string;
    files?: File;
    amount?: number;
    log: boolean;
  }): Promise<SlipResponseSuccess | SlipResponseError> {
    try {
      const formData = new FormData();
      Object.entries(dataPayload).forEach(([key, value]) => {
        if (value !== undefined) {
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const url = `${this.baseUrl}/${this.branchId}`;
      const response = await this.fetchWithRetry(url, {
        method: "POST",
        headers: {
          "x-authorization": this.apiKey,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data?.success && data?.data && !data?.code) {
        return { success: true, data } as SlipResponseSuccess;
      }
      const { code, message } = data;
      return { success: false, code, message } as SlipResponseError;
    } catch (error) {
      if (error instanceof SdkError) {
        throw error;
      }
      throw new SdkError(
        "Network request failed",
        SdkErrorCode.NETWORK_ERROR,
        undefined,
        error
      );
    }
  }
}
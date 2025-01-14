# 🚀 SlipOk SDK

[![NPM version](https://img.shields.io/npm/v/@prakrit_m/slipok-sdk.svg?style=flat)](https://www.npmjs.org/package/@prakrit_m/slipok-sdk)
[![NPM Downloads](https://img.shields.io/npm/dm/%40prakrit_m/slipok-sdk)](https://www.npmjs.org/package/@prakrit_m/slipok-sdk)
![NPM Last Update](https://img.shields.io/npm/last-update/%40prakrit_m%2Fslipok-sdk)
![Node Version](https://img.shields.io/node/v/@prakrit_m/slipok-sdk)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

SDK สำหรับตรวจสอบสลิปการโอนเงินผ่าน SlipOk API อย่างง่ายดาย พร้อมรองรับ TypeScript แบบสมบูรณ์

## 📋 สารบัญ

- [คุณสมบัติ](#-คุณสมบัติ)
- [การติดตั้ง](#-การติดตั้ง)
- [การใช้งาน](#-การใช้งาน)
- [API Reference](#-api-reference)
- [Error Handling](#-error-handling)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ คุณสมบัติ

- 🔄 ตรวจสอบสลิปและโควต้าคงเหลือ
- 📝 รองรับ TypeScript แบบสมบูรณ์
- 🖼️ รองรับการตรวจสอบทั้ง QR Code และรูปภาพสลิป
- 🔒 ระบบจัดการ Error ที่ครอบคลุม
- 🚀 Retry mechanism อัตโนมัติ
- ⏱️ Timeout handling
- 📊 Logging system

## 📦 การติดตั้ง

```bash
# npm
npm install @prakrit_m/slipok-sdk

# yarn
yarn add @prakrit_m/slipok-sdk

# pnpm
pnpm add @prakrit_m/slipok-sdk
```

## 🚀 การใช้งาน

### การเริ่มต้นใช้งาน

```typescript
import SlipOk from "@prakrit_m/slipok-sdk";

// สร้าง instance แบบพื้นฐาน
const slipOk = new SlipOk("YOUR_API_KEY", "YOUR_BRANCH_ID");

// หรือกำหนด config เพิ่มเติม
const slipOk = new SlipOk("YOUR_API_KEY", "YOUR_BRANCH_ID", {
  timeout: 5000,
  retries: 2,
  logger: console,
});
```

### ตรวจสอบโควต้า

```typescript
try {
  const response = await slipOk.checkQuota();
  if (response.success) {
    console.log("ข้อมูลโควต้า:", response.data);
  } else {
    console.error("เกิดข้อผิดพลาด:", response.message);
  }
} catch (error) {
  console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ:", error);
}
```

### ตรวจสอบสลิป

```typescript
try {
  // ตรวจสอบด้วย QR Code
  const response = await slipOk.checkSlip({
    data: "QR_CODE_DATA",
    log: true,
  });

  // หรือตรวจสอบด้วย URL รูปภาพ
  const response = await slipOk.checkSlip({
    url: "IMAGE_URL",
    amount: 1000, // ระบุจำนวนเงินที่ต้องการตรวจสอบ (optional)
    log: true,
  });

  // หรือตรวจสอบด้วยไฟล์รูปภาพ
  const response = await slipOk.checkSlip({
    files: imageFile,
    log: true,
  });

  if (response.success) {
    console.log("ข้อมูลการโอน:", {
      จำนวนเงิน: response.data.amount,
      วันที่โอน: response.data.date,
      เวลาที่โอน: response.data.time,
      ธนาคารผู้โอน: response.data.bank,
      ชื่อผู้โอน: response.data.sender,
    });
  } else {
    console.error("เกิดข้อผิดพลาด:", response.message);
  }
} catch (error) {
  console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ:", error);
}
```

## 📚 API Reference

### SlipOk

#### Constructor Options

```typescript
interface SdkConfig {
  baseUrl?: string; // URL ของ API (default: https://api.slipok.com/api/line/apikey)
  timeout?: number; // ระยะเวลา timeout (default: 10000ms)
  retries?: number; // จำนวนครั้งที่จะ retry (default: 2)
  logger?: Logger; // ระบบ logging
}
```

#### Methods

| Method            | Description          | Parameters                                                                     | Return Type                                           |
| ----------------- | -------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `checkQuota()`    | ตรวจสอบโควต้าคงเหลือ | -                                                                              | `Promise<QuotaResponseSuccess \| QuotaResponseError>` |
| `checkSlip(data)` | ตรวจสอบสลิป          | `{ data?: string, url?: string, files?: File, amount?: number, log: boolean }` | `Promise<SlipResponseSuccess \| SlipResponseError>`   |

## 🚨 Error Handling

### รหัสข้อผิดพลาด (Error Codes)

| รหัส | คำอธิบาย                                                                                                           |
| ---- | ------------------------------------------------------------------------------------------------------------------ |
| 1000 | กรุณาใส่ข้อมูล QR Code ให้ครบใน field data, files หรือ url                                                         |
| 1001 | ไม่พบข้อมูลสาขา กรุณาตรวจสอบไอดีสาขา                                                                               |
| 1002 | Authorization Header ไม่ถูกต้อง                                                                                    |
| 1003 | Package ของคุณหมดอายุแล้ว                                                                                          |
| 1004 | Package ของคุณใช้เกินโควต้ามาแล้ว 400 บาท กรุณาต่อสมาชิกแพ็กเกจ                                                    |
| 1005 | ไฟล์ไม่ใช่ไฟล์ภาพ กรุณาอัพโหลดไฟล์เฉพาะนามสกุล .jpg .jpeg .png .jfif หรือ .webp                                    |
| 1006 | รูปภาพไม่ถูกต้อง                                                                                                   |
| 1007 | รูปภาพไม่มี QR Code                                                                                                |
| 1008 | QR ดังกล่าวไม่ใช่ QR สำหรับการตรวจสอบการชำระเงิน                                                                   |
| 1009 | ขออภัยในความไม่สะดวก ขณะนี้ข้อมูลธนาคารเกิดขัดข้องชั่วคราว โปรดตรวจใหม่อีกครั้งใน 15 นาทีถัดไป (ไม่เสียโควต้าสลิป) |
| 1010 | เนื่องจากเป็นสลิปจากธนาคาร {ชื่อธนาคาร} กรุณารอการตรวจสอบสลิปหลังการโอนประมาณ {จำนวนนาที} นาที                     |
| 1011 | QR Code หมดอายุ หรือ ไม่มีรายการอยู่จริง                                                                           |
| 1012 | สลิปซ้ำ สลิปนี้เคยส่งเข้ามาในระบบเมื่อ {timestamp}                                                                 |
| 1013 | ยอดที่ส่งมาไม่ตรงกับยอดสลิป                                                                                        |
| 1014 | บัญชีผู้รับไม่ตรงกับบัญชีหลักของร้าน                                                                               |

### SDK Error Codes

| รหัส           | คำอธิบาย                                 | การแก้ไข                        |
| -------------- | ---------------------------------------- | ------------------------------- |
| INVALID_CLIENT | ข้อมูล API Key หรือ Branch ID ไม่ถูกต้อง | ตรวจสอบข้อมูลที่ใช้             |
| NETWORK_ERROR  | ปัญหาการเชื่อมต่อเครือข่าย               | ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต |

## 🤝 การมีส่วนร่วมในการพัฒนา

1. Fork โปรเจกต์
2. สร้าง branch สำหรับฟีเจอร์ของคุณ (`git checkout -b feature/amazing-feature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'เพิ่มฟีเจอร์ใหม่'`)
4. Push ไปยัง branch (`git push origin feature/amazing-feature`)
5. เปิด Pull Request

สำหรับการรายงานปัญหาหรือข้อเสนอแนะ สามารถเปิด [Issue](https://github.com/PrakritManStudio/slipok-sdk/issues) ได้

## 📄 License

> This is a third-party SDK, not an official SlipOk SDK.  
> SDK นี้พัฒนาโดยบุคคลภายนอก ไม่ใช่ผลิตภัณฑ์อย่างเป็นทางการจาก SlipOk

Licensed under [ISC](LICENSE)

## 📚 เอกสารเพิ่มเติม

สำหรับข้อมูลเพิ่มเติมเกี่ยวกับ API สามารถอ่านได้ที่ [SlipOk API Documentation](https://slipok.com/api-documentation/)

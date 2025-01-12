# 🚀 SlipOk SDK

SlipOk SDK ช่วยให้คุณสามารถโต้ตอบกับ SlipOk API เพื่อเช็คโควต้าและสลิปได้

### ✨ Features

- รองรับ TypeScript
- เช็คจำนวนโควต้าคงเหลือ (`checkQuota`)
- เช็คสลิปด้วยข้อมูลต่างๆ (`checkSlip`)

## 📦 Installation

```bash
# npm
npm install @prakrit_m/slipok-sdk

# yarn
yarn add @prakrit_m/slipok-sdk
```

## 📖 Usage

### การนำเข้า SDK

```typescript
import SlipOk from "slipok-sdk";
```

### 🏗️ การสร้างอินสแตนซ์

```typescript
const slipOk = new SlipOk("your-api-key", "your-branch-id");
```

### ⚙️ เมธอด

#### `checkQuota()`

เช็คจำนวนโควต้าคงเหลือ

```typescript
const quotaResponse = await slipOk.checkQuota();
if (quotaResponse.success) {
  console.log("ข้อมูลโควต้า:", quotaResponse.data);
} else {
  console.error(
    "รหัสข้อผิดพลาด:",
    quotaResponse.code,
    "ข้อความ:",
    quotaResponse.message
  );
}
```

**Return Type:**

- `Promise<QuotaResponseSuccess | QuotaResponseError>`

##### `QuotaResponseSuccess`:

```typescript
type QuotaResponseSuccess = {
  success: true;
  data: {
    quota: number;
    specialQuota: number;
    overQuota: number;
  };
};
```

##### `QuotaResponseError`:

```typescript
type QuotaResponseError = {
  success: false;
  code: "1001" | "1002";
  message: string;
};
```

#### **`checkSlip(data)`**

เช็คสลิปด้วยข้อมูลที่ให้มา

```typescript
const slipData = {
  data: 'ค่าที่อ่านได้จาก qr code ขวาล่างของสลิป',
  url: ' url ของรูปภาพสลิป',
  files: new File(['content'], 'slip.jpg'),
  ** ส่งได้แค่อย่างใดอย่างหนึ่งจากสามรูปแบบข้างต้น **

  amount: 100,
  log: true,
};

const slipResponse = await slipOk.checkSlip(slipData);
if (slipResponse.success) {
  console.log('ข้อมูลสลิป:', slipResponse.data);
} else {
  console.error('รหัสข้อผิดพลาด:', slipResponse.code, 'ข้อความ:', slipResponse.message);
}
```

**Return Type:**

- `Promise<SlipResponseSuccess | SlipResponseError>`

##### `SlipResponseSuccess`:

```typescript
type SlipResponseSuccess = {
  success: true;
  data: {
    // ...รายละเอียดของข้อมูลสลิป...
  };
};
```

##### `SlipResponseError`:

```typescript
type SlipResponseError = {
  success: false;
  code: string;
  message: string;
  data?: {
    // ...รายละเอียดของข้อมูลสลิปในกรณีที่มี...
  };
};
```

## 📚 Documentation

อ่าน SlipOK API Documentation ได้ที่ [SlipOK API Documentation](https://slipok.com/api-documentation/)

## 📄 License

> This is a third-party SDK, not an official SlipOk SDK.  
> SDK นี้พัฒนาโดยบุคคลภายนอก ไม่ใช่ผลิตภัณฑ์อย่างเป็นทางการจาก SlipOk

[ISC](LICENSE)



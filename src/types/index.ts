export type BankCode =
  | "002" // BBL - ธนาคารกรุงเทพ
  | "004" // KBANK - ธนาคารกสิกรไทย
  | "006" // KTB - ธนาคารกรุงไทย
  | "011" // TTB - ธนาคารทหารไทยธนชาต
  | "014" // SCB - ธนาคารไทยพาณิชย์
  | "025" // BAY - ธนาคารกรุงศรีอยุธยา
  | "069" // KKP - ธนาคารเกียรตินาคินภัทร
  | "022" // CIMBT - ธนาคารซีไอเอ็มบีไทย
  | "067" // TISCO - ธนาคารทิสโก้
  | "024" // UOBT - ธนาคารยูโอบี
  | "071" // TCD - ธนาคารไทยเครดิตเพื่อรายย่อย
  | "073" // LHFG - ธนาคารแลนด์ แอนด์ เฮ้าส์
  | "070" // ICBCT - ธนาคารไอซีบีซี (ไทย)
  | "098" // SME - ธนาคารพัฒนาวิสาหกิจขนาดกลางและขนาดย่อมแห่งประเทศไทย
  | "034" // BAAC - ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร
  | "035" // EXIM - ธนาคารเพื่อการส่งออกและนำเข้าแห่งประเทศไทย
  | "030" // GSB - ธนาคารออมสิน
  | "033"; // GHB - ธนาคารอาคารสงเคราะห์

export type SlipResponseSuccess = {
  success: true;
  data: Data;
};

export type SlipResponseError =
  | {
      success: false;
      code:
        | "1000" // กรุณาใส่ข้อมูล QR Code ให้ครบใน field data, files หรือ url
        | "1001" // ไม่พบข้อมูลสาขา กรุณาตรวจสอบไอดีสาขา
        | "1002" // Authorization Header ไม่ถูกต้อง
        | "1003" // Package ของคุณหมดอายุแล้ว
        | "1004" // Package ของคุณใช้เกินโควต้ามาแล้ว 400 บาท กรุณาต่อสมาชิกแพ็กเกจ
        | "1005" // ไฟล์ไม่ใช่ไฟล์ภาพ กรุณาอัพโหลดไฟล์เฉพาะนามสกุล .jpg .jpeg .png .jfif หรือ .webp
        | "1006" // รูปภาพไม่ถูกต้อง
        | "1007" // รูปภาพไม่มี QR Code
        | "1008" // QR ดังกล่าวไม่ใช่ QR สำหรับการตรวจสอบการชำระเงิน
        | "1009" // ขออภัยในความไม่สะดวก ขณะนี้ข้อมูลธนาคารเกิดขัดข้องชั่วคราว โปรดตรวจใหม่อีกครั้งใน 15 นาทีถัดไป (ไม่เสียโควต้าสลิป)
        | "1011"; // QR Code หมดอายุ หรือ ไม่มีรายการอยู่จริง
      message: string;
    }
  | {
      success: false;
      code:
        | "1012" // สลิปซ้ำ สลิปนี้เคยส่งเข้ามาในระบบเมื่อ {timestamp}
        | "1013" // ยอดที่ส่งมาไม่ตรงกับยอดสลิป
        | "1014"; // บัญชีผู้รับไม่ตรงกับบัญชีหลักของร้าน;
      message: string;
      data: Data;
    }
  | {
      success: false;
      code: "1010"; // เนื่องจากเป็นสลิปจากธนาคาร{ชื่อธนาคาร} กรุณารอการตรวจสอบสลิปหลังการโอนประมาณ {จำนวนนาที} นาที
      message: string;
      data: {
        qrcodeData: string;
        bankCode: "002" | "014";
        bankName: string;
        delay: number;
      };
    };

export type Data = {
  success: string;
  message: string;
  rqUID: string;
  language: "TH" | "EN";
  transRef: string;
  sendingBank: BankCode | "";
  receivingBank: BankCode | "";
  transDate: string;
  transTime: string;
  transTimestamp: Date;
  sender: Sender;
  receiver: Receiver;
  amount: number;
  paidLocalAmount: number;
  paidLocalCurrency: string;
  countryCode: string;
  transFeeAmount: number;
  ref1: string;
  ref2: string;
  ref3: string;
  toMerchantId: string;
};

export type Sender = {
  displayName: string;
  name: string;
  proxy: Proxy;
  account: Account;
};

export type Receiver = {
  displayName: string;
  name: string;
  proxy: Proxy;
  account: Account;
};

export type Proxy = {
  type: "NATID" | "MSISDN" | "EWALLETID" | "EMAIL" | "BILLERID" | null;
  value: string | null;
};

export type Account = {
  type: "BANKAC" | "TOKEN" | "DUMMY" | "";
  value: string;
};

export type QuotaResponseSuccess = {
  success: true;
  data: QuotaData;
};
export type QuotaResponseError = {
  success: false;
  code:
    | "1001" // ไม่พบข้อมูลสาขา กรุณาตรวจสอบไอดีสาขา
    | "1002"; // Authorization Header ไม่ถูกต้อง
  message: string;
};

export type QuotaData = {
  quota: number;
  specialQuota: number;
  overQuota: number;
};

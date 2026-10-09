# คู่มือการใช้งาน Web API

ระบบจัดเส้นทางและแบ่งงานไรเดอร์สำหรับร้านข้าวกล่อง

## Base URL

Local:

```text
http://localhost:3000
```

Production:

```text
https://finalwebprojectapi.vercel.app
```

ทุก Request ที่ส่งข้อมูลต้องใช้ Header:

```http
Content-Type: application/json
```

## ตรวจสอบระบบ

### `GET /health`

ตรวจสอบว่า API เชื่อมต่อ MySQL สำเร็จหรือไม่

ตัวอย่าง Response:

```json
{
  "ok": true,
  "database": "mysql"
}
```

## Customer API

### แสดงลูกค้าทั้งหมด / ค้นหาชื่อ

```http
GET /api/customer
GET /api/customer?name=สมชาย
```

### เพิ่มลูกค้า

```http
POST /api/customer
```

Request body:

```json
{
  "first_name": "สมชาย",
  "last_name": "ใจดี",
  "phone": "0812345678",
  "address": "หอพัก A มมส.",
  "latitude": 16.2435,
  "longitude": 103.2542
}
```

Response `201 Created`:

```json
{
  "last_id": 1
}
```

### ดึงข้อมูลลูกค้าตาม ID

```http
GET /api/customer/:id
```

ตัวอย่าง:

```http
GET /api/customer/1
```

ถ้าไม่พบข้อมูล จะตอบ `404 Customer not found`

### ค้นหาลูกค้าที่อยู่ใกล้ตำแหน่งที่กำหนด

```http
GET /api/customer/nearby?latitude=16.2435&longitude=103.2542
```

ระบบจะแสดงลูกค้าที่อยู่ภายในระยะ 1 กิโลเมตร พร้อมฟิลด์ `distance_km`

### แก้ไขลูกค้า

```http
PUT /api/customer/:id
```

ตัวอย่าง: `PUT /api/customer/1`

```json
{
  "first_name": "สมชาย",
  "last_name": "ใจดีมาก",
  "phone": "0812345678",
  "address": "หอพัก B มมส.",
  "latitude": 16.244,
  "longitude": 103.255
}
```

### ลบลูกค้า

```http
DELETE /api/customer/:id
```

ตัวอย่าง Response:

```json
{
  "affected_rows": 1
}
```

## Order API

### แสดงออเดอร์ทั้งหมด

```http
GET /api/order
```

ข้อมูลจะรวมข้อมูลลูกค้าที่เกี่ยวข้องด้วย

### เพิ่มออเดอร์

```http
POST /api/order
```

Request body:

```json
{
  "customer_id": 1,
  "box_count": 2
}
```

`box_count` ต้องมีค่าตั้งแต่ 1 ถึง 3 กล่อง และระบบจะตั้งสถานะเริ่มต้นเป็น `ready`

### ค้นหาออเดอร์ที่อยู่ใกล้ตำแหน่งที่กำหนด

```http
GET /api/order/nearby?latitude=16.2435&longitude=103.2542
```

ระบบจะแสดงออเดอร์ภายในระยะ 2 กิโลเมตร พร้อมข้อมูลลูกค้าและ `distance_km`

### แก้ไขออเดอร์

```http
PUT /api/order/:id
```

ส่งเฉพาะฟิลด์ที่ต้องการแก้ไขได้ เช่น:

```json
{
  "status": "assigned",
  "box_count": 2
}
```

สถานะที่ใช้ได้: `pending`, `ready`, `assigned`, `delivered`, `cancelled`

### ลบออเดอร์

```http
DELETE /api/order/:id
```

### สร้างออเดอร์ตัวอย่างจำนวน 20–30 รายการ

```http
POST /api/order/random
```

Request body (ไม่ส่ง body จะสร้าง 20 รายการ):

```json
{
  "amount": 20
}
```

ออเดอร์ที่สร้างจากเส้นนี้จะถูกทำเครื่องหมาย `is_demo = true`

### ลบออเดอร์ตัวอย่างทั้งหมด

```http
DELETE /api/order/demo
```

ก่อนใช้เส้นสุ่มข้อมูล ต้องมีคอลัมน์ `is_demo` ในตาราง `ORDERS` ตาม `schema.sql`

## Rider API

### แสดงไรเดอร์ทั้งหมด

```http
GET /api/rider
```

## Routing API

### ดูแผนเส้นทางล่าสุด

```http
GET /api/routing/latest
```

ถ้ายังไม่มีแผน Response จะเป็น:

```json
{
  "active_plan": null
}
```

## รูปแบบ Error

```json
{
  "error": "Database error"
}
```

รหัสสถานะที่ใช้บ่อย:

| Status | ความหมาย |
|---|---|
| 200 | สำเร็จ |
| 201 | เพิ่มข้อมูลสำเร็จ |
| 400 | ข้อมูลที่ส่งไม่ถูกต้อง |
| 404 | ไม่พบข้อมูล |
| 500 | เกิดข้อผิดพลาดภายในระบบ |

## สมาชิกกลุ่ม

- เศรณี ภูนาโพธิ์
- พงศกร ถุนพุฒดม
- เอกอนุชา ไชยเสนา
- ชินดนัย ภูหัดสวน

## ตัวอย่างทดสอบด้วย PowerShell

```powershell
Invoke-RestMethod -Uri "https://finalwebprojectapi.vercel.app/api/customer" -Method GET
Invoke-RestMethod -Uri "https://finalwebprojectapi.vercel.app/api/order" -Method GET
```

ไฟล์นี้อธิบายเฉพาะ API ที่มีอยู่ใน Backend เวอร์ชันปัจจุบัน

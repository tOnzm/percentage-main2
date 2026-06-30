# AGENTS.md

> โปรเจกต์: PromptGen (เวอร์ชันใหม่/ต่อยอดจาก percentage-main2)
> Stack: Vite + React
> เอกสารนี้คือ source of truth สำหรับ AI agents ที่ทำงานในโปรเจกต์นี้ — ทุก agent ต้องอ่านก่อนเริ่มงาน

---

## 1. Project Context

PromptGen คือเครื่องมือสร้าง prompt สำหรับงานถ่ายภาพผลิตภัณฑ์ความงาม/skincare ระดับลักชัวรี่ เอาต์พุตเป็น JSON ที่ใช้กับ Google Nano Banana / Magnific Spaces

เวอร์ชันนี้คือการต่อยอดจาก `percentage-main2` โดยปรับโครงสร้างให้สะอาดขึ้น มี lint/format ที่เข้มงวด และมี agent-based workflow (Architect / UI / Logic) ที่ทำงานตาม rules ที่กำหนดไว้ใน `.opencode/rules/`

---

## 2. Tech Stack & Commands

| งาน               | คำสั่ง                 |
| ----------------- | ---------------------- |
| Dev server        | `npm run dev`          |
| Build             | `npm run build`        |
| Lint              | `npm run lint`         |
| Lint (auto-fix)   | `npm run lint:fix`     |
| Format (Prettier) | `npm run format`       |
| Format check      | `npm run format:check` |

**กฎ:** ห้าม commit code ที่ lint ไม่ผ่าน ทุก agent ต้องรัน `lint:fix` + `format` ก่อนจบงานเสมอ

---

## 3. Agent Roles

### 🏗️ Architect Agent

**หน้าที่:** ตัดสินใจเชิงโครงสร้าง ไม่ลงมือเขียน UI/logic เอง

- ออกแบบ folder structure, ตัดสินใจเรื่อง state management / routing
- รีวิวและอนุมัติ dependency ใหม่ก่อนติดตั้ง
- ดูแลความสอดคล้องของ `opencode.json` และ `.opencode/rules/`
- รีวิว PR/diff จาก UI Agent และ Logic Agent ก่อน merge — เช็คว่าทำตาม rules และไม่ผิด pattern ที่วางไว้
- เป็นคนตัดสินตอนมี conflict ระหว่าง UI Agent กับ Logic Agent (เช่น data shape ที่ component ต้องการ)

### 🎨 UI Agent

**หน้าที่:** Component, styling, responsive — ไม่แตะ business logic / data fetching

- ใช้ skill: `add-component`, `responsive-adapt`, `css-modularize`
- ต้องเขียนตาม Design System (ดูหัวข้อ 5) ทุกครั้ง ห้ามตั้งค่าสี/font เองนอกเหนือจาก design tokens ที่กำหนด
- Component ต้องรับ data ผ่าน props เท่านั้น ห้าม fetch data เอง (เป็นงานของ Logic Agent)

### ⚙️ Logic Agent

**หน้าที่:** Data module, state, business logic, JSON output formatting — ไม่แตะ styling/markup

- ใช้ skill: `add-data-module`
- รับผิดชอบ schema ของ JSON ที่ส่งออกไปยัง Nano Banana / Magnific Spaces — ต้อง valid ตาม spec เสมอ
- เขียน logic แบบ pure function ให้มากที่สุด เพื่อให้ test ง่ายและ UI Agent เอาไปต่อได้โดยไม่ผูกกับ component

**Hand-off rule:** ถ้า UI Agent ต้องการ data shape ใหม่ ให้เปิด request ถึง Logic Agent ผ่าน comment ในไฟล์ที่เกี่ยวข้อง ไม่ใช่ไปเขียน logic เองในไฟล์ component

---

## 4. Project-Specific Constraints

- ห้าม inline `eslint-disable` โดยไม่มีคอมเมนต์อธิบายเหตุผล (กฎเฉพาะโปรเจกต์นี้ เข้มกว่า default)
- Component เกิน ~150 บรรทัด → แตกย่อย (threshold เฉพาะของทีมนี้)
- Naming: PascalCase สำหรับ component, camelCase สำหรับ utils/hooks

---

## 5. Design System (ฉบับเริ่มต้น — เสนอใหม่)

เนื่องจากยังไม่มี design system เดิม นี่คือข้อเสนอที่ออกแบบมาให้เหมาะกับ use case (เครื่องมือทำงานสำหรับ professional ที่ต้องโฟกัสกับรายละเอียดผลิตภัณฑ์ความงามระดับลักชัวรี่ — ต้องดูสะอาด แม่นยำ และ "เทคนิค" ไม่ใช่ consumer-facing)

| Token                 | ค่า                                                | เหตุผล                                                                                      |
| --------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Background            | `#FAFAF8` (off-white, ไม่ขาวจัด)                   | ลด eye strain ตอนใช้งานนาน ๆ ในฐานะ tool                                                    |
| Surface/Card          | `#FFFFFF` + border `#E8E6E1`                       | แยก layer ชัดแต่ไม่หนัก                                                                     |
| Text primary          | `#1A1A18` (ink, ไม่ใช่ pure black)                 | premium, soft contrast                                                                      |
| Text secondary        | `#6B6862`                                          | สำหรับ label/metadata                                                                       |
| Accent                | `#9C7A4D` (champagne gold/bronze)                  | สื่อถึงความ luxury beauty โดยไม่ชนกับ orange ของ t-port — กันสับสนเวลาเปิดสองโปรเจกต์คู่กัน |
| Accent hover          | `#7E6038`                                          |                                                                                             |
| Error/Warning         | `#B3432B`                                          | warm red-brown ให้เข้าธีม ไม่ใช้แดงสด                                                       |
| Font (UI)             | Inter หรือ system sans                             | อ่านง่าย ทำงานไว                                                                            |
| Font (metadata/label) | Monospace (เช่น JetBrains Mono)                    | ตรงกับ pattern ที่ใช้ใน t-port — ใช้แยก "data label" จาก "content" ชัดเจน                   |
| Layout                | Sidebar-dominant (ต่อยอดจาก PromptGen v2 redesign) | คุ้นมือกับ workflow เดิม                                                                    |
| Selector style        | Pill/toggle (ไม่ใช้ dropdown)                      | ต่อยอด pattern เดิมที่ user สะดวกอยู่แล้ว                                                   |

**หมายเหตุ:** Accent สีนี้เป็นข้อเสนอเริ่มต้น ถ้าลองแล้วไม่ชอบให้แก้ที่ token เดียว (`--color-accent`) ไม่ต้องไล่แก้ทั้งโค้ด — ทุก component ต้องอ้าง CSS variable ไม่ hardcode สี

---

## 6. Architectural Decisions

- Prompt-generation logic (Stage 1/Stage 2) อยู่ที่ `src/lib/promptgen/` แยกจาก UI เสมอ (เผื่อทำ CLI/API ในอนาคต)
- JSON output ต้องมี `schemaVersion` field เสมอ
- Logic Agent เป็นเจ้าของ data flow/state — ห้าม UI Agent เขียน global state ผูกกับ component ตรง ๆ

---

## 7. Reference

- Rules: `.opencode/rules/`
- Config: `opencode.json`
- เดิม: `percentage-main2` (Vite, ES modules, GitHub Pages deploy ที่ `tOnzm.github.io/percentage-main2`)

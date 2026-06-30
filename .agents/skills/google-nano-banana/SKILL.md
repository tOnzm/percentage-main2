# Google Nano Banana Prompting — Creative Director Skills

> สำหรับ PromptGen: สร้าง prompts สำหรับการถ่ายภาพผลิตภัณฑ์ skincare/beauty
> เป้าหมาย: เอาต์พุต JSON ที่ใช้กับ **Google Nano Banana** (img2img) และ **Magnific Spaces**

---

## 1. Nano Banana Prompting Framework (จาก official guide)

Nano Banana ใช้ Gemini 3 family — deep reasoning ก่อน gen ภาพ

### Text-to-Image (ไม่มี reference)

```
[Subject] + [Action] + [Location/context] + [Composition] + [Style]
```

ตัวอย่าง:
> *"A striking fashion model wearing a tailored brown dress, sleek boots, and holding a structured handbag. Posing with a confident, statuesque stance, slightly turned. A seamless, deep cherry red studio backdrop. Medium-full shot, center-framed. Fashion magazine style editorial, shot on medium-format analog film, pronounced grain, high saturation, cinematic lighting effect."*

### Multimodal (img2img มี reference) — **โหมดที่ PromptGen ใช้**

```
[Reference images] + [Relationship instruction] + [New scenario]
```

---

## 2. Five Element Mapping — PromptGen → Nano Banana

| # | PromptGen Category | Nano Banana Element | ตัวอย่างใน prompt |
|---|---|---|---|
| 1 | **ANGLE** + **LENS** | Camera, lens & focus | *"low-angle shot, 85mm f/1.4, shallow depth of field"* |
| 2 | **LIGHTING** + **SHADOW** | Lighting design | *"three-point softbox setup, Chiaroscuro contrast"* |
| 3 | **MOOD** + **EFFECTS** | Color grading & film stock | *"Kodak Portra 400, cinematic teal/orange grade"* |
| 4 | **QUALITY** + **RATIO** | Technical spec | *"8K, ultra-realistic, 3:2 aspect ratio"* |
| 5 | **PROPS** + **COMP** + **BG** | Materiality & scene | *"matte ceramic surface, tweed fabric, orchid stem"* |

**Law of the Creative Director:** PromptGen output ต้องมี Element #1, #2, #3, #4 ครบทุกครั้ง — เหลือ #5 แล้วแต่ use case

---

## 3. Creative Director Checklist

### 3.1 Design your lighting (LIGHTING + SHADOW)

บอกโมเดลให้ชัดว่าฉากนั้นมีแสงยังไง — ใช้คำศัพท์ช่างภาพจริง

| คำที่ใช้ | ความหมาย | ใช้กับ |
|----------|-----------|--------|
| `three-point softbox setup` | Key 45° ซ้าย + Fill 45° ขวา + Rim หลัง | มาตรฐานสตูดิโอ |
| `Chiaroscuro lighting` | แรงตัดกันสูง แบบ Caravaggio | ดราม่า |
| `Golden hour backlighting` | แสงอุ่นจากด้านหลัง ตกกระทบเป็น long shadows | Editorial |
| `Beauty dish with grid` | specular highlight แบบ medium-contrast | Product |
| `Strip box raking light` | แรงเฉียงผิว texture | Detail |
| `Ring light on-axis` | แนวหน้า สว่างสม่ำเสมอ | Beauty/flat |
| `Rembrandt triangle` | รูปสามเหลี่ยมข้างแก้ม | Portrait/editorial |
| `High-key cyclorama` | ขาวโอเวอร์ทั้ง frame | Commercial |

### 3.2 Choose camera, lens & focus (ANGLE + LENS)

บอก **hardware** เพื่อเปลี่ยน DNA ของภาพ

- **GoPro** → immersive, distorted action feel
- **Fujifilm** → authentic color science
- **Disposable camera** → raw nostalgic flash
- **Medium format** → premium editorial
- **iPhone** → modern casual

บอก **lens** เพื่อควบคุม depth/perspective:

| เลนส์ | DOF | ใช้กับ |
|--------|-----|--------|
| `14mm f/4` | Deep | Environmental, dramatic scale |
| `24mm f/2.8` | Medium | Environmental storytelling |
| `35mm f/1.8` | Shallow | Natural perspective, commercial |
| `50mm f/1.4` | Shallow | Realistic, studio |
| `85mm f/1.4` | Very shallow | Portraits, luxury beauty |
| `90mm Macro f/2.8` | Ultra shallow | Detail, texture |
| `105mm f/2.8` | Shallow | Premium product |
| `135mm f/2` | Very shallow | Editorial compression |
| `200mm f/2.8` | Extreme shallow | Isolated campaigns |

บอก **aperture** เพื่อ mood:
- `f/1.2–1.8` → dreamy, intimate, creamy bokeh
- `f/2.8–4` → balanced, sharp subject + context
- `f/5.6–8` → everything in focus, clinical, commercial
- `f/11+` → maximum depth, macro, technical

บอก **angle** เพื่อ composition:
- `Straight-on front` → classic commercial
- `45° three-quarter` → dimensional, editorial
- `Low-angle hero` → powerful, premium
- `Overhead flat lay` → scientific, minimal
- `Macro close-up` → detail, texture
- `Eye-level` → natural, relatable

### 3.3 Define color grading & film stock (MOOD + EFFECTS)

| Film Stock | Characteristic | ใช้กับ |
|------------|----------------|--------|
| `Kodak Portra 400` | Warm skin tones, soft contrast | Luxury beauty |
| `Kodak Portra 800` | Grainy, warm, nostalgic | Editorial |
| `Fujifilm Pro 400H` | Cool pastels, soft greens, clean | Clean minimal |
| `Fujifilm Velvia` | High saturation, vivid | Bold/vibrant |
| `Cinematic teal/orange` | Teal shadows + orange skin | Modern cinematic |
| `Bleach bypass` | Desaturated, high contrast | Moody, edgy |
| `1980s color film` | Grainy, warm, nostalgic | Retro |
| `Arri Alexa cinematic` | Clean, filmic, professional | Commercial |

### 3.4 Emphasize materiality & texture (PROPS + val descriptions)

**Don't just name the object — describe its physical makeup:**

| แทนที่จะบอกแค่ | ให้บอก |
|----------------|--------|
| `suit jacket` | `navy blue tweed suit jacket` |
| `armor` | `ornate elven plate armor, etched with silver leaf patterns` |
| `coffee mug` | `minimalist ceramic coffee mug` |
| `surface` | `matte white acrylic surface` |
| `fabric` | `raw silk fabric with subtle sheen` |
| `bottle` | `frosted glass bottle with gold ribbed cap` |

---

## 4. Magnific Spaces — Dual-Output Strategy

PromptGen ส่งออก JSON ที่ใช้กับ **Magnific Spaces** (upscale)

### Tier 1 — Editorial (Hero Image)
- High-end, artistic, moody
- DOF ตื้น, cinematic lighting, filmic grade
- สำหรับ social, website hero, campaign

### Tier 2 — E-commerce (Product Detail)
- Clinical, ultra-sharp, even lighting
- DOF ลึก, ทุกรายละเอียดคมชัด
- สำหรับ PDP, catalog, zoom detail

**Magnific Spaces parameter hints:**
```json
{
  "SpaceType": "Editorial",
  "UpscaleFactor": 2,
  "Creativity": 0.3,
  "Resemblance": 0.85,
  "Lighting": "consistent with source"
}
```

---

## 5. Subject Consistency — Best Practices

1. **Use `Strictly preserve`** framing ใน prompt — ป้องกันไม่ให้ Nano Banana แก้แบรนด์/โลโก้
2. **Negative prompt** ต้องรวม: `deformed packaging, modified label text, blurred branding`
3. **Image guidance scale** ~5.0 + **denoising strength** ~0.35 → change scene only, not product
4. **Multi-product:** ระบุ count + layout (`"exactly 3 products side by side"`)
5. **Product + Box:** ระบุให้ชัดว่าเอาทั้งคู่ ไม่ใช่แค่อย่างใดอย่างหนึ่ง

---

## 6. Aspect Ratio Mapping

| Ratio | ใช้กับ |
|-------|--------|
| 1:1 | Instagram, PDP |
| 3:2 | Editorial print |
| 4:3 | Catalog |
| 16:9 | Website hero, social cover |
| 9:16 | Mobile, TikTok/Reels |
| 21:9 | Cinematic, banner |

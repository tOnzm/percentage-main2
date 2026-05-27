window.labelFinishOptions = {
  "glossy_flat": {
    label: "ฉลากเงา ตัวอักษรไม่นูน",
    promptPart: "smooth glossy plastic label, flat printing typography, high-shine polymer lamination, uniform light reflection"
  },
  "glossy_raised": {
    label: "ฉลากเงา ตัวอักษรนูน (Spot UV)",
    promptPart: "glossy plastic label, typography with high-shine spot-UV varnish, tactile raised glossy text, crisp specular highlights on letters"
  },
  "embossed_subtle": {
    label: "ฉลากปั้มนูนเล็กน้อย (Embossed)",
    promptPart: "matte-finish plastic label, subtle embossed typography with blind-debossing effect, slight depth and shadow contour around letters, soft tactile texture"
  }
};

// Array format สำหรับ _renderSingleSelectGroup ใน camera-section.js
window.finishData = [
  {
    label: "ฉลากเงา ตัวอักษรไม่นูน",
    val: "glossy reflective label, flat smooth typography, subtle specular highlights"
  },
  {
    label: "ฉลากเงา ตัวอักษรนูน",
    val: "glossy reflective label finish with subtle specular highlights, high-shine varnish effect on typography"
  },
  {
    label: "ฉลากปั้มนูนเล็กน้อย",
    val: "lightly embossed label texture, debossed typography with soft shadow depth, satin finish"
  },
];

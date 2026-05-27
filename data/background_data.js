// data/background_data.js
// Plain globals — loaded via <script src> (ไม่ใช้ ES module export)

const baseColors = [
  { label: "Midnight Purple", hex: "#2a1040", val: "deep midnight purple solid background",  textColor: "#c9b8f0" },
  { label: "Violet",          hex: "#6B4FA0", val: "rich violet solid background",            textColor: "#EEEDFE" },
  { label: "Matte Black",     hex: "#0a0a0a", val: "pure matte black solid background",       textColor: "#888"    },
  { label: "Charcoal",        hex: "#1a1a1a", val: "dark charcoal solid background",          textColor: "#666"    },
  { label: "Pure White",      hex: "#ffffff", val: "pure white clean solid background",        textColor: "#aaa"    },
  { label: "Cream",           hex: "#f5f0e8", val: "warm cream ivory solid background",        textColor: "#8a7a5a" },
  { label: "Forest",          hex: "#1c3a2a", val: "deep forest green solid background",       textColor: "#7ecba0" },
  { label: "Navy",            hex: "#1a3a5c", val: "deep navy blue solid background",          textColor: "#85B7EB" },
  { label: "Burgundy",        hex: "#5a1020", val: "deep burgundy solid background",           textColor: "#f09595" },
  { label: "Dark Brown",      hex: "#3a2010", val: "warm dark brown solid background",         textColor: "#FAC775" },
  { label: "Blush Pink",      hex: "#F594A6", val: "soft rose blush solid background",         textColor: "#993556" },
  { label: "Sage",            hex: "#c8d8c8", val: "soft sage green solid background",         textColor: "#3B6D11" },
  { label: "PHA Orange",      hex: "#FF9D23", val: "warm orange solid background",             textColor: "#000000" },
];

const studioColors = [
  { label: "White",      hex: "#ffffff", val: "pure white studio"      },
  { label: "Off White",  hex: "#f5f5f5", val: "off white studio"       },
  { label: "Warm Cream", hex: "#e8e0d8", val: "warm cream studio"      },
  { label: "Light Gray", hex: "#d8d8d8", val: "light gray studio"      },
  { label: "Mid Gray",   hex: "#a0a0a0", val: "medium gray studio"     },
  { label: "Dark Gray",  hex: "#404040", val: "dark gray studio"       },
  { label: "Near Black", hex: "#1a1a1a", val: "near black studio"      },
  { label: "Matte Black",hex: "#0a0a0a", val: "matte black studio"     },
  { label: "Blush Beige",hex: "#e8d8d0", val: "blush beige studio"     },
  { label: "Sage Mist",  hex: "#d0d8d0", val: "sage mist studio"       },
];

const gradientColors = [
  { label: "Purple Dusk",    css: "linear-gradient(160deg,#2a1040,#6B4FA0)", val: "deep purple to violet gradient background, dark to light from bottom to top"           },
  { label: "Black → Purple", css: "linear-gradient(160deg,#0a0a0a,#2a1040)", val: "black to deep purple gradient background, moody and cinematic"                         },
  { label: "Navy Violet",    css: "linear-gradient(160deg,#1a3a5c,#6B4FA0)", val: "deep navy to violet gradient background"                                                },
  { label: "Forest Teal",    css: "linear-gradient(160deg,#1c3a2a,#2a6e8a)", val: "deep forest green to teal gradient background"                                          },
  { label: "Brown Amber",    css: "linear-gradient(160deg,#3a2010,#7a5a1a)", val: "dark brown to warm amber gradient background"                                            },
  { label: "Burgundy Rose",  css: "linear-gradient(160deg,#5a1020,#b85888)", val: "deep burgundy to rose pink gradient background"                                          },
  { label: "Black Navy",     css: "linear-gradient(160deg,#0a0a0a,#1a3a5c)", val: "pure black to deep navy gradient background, ultra dramatic"                             },
  { label: "Cream Blush",    css: "linear-gradient(160deg,#f5f0e8,#e8c8d8)", val: "warm cream to soft blush pink gradient background, gentle and romantic"                  },
];

const gradientDirections = [
  { label: "Top → Bottom", val: "top to bottom"                    },
  { label: "Bottom → Top", val: "bottom to top"                    },
  { label: "Diagonal",     val: "diagonal top-left to bottom-right" },
  { label: "Radial",       val: "radial center outward"             },
];

const sceneCards = [
  { icon: '<i class="ti ti-moon-stars"></i>',  title: "Evening Purple Sky",  desc: "ท้องฟ้ายามค่ำสีม่วง bokeh ไฟระยิบระยับ บรรยากาศ magical",            val: "background: softly blurred outdoor scene with evening purple sky, distant bokeh lights, magical and ethereal atmosphere"                  },
  { icon: '<i class="ti ti-plant"></i>',        title: "Zen Garden Mist",     desc: "สวนญี่ปุ่น ไม้ไผ่เงา หมอกยามเช้า สงบ เรียบ",                        val: "background: misty Japanese zen garden with soft morning mist, bamboo silhouettes, peaceful and serene"                                    },
  { icon: '<i class="ti ti-flask"></i>',        title: "Futuristic Lab",      desc: "ห้องแล็บสกินแคร์ กระจกใส อุปกรณ์วิทยาศาสตร์ ล้ำสมัย",              val: "background: futuristic skincare laboratory with transparent glass equipment, clean scientific atmosphere and soft reflections"              },
  { icon: '<i class="ti ti-microscope"></i>',   title: "Biotech Laboratory",  desc: "ห้องทดลองชีวภาพ กระจกเงา คลีน มินิมอล",                            val: "background: clean biotechnology laboratory with glossy scientific glassware and minimal clinical atmosphere"                              },
  { icon: '<i class="ti ti-test-pipe"></i>',    title: "Skincare Research",   desc: "แล็บวิจัยสกินแคร์ หรู เรียบ สะอาด",                                val: "background: luxury skincare research laboratory with acrylic panels, scientific equipment and cinematic reflections"                        },
  { icon: '<i class="ti ti-pill"></i>',         title: "Pharma Lab",          desc: "ห้องทดลองยา sterile กระจกใส depth นุ่ม",                             val: "background: sterile pharmaceutical laboratory with transparent beakers, petri dishes and soft depth of field"                             },
  { icon: '<i class="ti ti-atom"></i>',         title: "Cosmetic Science",    desc: "แล็บเครื่องสำอาง โมเดิร์น เงาสะท้อน futuristic",                    val: "background: modern cosmetic science laboratory with reflective surfaces and futuristic product testing atmosphere"                         },
  { icon: '<i class="ti ti-glass-full"></i>',   title: "Glass Laboratory",    desc: "แล็บกระจกใส ลอยตัว คลีน editorial",                                val: "background: transparent laboratory environment with floating glass elements and clean editorial composition"                             },
  { icon: '<i class="ti ti-droplet"></i>',      title: "Hydration Lab",       desc: "แล็บเซรั่ม ความชุ่มชื้น หรู มินิมอล",                              val: "background: scientific hydration laboratory with serum textures, glass reflections and minimal luxury atmosphere"                          },
  { icon: '<i class="ti ti-flask-2"></i>',      title: "Formulation Lab",     desc: "ห้องพัฒนาสูตรสกินแคร์ depth แบบภาพยนตร์",                          val: "background: advanced skincare formulation laboratory with transparent scientific tools and cinematic depth"                                },
  { icon: '<i class="ti ti-tree"></i>',         title: "Forest Bokeh",        desc: "ป่าสีเขียว แสงทองกรองผ่านใบไม้ bokeh อบอุ่น",                      val: "background: softly blurred forest with golden sunlight filtering through leaves, warm bokeh, organic and natural"                          },
  { icon: '<i class="ti ti-diamond"></i>',      title: "Marble Blur",         desc: "หินอ่อนเบลอนุ่ม ขาว-เทา high-end luxury",                           val: "background: abstract blurred marble texture in soft white and gray tones, luxurious and clean"                                            },
  { icon: '<i class="ti ti-candle"></i>',       title: "Candlelit Amber",     desc: "แสงเทียนสีแอมเบอร์ bokeh อุ่น สุนทรีย์ โรแมนติก",                  val: "background: candlelit warm amber interior, soft bokeh candle flames, intimate and sensual atmosphere"                                      },
  { icon: '<i class="ti ti-cloud-rain"></i>',   title: "Rainy City Night",    desc: "กระจกฝนตก bokeh ไฟเมือง noir cinematic",                            val: "background: dark moody rain-washed window with bokeh city lights beyond, cinematic noir atmosphere"                                      },
  { icon: '<i class="ti ti-sun"></i>',          title: "Desert Dunes",        desc: "เนินทรายทะเลทราย golden hour สีอบอุ่น",                             val: "background: desert sand dunes at golden hour, warm amber and orange tones, soft and dreamy"                                             },
  { icon: '<i class="ti ti-ripple"></i>',       title: "Deep Ocean",          desc: "ใต้น้ำทะเลลึก teal-navy เบลอนุ่ม mysterious",                       val: "background: abstract blurred deep ocean water in dark teal and blue tones, mysterious and deep"                                          },
  { icon: '<i class="ti ti-palm-tree"></i>',    title: "Tropical Garden",     desc: "สวนเขตร้อน ใบปาล์ม แสงเย็น exotic",                                val: "background: lush tropical garden with blurred palm leaves and warm evening light, exotic and vibrant"                                    },
  { icon: '<i class="ti ti-flower"></i>',       title: "Lavender Field",      desc: "ทุ่งลาเวนเดอร์ยามเย็น หมอกสีม่วง โรแมนติก",                        val: "background: lavender field at dusk with soft purple haze and blurred horizon, romantic and fragrant"                                      },
];

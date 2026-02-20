// ==UserScript==
// @name         UNESS – SDD Enhanced (Liste + Pages) — DONE + Notes + Collapse + Font vars (mobile fix)
// @namespace    http://tampermonkey.net/
// @version      5.7
// @description  Liste SDD + redesign pages + case “faite” + notes Markdown (local) + sticky + raccourcis (Ctrl/Cmd+S,B,I,U) + Tab/Shift+Tab + encarts minimisables (persistant) + tailles de police via constantes + FIX mobile (media query sans var())
// @author       You
// @match        https://livret.uness.fr/lisa/2025/Cat%C3%A9gorie:Situation_de_d%C3%A9part
// @match        https://livret.uness.fr/lisa/2025/Cat*gorie:Situation_de_d*part
// @match        https://livret.uness.fr/lisa/2025/*_SDD-*
// @grant        GM_setValue
// @grant        GM_getValue
// @homepageURL  https://github.com/WalterHeerdt/UnessLiSA
// @supportURL   https://github.com/WalterHeerdt/UnessLiSA/issues
// @downloadURL  https://raw.githubusercontent.com/WalterHeerdt/UnessLiSA/main/uness-sdd-enhanced.user.js
// @updateURL    https://raw.githubusercontent.com/WalterHeerdt/UnessLiSA/main/uness-sdd-enhanced.user.js

// ==/UserScript==

(async function () {
  'use strict';
  const SDD_TAGS = {1:["Hépato-Gastro-Entérologie"],2:["Hépato-Gastro-Entérologie","Maladies Infectieuses et Tropicales"],3:["Chirurgie Viscérale et Digestive","Médecine d'Urgence"],4:["Médecine d'Urgence","Chirurgie Viscérale et Digestive"],5:["Hépato-Gastro-Entérologie"],6:["Hépato-Gastro-Entérologie","Médecine Interne Immunologie"],7:["Hépato-Gastro-Entérologie","MPR"],8:["Hépato-Gastro-Entérologie","Oncologie"],9:["Chirurgie Viscérale et Digestive"],10:["Médecine d'Urgence","Hépato-Gastro-Entérologie"],11:["Pédiatrie"],12:["Médecine d'Urgence","Gériatrie"],13:["Médecine d'Urgence","Hépato-Gastro-Entérologie"],14:["Médecine d'Urgence","Hépato-Gastro-Entérologie"],15:["Médecine Vasculaire","Médecine Cardiovasculaire"],16:["Médecine Interne Immunologie","Hématologie"],17:["Médecine Interne Immunologie","Oncologie"],18:["Médecine Cardiovasculaire"],19:["Médecine Vasculaire","Chirurgie Vasculaire"],20:["Pneumologie","Médecine d'Urgence"],21:["Médecine Interne Immunologie"],22:["Néphrologie","Médecine d'Urgence"],23:["Urologie"],24:["Endocrinologie - Diabétologie - Nutrition","Gynécologie Médicale"],25:["Endocrinologie - Diabétologie - Nutrition"],26:["Pédiatrie","Endocrinologie - Diabétologie - Nutrition"],27:["Gériatrie","Médecine d'Urgence"],28:["Médecine Intensive Réanimation","Neurologie"],29:["Neurologie"],30:["Endocrinologie - Diabétologie - Nutrition","Gériatrie"],31:["Gériatrie","Neurologie"],32:["Pédiatrie","Médecine d'Urgence"],33:["Gynécologie Médicale"],34:["Anesthésie Réanimation"],35:["MPR","Rhumatologie"],36:["Rhumatologie","MPR"],37:["Pédiatrie","Dermatologie Vénérologie"],38:["Médecine d'Urgence","Médecine Intensive Réanimation"],39:["Pédiatrie"],40:["Gynécologie Médicale","Endocrinologie - Diabétologie - Nutrition"],41:["Endocrinologie - Diabétologie - Nutrition","Chirurgie Plastique"],42:["Médecine Cardiovasculaire"],43:["Médecine d'Urgence","Médecine Cardiovasculaire"],44:["Médecine d'Urgence","Maladies Infectieuses et Tropicales"],45:["Médecine d'Urgence","Médecine Intensive Réanimation"],46:["Pédiatrie","Médecine d'Urgence"],47:["Hépato-Gastro-Entérologie"],48:["Pédiatrie"],49:["Médecine d'Urgence"],50:["Médecine d'Urgence","Neurologie"],51:["Endocrinologie - Diabétologie - Nutrition"],52:["ORL - CCF","Hépato-Gastro-Entérologie"],53:["Gynécologie Obstétrique"],54:["Médecine Interne Immunologie","Néphrologie"],55:["Pédiatrie","Hématologie"],56:["Rhumatologie"],57:["Endocrinologie - Diabétologie - Nutrition"],58:["Hématologie","Médecine Interne Immunologie"],59:["Hématologie"],60:["Médecine d'Urgence","Anesthésie Réanimation"],61:["Endocrinologie - Diabétologie - Nutrition","Néphrologie"],62:["ORL - CCF","Neurologie"],63:["Urologie"],64:["ORL - CCF","Neurologie"],65:["Chirurgie Orthopédique et Traumatologique","Rhumatologie"],66:["Neurologie","MPR"],67:["Rhumatologie"],68:["Chirurgie Orthopédique et Traumatologique","Pédiatrie"],69:["Médecine Vasculaire","Chirurgie Vasculaire"],70:["Rhumatologie","Chirurgie Orthopédique et Traumatologique"],71:["Chirurgie Orthopédique et Traumatologique","Médecine d'Urgence"],72:["Rhumatologie","Chirurgie Orthopédique et Traumatologique"],73:["Neurologie"],74:["Neurologie"],75:["Chirurgie Orthopédique et Traumatologique"],76:["Médecine Vasculaire"],77:["Médecine Interne Immunologie","Rhumatologie"],78:["Dermatologie Vénérologie"],79:["Endocrinologie - Diabétologie - Nutrition","Gynécologie Médicale"],80:["Dermatologie Vénérologie"],81:["Dermatologie Vénérologie"],82:["Dermatologie Vénérologie"],83:["Chirurgie Plastique"],84:["Dermatologie Vénérologie"],85:["Dermatologie Vénérologie"],86:["Gériatrie","MPR"],87:["Médecine d'Urgence","Maladies Infectieuses et Tropicales"],88:["Dermatologie Vénérologie","Allergologie"],89:["Hématologie","Médecine Interne Immunologie"],90:["Pédiatrie","Dermatologie Vénérologie"],91:["Dermatologie Vénérologie","ORL - CCF"],92:["Dermatologie Vénérologie","Médecine Vasculaire"],93:["Dermatologie Vénérologie","Maladies Infectieuses et Tropicales"],94:["Gynécologie Médicale"],95:["Hépato-Gastro-Entérologie","Urologie"],96:["Urologie","Maladies Infectieuses et Tropicales"],97:["Urologie","Médecine d'Urgence"],98:["Gynécologie Obstétrique"],99:["Gynécologie Obstétrique","Urologie"],100:["Urologie","Médecine d'Urgence"],101:["Urologie","Maladies Infectieuses et Tropicales"],102:["Urologie"],103:["Urologie","Gériatrie"],104:["Gynécologie Médicale"],105:["Gynécologie Obstétrique","Urologie"],106:["Gynécologie Obstétrique","Oncologie"],107:["Gynécologie Obstétrique","Urologie"],108:["Urologie"],109:["Gynécologie Obstétrique"],110:["Gynécologie Obstétrique","Anesthésie Réanimation"],111:["Gynécologie Obstétrique","Médecine d'Urgence"],112:["Gynécologie Médicale","Gynécologie Obstétrique"],113:["Pédiatrie","Endocrinologie - Diabétologie - Nutrition"],114:["Psychiatrie","Médecine d'Urgence"],115:["Pédiatrie","Neurologie"],116:["Psychiatrie"],117:["Psychiatrie","Gériatrie"],118:["Neurologie","Médecine d'Urgence"],119:["Gériatrie","Médecine d'Urgence"],120:["Neurologie","Médecine d'Urgence"],121:["Neurologie","Médecine d'Urgence"],122:["Psychiatrie"],123:["Psychiatrie"],124:["Psychiatrie"],125:["Psychiatrie"],126:["Neurologie"],127:["ORL - CCF","Neurologie"],128:["Neurologie"],129:["Psychiatrie","Neurologie"],130:["Neurologie","ORL - CCF"],131:["Gériatrie","Neurologie"],132:["Psychiatrie","Endocrinologie - Diabétologie - Nutrition"],133:["Pédiatrie","Psychiatrie"],134:["ORL - CCF","Neurologie"],135:["Psychiatrie","Neurologie"],136:["Psychiatrie"],137:["Psychiatrie","Gynécologie Obstétrique"],138:["Ophtalmologie","Neurologie"],139:["Ophtalmologie","Chirurgie Plastique"],140:["ORL - CCF"],141:["Ophtalmologie"],142:["ORL - CCF","Médecine d'Urgence"],143:["Ophtalmologie","Neurologie"],144:["ORL - CCF","CMF"],145:["ORL - CCF"],146:["ORL - CCF"],147:["ORL - CCF","Médecine d'Urgence"],148:["Endocrinologie - Diabétologie - Nutrition","Chirurgie Viscérale et Digestive"],149:["Médecine d'Urgence","ORL - CCF"],150:["CMF","Chirurgie Orale"],151:["ORL - CCF","Médecine d'Urgence"],152:["Ophtalmologie","Médecine d'Urgence"],153:["ORL - CCF"],154:["ORL - CCF"],155:["ORL - CCF","Allergologie"],156:["ORL - CCF"],157:["Ophtalmologie","Pédiatrie"],158:["ORL - CCF","CMF"],159:["Médecine Cardiovasculaire","Médecine d'Urgence"],160:["Médecine d'Urgence","Médecine Intensive Réanimation"],161:["Médecine d'Urgence","Médecine Cardiovasculaire"],162:["Médecine d'Urgence","Pneumologie"],163:["Pneumologie","Maladies Infectieuses et Tropicales"],164:["Gynécologie Médicale","Oncologie"],165:["Médecine Cardiovasculaire","Médecine d'Urgence"],166:["Médecine d'Urgence","Médecine Cardiovasculaire"],167:["Pneumologie","Médecine d'Urgence"],168:["Médecine d'Urgence","Chirurgie Plastique"],169:["Médecine d'Urgence","Maladies Infectieuses et Tropicales"],170:["Médecine d'Urgence","Chirurgie Plastique"],171:["Médecine d'Urgence","Chirurgie Viscérale et Digestive"],172:["Médecine d'Urgence","Neurochirurgie"],173:["Médecine d'Urgence","Chirurgie Orthopédique et Traumatologique"],174:["Médecine d'Urgence","CMF"],175:["Médecine d'Urgence","Neurochirurgie"],176:["Médecine d'Urgence","Médecine Intensive Réanimation"],177:["Médecine d'Urgence","Chirurgie Thoracique et Cardiovasculaire"],178:["Radiologie et Imagerie Médicale"],179:["Anatomie et Cytologie Pathologiques"],180:["Anatomie et Cytologie Pathologiques"],181:["Anatomie et Cytologie Pathologiques","Oncologie"],182:["Biologie Médicale","Urologie"],183:["Biologie Médicale","Neurologie"],184:["ORL - CCF"],185:["Médecine Cardiovasculaire"],186:["Médecine Interne Immunologie","Maladies Infectieuses et Tropicales"],187:["Biologie Médicale","Maladies Infectieuses et Tropicales"],188:["Maladies Infectieuses et Tropicales","Biologie Médicale"],189:["Biologie Médicale","Urologie"],190:["Biologie Médicale","Maladies Infectieuses et Tropicales"],191:["Biologie Médicale","Hépato-Gastro-Entérologie"],192:["Médecine Intensive Réanimation","Biologie Médicale"],193:["Biologie Médicale","Hématologie"],194:["Endocrinologie - Diabétologie - Nutrition"],195:["Médecine Cardiovasculaire","Endocrinologie - Diabétologie - Nutrition"],196:["Biologie Médicale","Néphrologie"],197:["Néphrologie","Biologie Médicale"],198:["Hépato-Gastro-Entérologie"],199:["Néphrologie"],200:["Endocrinologie - Diabétologie - Nutrition","Néphrologie"],201:["Néphrologie"],202:["Néphrologie","Médecine Intensive Réanimation"],203:["Allergologie","Dermatologie Vénérologie"],204:["Médecine Cardiovasculaire","Médecine d'Urgence"],205:["Hépato-Gastro-Entérologie","Médecine d'Urgence"],206:["Hépato-Gastro-Entérologie"],207:["Hématologie","Médecine Interne Immunologie"],208:["Endocrinologie - Diabétologie - Nutrition","Médecine d'Urgence"],209:["Endocrinologie - Diabétologie - Nutrition","Médecine d'Urgence"],210:["Hématologie","Médecine Interne Immunologie"],211:["Hépato-Gastro-Entérologie","Néphrologie"],212:["Néphrologie"],213:["Hématologie"],214:["Hématologie"],215:["Hématologie"],216:["Hématologie"],217:["Hématologie"],218:["Hématologie","Hépato-Gastro-Entérologie"],219:["Allergologie","Hématologie"],220:["Hématologie"],221:["Hématologie"],222:["Hématologie"],223:["Hématologie"],224:["Radiologie et Imagerie Médicale","Hépato-Gastro-Entérologie"],225:["Radiologie et Imagerie Médicale","ORL - CCF"],226:["Radiologie et Imagerie Médicale","Neurologie"],227:["Radiologie et Imagerie Médicale","Neurochirurgie"],228:["Radiologie et Imagerie Médicale","Chirurgie Orthopédique et Traumatologique"],229:["Radiologie et Imagerie Médicale","Gynécologie Obstétrique"],230:["Radiologie et Imagerie Médicale","Médecine Cardiovasculaire"],231:["Radiologie et Imagerie Médicale"],232:["Radiologie et Imagerie Médicale"],233:["Radiologie et Imagerie Médicale"],234:["Maladies Infectieuses et Tropicales","Biologie Médicale"],235:["Maladies Infectieuses et Tropicales","Santé Publique"],236:["Biologie Médicale","Maladies Infectieuses et Tropicales"],237:["Médecine d'Urgence","Médecine Légale et Expertise médicale"],238:["Hépato-Gastro-Entérologie","Pneumologie"],239:["Anesthésie Réanimation"],240:["Psychiatrie"],241:["Médecine d'Urgence","Psychiatrie"],242:["Pneumologie","Addictologie"],243:["Chirurgie Orthopédique et Traumatologique"],244:["Psychiatrie","Médecine d'Urgence"],245:["MPR","Chirurgie Orthopédique et Traumatologique"],246:["Médecine Générale","Santé Publique"],247:["MPR"],248:["Médecine Cardiovasculaire","Hématologie"],249:["Rhumatologie"],250:["Anesthésie Réanimation"],251:["Médecine Interne Immunologie"],252:["Médecine Cardiovasculaire"],253:["Médecine Cardiovasculaire","Néphrologie"],254:["Oncologie"],255:["Maladies Infectieuses et Tropicales"],256:["Psychiatrie"],257:["Gynécologie Médicale"],258:["Anesthésie Réanimation"],259:["Médecine d'Urgence","Anesthésie Réanimation"],260:["MPR","Rhumatologie"],261:["Pédiatrie","Anesthésie Réanimation"],262:["Maladies Infectieuses et Tropicales","Médecine d'Urgence"],263:["Dermatologie Vénérologie","Maladies Infectieuses et Tropicales"],264:["Médecine Interne Immunologie","Néphrologie"],265:["Pédiatrie"],266:["Gériatrie","Médecine Interne Immunologie"],267:["Médecine Interne Immunologie","Gériatrie"],268:["Gynécologie Obstétrique"],269:["Psychiatrie"],270:["Endocrinologie - Diabétologie - Nutrition"],271:["Anesthésie Réanimation","Médecine Intensive Réanimation"],272:["Anesthésie Réanimation","Hématologie"],273:["Pédiatrie","Gynécologie Obstétrique"],274:["Maladies Infectieuses et Tropicales","Pneumologie"],275:["Hématologie"],276:["Gériatrie","MPR"],277:["Rhumatologie","MPR"],278:["Gynécologie Médicale","Endocrinologie - Diabétologie - Nutrition"],279:["Médecine Interne Immunologie"],280:["Endocrinologie - Diabétologie - Nutrition"],281:["Endocrinologie - Diabétologie - Nutrition"],282:["Médecine Cardiovasculaire"],283:["Pneumologie"],284:["Endocrinologie - Diabétologie - Nutrition"],285:["Médecine Cardiovasculaire"],286:["Pneumologie"],287:["Médecine Cardiovasculaire"],288:["Psychiatrie"],289:["Neurologie"],290:["Néphrologie"],291:["Médecine Interne Immunologie","Maladies Infectieuses et Tropicales"],292:["Psychiatrie"],293:["Psychiatrie"],294:["Gynécologie Médicale"],295:["Gériatrie"],296:["Pédiatrie"],297:["Oncologie"],298:["Neurologie","Gériatrie"],299:["Allergologie"],300:["Anesthésie Réanimation"],301:["Maladies Infectieuses et Tropicales","Pneumologie"],302:["Maladies Infectieuses et Tropicales"],303:["Santé Publique","Oncologie"],304:["Gynécologie Obstétrique","Endocrinologie - Diabétologie - Nutrition"],305:["Maladies Infectieuses et Tropicales","Gynécologie Médicale"],306:["Rhumatologie","Gériatrie"],307:["Gynécologie Obstétrique","Génétique Médicale"],308:["Pédiatrie","Santé Publique"],309:["Psychiatrie","Médecine d'Urgence"],310:["Maladies Infectieuses et Tropicales","Santé Publique"],311:["Santé Publique","Maladies Infectieuses et Tropicales"],312:["Gynécologie Obstétrique"],313:["Santé Publique"],314:["Santé Publique","Pneumologie"],315:["Médecine et Santé au Travail"],316:["Médecine et Santé au Travail","MPR"],317:["Gynécologie Médicale","Santé Publique"],318:["Pédiatrie","Santé Publique"],319:["Santé Publique","Endocrinologie - Diabétologie - Nutrition"],320:["Santé Publique","Médecine Cardiovasculaire"],321:["Pédiatrie","Médecine Légale et Expertise médicale"],322:["Santé Publique","Maladies Infectieuses et Tropicales"],323:["Pédiatrie","Santé Publique"],324:["Endocrinologie - Diabétologie - Nutrition","Santé Publique"],325:["Santé Publique","Pédiatrie"],326:["Médecine et Santé au Travail","Médecine d'Urgence"],327:["Oncologie","Médecine Interne Immunologie"],328:["Médecine Interne Immunologie"],329:["Santé Publique","Médecine Légale et Expertise médicale"],330:["Gériatrie","Santé Publique"],331:["Médecine Légale et Expertise médicale"],332:["Gynécologie Obstétrique"],333:["Médecine Légale et Expertise médicale","Médecine d'Urgence"],334:["Santé Publique","Médecine Interne Immunologie"],335:["Médecine Cardiovasculaire"],336:["Maladies Infectieuses et Tropicales","Médecine d'Urgence"],337:["Oncologie","Médecine Interne Immunologie"],338:["Santé Publique"],339:["Médecine et Santé au Travail"],340:["Médecine d'Urgence","Médecine Intensive Réanimation"],341:["Psychiatrie","Médecine d'Urgence"],342:["Santé Publique"],343:["Médecine Légale et Expertise médicale","Santé Publique"],344:["Psychiatrie","Médecine et Santé au Travail"],345:["MPR","Santé Publique"],346:["Santé Publique","Médecine d'Urgence"],347:["Santé Publique"],348:["Médecine Interne Immunologie"],349:["Psychiatrie"],350:["Médecine Légale et Expertise médicale","Gynécologie Obstétrique"],351:["Médecine Légale et Expertise médicale","Médecine d'Urgence"],352:["Santé Publique"],353:["MPR","Médecine Cardiovasculaire"],354:["Santé Publique"],355:["Santé Publique","Gériatrie"],356:["Anesthésie Réanimation"]};

  // ──────────────────────────────────────────────────────────────────────────
  // CONFIG (facile à changer)
  // ──────────────────────────────────────────────────────────────────────────
  const CFG = {
    // Police (Google Fonts)
    fontFamily: 'Inter', // ex: 'Source Sans 3', 'IBM Plex Sans'
    fontWeights: [400, 500, 600, 700, 800],

    // Tailles (px) -> variables CSS
    fsBase: 16,
    fsSmall: 14,
    fsTiny: 12,
    fsTitle: 26,
    fsH1: 24,
    fsH2: 22,
    fsH3: 20,
    fsH4: 18,
    fsRow: 16,
    fsRowNum: 13,
    fsChip: 14,
    fsTable: 15,
    fsNotes: 13,

    // Weights
    fwBase: 400,
    fwMedium: 500,
    fwSemibold: 600,
    fwBold: 700,
    fwHeavy: 800,

    // Layout
    notesColWidth: 420,     // px colonne notes (desktop)
    railsMin: 14,           // px padding min
    railsMax: 48,           // px padding max
    breakpointOneCol: 980,  // px -> mobile/1-col (IMPORTANT: utilisé en dur dans @media)
    stickyTop: 14,          // px

    // Cache liste
    cacheTTLms: 48 * 60 * 60 * 1000,

    // Notes
    autosaveDelay: 250,     // ms
    indentSpaces: 2,
  };

  const BASE      = 'https://livret.uness.fr';
  const CACHE_KEY = 'uness_sdd_v5';
  const CACHE_TS  = 'uness_sdd_ts_v5';
  const CACHE_TTL = CFG.cacheTTLms;

  // ──────────────────────────────────────────────────────────────────────────
  // DONE + NOTES + COLLAPSE (local Tampermonkey storage)
  // ──────────────────────────────────────────────────────────────────────────
  const DONE_PREFIX      = 'uness_sdd_done_v1_';      // uness_sdd_done_v1_###
  const NOTES_PREFIX     = 'uness_sdd_notes_v1_';     // uness_sdd_notes_v1_###
  const COLLAPSE_PREFIX  = 'uness_sdd_collapse_v1_';  // uness_sdd_collapse_v1_<key>

  const pad3 = (n) => String(parseInt(n, 10)).padStart(3, '0');
  const doneKey  = (n) => DONE_PREFIX + pad3(n);
  const notesKey = (n) => NOTES_PREFIX + pad3(n);

  const isDone   = (n) => !!GM_getValue(doneKey(n), false);
  const setDone  = (n, v) => GM_setValue(doneKey(n), !!v);

  const getNotes = (n) => GM_getValue(notesKey(n), '');
  const setNotes = (n, md) => GM_setValue(notesKey(n), String(md ?? ''));

  const isCollapsedKey = (key) => !!GM_getValue(COLLAPSE_PREFIX + key, false);
  const setCollapsedKey = (key, v) => GM_setValue(COLLAPSE_PREFIX + key, !!v);

  // ──────────────────────────────────────────────────────────────────────────
  // TAGS (non réécrits)
  // - Collez ici votre const SDD_TAGS = {...} si besoin.
  // - Sans tags => pas de select spécialité / pills.
  // ──────────────────────────────────────────────────────────────────────────
  // const SDD_TAGS = { ... };

  // ──────────────────────────────────────────────────────────────────────────
  // Colors for families/tags
  // ──────────────────────────────────────────────────────────────────────────
  const PALETTE = [
    { pill: '#e0e7ff', text: '#4338ca', dot: '#6366f1' },
    { pill: '#fce7f3', text: '#be185d', dot: '#ec4899' },
    { pill: '#d1fae5', text: '#065f46', dot: '#10b981' },
    { pill: '#fff7ed', text: '#9a3412', dot: '#f97316' },
    { pill: '#ede9fe', text: '#5b21b6', dot: '#8b5cf6' },
    { pill: '#cffafe', text: '#155e75', dot: '#06b6d4' },
    { pill: '#fef9c3', text: '#713f12', dot: '#d97706' },
    { pill: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
    { pill: '#f0fdf4', text: '#14532d', dot: '#22c55e' },
    { pill: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
  ];
  const familyColorCache = {};
  function getFamilyColor(f) {
    if (!f) return PALETTE[9];
    if (familyColorCache[f]) return familyColorCache[f];
    let h = 5381;
    for (let i = 0; i < f.length; i++) h = ((h << 5) + h) ^ f.charCodeAt(i);
    const color = PALETTE[Math.abs(h) % (PALETTE.length - 1)];
    familyColorCache[f] = color;
    return color;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Utils
  // ──────────────────────────────────────────────────────────────────────────
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function googleFontLink(family, weights){
    const fam = encodeURIComponent(family).replace(/%20/g, '+');
    const w = (weights || [400,500,600,700]).join(';');
    return `https://fonts.googleapis.com/css2?family=${fam}:wght@${w}&display=swap`;
  }

  function cssVarsRoot() {
    return `
      :root{
        --bg:#f1f5f9; --surface:#ffffff; --surface2:#f8fafc;
        --border:#e2e8f0; --border2:#cbd5e1;
        --text:#0f172a; --text2:#334155; --muted:#94a3b8;
        --ac:#4f46e5; --ac-light:#eef2ff;
        --r:12px;
        --sh:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
        --sh2:0 10px 26px rgba(0,0,0,.10);

        --ff:'${escapeHtml(CFG.fontFamily)}',system-ui,sans-serif;

        --fs-base:${CFG.fsBase}px;
        --fs-small:${CFG.fsSmall}px;
        --fs-tiny:${CFG.fsTiny}px;
        --fs-title:${CFG.fsTitle}px;
        --fs-h1:${CFG.fsH1}px;
        --fs-h2:${CFG.fsH2}px;
        --fs-h3:${CFG.fsH3}px;
        --fs-h4:${CFG.fsH4}px;
        --fs-row:${CFG.fsRow}px;
        --fs-rownum:${CFG.fsRowNum}px;
        --fs-chip:${CFG.fsChip}px;
        --fs-table:${CFG.fsTable}px;
        --fs-notes:${CFG.fsNotes}px;

        --fw-base:${CFG.fwBase};
        --fw-med:${CFG.fwMedium};
        --fw-semi:${CFG.fwSemibold};
        --fw-bold:${CFG.fwBold};
        --fw-heavy:${CFG.fwHeavy};

        --notes-col:${CFG.notesColWidth}px;
        --rails-min:${CFG.railsMin}px;
        --rails-max:${CFG.railsMax}px;
      }
    `;
  }

  // Minimal Markdown preview (subset)
  function mdToHtml(md){
    let s = escapeHtml(md || '');

    // underline (custom): __text__
    s = s.replace(/__([^_]+)__/g, '<u>$1</u>');

    // inline code
    s = s.replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:10px;border:1px solid #e2e8f0;">$1</code>');

    // bold / italic
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // links [txt](url)
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#4f46e5;text-decoration:none;font-weight:var(--fw-bold)">$1</a>'
    );

    // headings (sizes driven by CSS variables)
    s = s.replace(/^######\s(.+)$/gm, '<h6 style="margin:.65rem 0 .3rem;font-size:var(--fs-small);color:#0f172a">$1</h6>');
    s = s.replace(/^#####\s(.+)$/gm, '<h5 style="margin:.75rem 0 .35rem;font-size:var(--fs-h4);color:#0f172a">$1</h5>');
    s = s.replace(/^####\s(.+)$/gm, '<h4 style="margin:.85rem 0 .4rem;font-size:var(--fs-h3);color:#0f172a">$1</h4>');
    s = s.replace(/^###\s(.+)$/gm, '<h3 style="margin:.95rem 0 .45rem;font-size:var(--fs-h2);color:#0f172a">$1</h3>');
    s = s.replace(/^##\s(.+)$/gm, '<h2 style="margin:1.05rem 0 .5rem;font-size:var(--fs-h1);color:#0f172a">$1</h2>');
    s = s.replace(/^#\s(.+)$/gm, '<h1 style="margin:1.15rem 0 .55rem;font-size:var(--fs-title);color:#0f172a">$1</h1>');

    // lists
    s = s.replace(/^(?:- |\* )(.*)$/gm, '<li>$1</li>');
    s = s.replace(/(<li>.*<\/li>\n?)+/g, m =>
      `<ul style="margin:.45rem 0 .9rem 1.25rem;list-style:disc;color:#334155;line-height:1.65;font-size:var(--fs-base)">${m}</ul>`
    );

    // paragraphs
    s = s.split(/\n{2,}/).map(block => {
      const t = block.trim();
      if (!t) return '';
      if (t.startsWith('<h') || t.startsWith('<ul')) return block;
      const b = block.replace(/\n/g, '<br>');
      return `<p style="margin:.55rem 0;color:#334155;line-height:1.7;font-size:var(--fs-base)">${b}</p>`;
    }).join('');

    return s || '<p style="color:#94a3b8;margin:0">Aucune note.</p>';
  }

  // Textarea helpers
  function wrapSelection(textarea, left, right) {
    const start = textarea.selectionStart ?? 0;
    const end   = textarea.selectionEnd ?? 0;
    const val   = textarea.value ?? '';
    const sel   = val.slice(start, end);

    textarea.value = val.slice(0, start) + left + sel + right + val.slice(end);

    if (sel.length) {
      textarea.selectionStart = start + left.length;
      textarea.selectionEnd   = start + left.length + sel.length;
    } else {
      const caret = start + left.length;
      textarea.selectionStart = textarea.selectionEnd = caret;
    }
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function indentSelection(textarea, spaces = CFG.indentSpaces) {
    const start = textarea.selectionStart ?? 0;
    const end   = textarea.selectionEnd ?? 0;
    const val   = textarea.value ?? '';
    const sel   = val.slice(start, end);
    const pref = ' '.repeat(spaces);

    if (!sel) {
      textarea.value = val.slice(0, start) + pref + val.slice(end);
      textarea.selectionStart = textarea.selectionEnd = start + pref.length;
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }

    const lines = sel.split('\n');
    const out = lines.map(l => pref + l).join('\n');
    textarea.value = val.slice(0, start) + out + val.slice(end);
    textarea.selectionStart = start;
    textarea.selectionEnd   = start + out.length;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function outdentSelection(textarea, spaces = CFG.indentSpaces) {
    const start = textarea.selectionStart ?? 0;
    const end   = textarea.selectionEnd ?? 0;
    const val   = textarea.value ?? '';
    const sel   = val.slice(start, end);
    if (!sel) return;

    const pref = ' '.repeat(spaces);
    const lines = sel.split('\n');
    const out = lines.map(l => l.startsWith(pref) ? l.slice(spaces) : (l.startsWith(' ') ? l.slice(1) : l)).join('\n');

    textarea.value = val.slice(0, start) + out + val.slice(end);
    textarea.selectionStart = start;
    textarea.selectionEnd   = start + out.length;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Safe tags getter (works even if SDD_TAGS not pasted)
  function tagsForNum(n) {
    try {
      // eslint-disable-next-line no-undef
      if (typeof SDD_TAGS !== 'undefined' && SDD_TAGS && SDD_TAGS[n]) return SDD_TAGS[n];
    } catch (_) {}
    return [];
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Routing
  // ──────────────────────────────────────────────────────────────────────────
  const path   = window.location.pathname;
  const isList = path.includes('Cat') && path.includes('Situation_de_d');
  const isSDD  = /SDD-\d+/.test(path) && !isList;

  if (isList) {
    showLoading();
    try { buildListUI(await getData()); } catch (e) { showError(e); }
  } else if (isSDD) {
    redesignSDDPage();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Data (liste SDD)
  // ──────────────────────────────────────────────────────────────────────────
  async function getData() {
    const ts = GM_getValue(CACHE_TS, 0);
    let pageItems;

    if (Date.now() - ts < CACHE_TTL) {
      try {
        const c = GM_getValue(CACHE_KEY, null);
        if (c) pageItems = JSON.parse(c);
      } catch (_) {}
    }

    if (!pageItems) {
      pageItems = await fetchPageItems();
      GM_setValue(CACHE_KEY, JSON.stringify(pageItems));
      GM_setValue(CACHE_TS, Date.now());
    }

    return pageItems.map(item => {
      const tags = tagsForNum(item.num);
      return {
        ...item,
        tags,
        family: (tags || [])[0] || '',
        done: isDone(item.num),
      };
    });
  }

  async function fetchPageItems() {
    async function getPage(url, ref) {
      const r = await fetch(url, {
        credentials: 'include',
        headers: { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
        referrer: ref, method: 'GET', mode: 'cors'
      });
      return r.text();
    }

    function parse(html) {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const out = [];
      doc.querySelectorAll('#mw-pages li a').forEach(a => {
        const title = a.getAttribute('title') || a.textContent.trim();
        const m = title.match(/SDD-(\d+)/i);
        if (!m) return;
        out.push({
          title,
          href: BASE + a.getAttribute('href'),
          num: parseInt(m[1], 10),
          name: title.replace(/\s*SDD-\d+\s*/i, '').trim()
        });
      });
      return out;
    }

    const [h1, h2] = await Promise.all([
      getPage(BASE + '/lisa/2025/Cat%C3%A9gorie:Situation_de_d%C3%A9part', BASE + '/lisa/2025/Accueil'),
      getPage(
        BASE + '/lisa/2025/index.php?title=Cat%C3%A9gorie:Situation_de_d%C3%A9part&pagefrom=Leucorrh%C3%A9es+SDD-104#mw-pages',
        BASE + '/lisa/2025/Cat%C3%A9gorie:Situation_de_d%C3%A9part'
      )
    ]);

    const seen = new Set();
    return [...parse(h1), ...parse(h2)].filter(i => {
      if (seen.has(i.num)) return false;
      seen.add(i.num);
      return true;
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // LIST UI
  // ──────────────────────────────────────────────────────────────────────────
  function showLoading() {
    document.head.innerHTML = '<meta charset="UTF-8"><title>SDD…</title>';
    document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;
      min-height:100vh;background:#f8fafc;flex-direction:column;gap:14px;font-family:sans-serif;">
      <div style="width:38px;height:38px;border:3px solid #e2e8f0;border-top-color:#6366f1;
        border-radius:50%;animation:s .7s linear infinite;"></div>
      <p style="color:#94a3b8;font-size:14px;letter-spacing:.3px;">Chargement…</p>
      <style>@keyframes s{to{transform:rotate(360deg)}}</style></div>`;
  }

  function showError(e) {
    document.body.innerHTML = `<div style="padding:40px;font-family:sans-serif;background:#f8fafc;min-height:100vh;">
      <h2 style="color:#ef4444;font-size:18px;">Erreur de chargement</h2>
      <p style="margin-top:10px;color:#64748b;font-size:14px;">${escapeHtml(e?.message || String(e))}</p>
      <p style="margin-top:6px;color:#94a3b8;font-size:13px;">Vérifiez que vous êtes connecté à LISA.</p></div>`;
  }

  function buildListUI(items) {
    const allTags = new Set();
    items.forEach(i => (i.tags || []).forEach(t => allTags.add(t)));
    const families = [...allTags].sort((a,b)=>a.localeCompare(b,'fr'));
    const hasFamilies = families.length > 0;

    document.title = 'SDD · LISA 2025';
    document.head.innerHTML = `<meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>SDD · LISA 2025</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="${googleFontLink(CFG.fontFamily, CFG.fontWeights)}" rel="stylesheet">
      <style>
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      ${cssVarsRoot()}
      html,body{background:var(--bg);color:var(--text);height:100%;
        font-family:var(--ff);font-size:var(--fs-base);font-weight:var(--fw-base);overflow-x:hidden}

      header{
        background:var(--surface);border-bottom:1px solid var(--border);
        padding:18px 40px;display:flex;align-items:center;gap:14px;box-shadow:var(--sh);
      }
      .h-badge{
        background:var(--ac);color:#fff;font-size:var(--fs-tiny);font-weight:var(--fw-bold);
        letter-spacing:.9px;text-transform:uppercase;padding:5px 10px;border-radius:10px;flex-shrink:0;
      }
      header h1{font-size:calc(var(--fs-base) + 1px);font-weight:var(--fw-semi);color:var(--text);letter-spacing:-.2px}
      header span{font-size:var(--fs-small);color:var(--muted);margin-left:10px;font-weight:var(--fw-med)}
      .h-back{
        margin-left:auto;color:var(--muted);text-decoration:none;font-size:var(--fs-small);
        padding:8px 12px;border:1px solid var(--border);border-radius:var(--r);
        transition:all .15s;background:var(--surface2);font-weight:var(--fw-med);
      }
      .h-back:hover{color:var(--text);border-color:var(--border2);background:#fff}

      .ctrl{
        position:sticky;top:0;z-index:200;
        background:rgba(241,245,249,.97);backdrop-filter:blur(9px);
        border-bottom:1px solid var(--border);
        padding:12px 40px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;
      }
      .sw{position:relative;flex:1;min-width:220px;max-width:420px}
      .sw svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none}
      #search{
        width:100%;padding:10px 11px 10px 34px;background:#fff;
        border:1px solid var(--border);border-radius:var(--r);
        color:var(--text);font-size:var(--fs-small);outline:none;
        transition:border-color .2s, box-shadow .2s;font-family:inherit;
      }
      #search::placeholder{color:var(--muted)}
      #search:focus{border-color:var(--ac);box-shadow:0 0 0 4px #4f46e518}

      select{
        padding:10px 12px;background:#fff;border:1px solid var(--border);
        border-radius:var(--r);color:var(--text2);font-size:var(--fs-small);
        outline:none;cursor:pointer;font-family:inherit;max-width:320px;
      }
      select:focus{border-color:var(--ac);box-shadow:0 0 0 4px #4f46e515}

      .sb{display:flex;gap:6px}
      .sb button{
        padding:9px 12px;background:#fff;border:1px solid var(--border);
        border-radius:var(--r);color:var(--muted);font-size:var(--fs-small);
        cursor:pointer;transition:all .12s;white-space:nowrap;font-family:inherit;font-weight:var(--fw-med);
      }
      .sb button:hover{color:var(--text);border-color:var(--border2)}
      .sb button.on{background:var(--ac);color:#fff;border-color:var(--ac);box-shadow:0 6px 16px #4f46e330}

      #stats{font-size:var(--fs-small);color:var(--muted);white-space:nowrap;margin-left:auto;font-weight:var(--fw-med)}
      #btn-rf{
        padding:9px 12px;background:transparent;border:1px solid var(--border);
        border-radius:var(--r);color:var(--muted);font-size:var(--fs-small);cursor:pointer;
        transition:all .15s;font-family:inherit;font-weight:var(--fw-med);
      }
      #btn-rf:hover{color:#ef4444;border-color:#fca5a5;background:#fff5f5}

      main{padding:22px 40px 70px}
      #list{display:flex;flex-direction:column;gap:8px}

      .row{
        display:grid;
        grid-template-columns: 92px 10px 1fr auto 36px 16px;
        align-items:center;gap:12px;
        padding:12px 16px;
        background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
        text-decoration:none;color:var(--text);
        transition:box-shadow .12s,border-color .12s,background .12s, transform .08s;
        box-shadow:var(--sh);
      }
      .row:hover{border-color:var(--border2);box-shadow:var(--sh2);background:#fafcff; transform:translateY(-1px)}
      .row-num{font-size:var(--fs-rownum);font-weight:var(--fw-bold);color:var(--muted);font-variant-numeric:tabular-nums}
      .row-dot{width:8px;height:8px;border-radius:50%;justify-self:center}
      .row-name{font-size:var(--fs-row);font-weight:var(--fw-med);color:var(--text2);
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
      .row:hover .row-name{color:var(--ac)}
      .row-tags{display:flex;gap:6px;flex-wrap:nowrap;overflow:hidden;justify-content:flex-end}
      .row-pill{font-size:var(--fs-tiny);font-weight:var(--fw-semi);padding:4px 10px;border-radius:999px;white-space:nowrap;flex-shrink:0}
      .row-arr{color:var(--border2);font-size:18px;justify-self:end}
      .row:hover .row-arr{color:var(--ac)}

      .row-ck{
        width:24px;height:24px;border-radius:8px;
        border:1px solid var(--border2);
        display:grid;place-items:center;
        color:transparent;background:#fff;
        cursor:pointer;user-select:none;
        transition:all .12s;
        font-size:16px;font-weight:var(--fw-bold);
      }
      .row-ck:hover{border-color:var(--ac);box-shadow:0 0 0 4px #4f46e515}
      .row-ck.on{
        background:var(--ac);border-color:var(--ac);
        color:#fff;box-shadow:0 6px 16px #4f46e330;
      }
      .row-done .row-name{color:#64748b;text-decoration:line-through}
      .row-done .row-dot{opacity:.55}

      .no-r{text-align:center;padding:70px 20px;color:var(--muted);font-size:var(--fs-base)}

      @media(max-width:640px){
        header,.ctrl,main{padding-left:14px;padding-right:14px}
        .row{grid-template-columns: 86px 10px 1fr 28px 16px}
        .row-tags{display:none}
        select{max-width:240px}
      }
      </style>`;

    document.body.innerHTML = '';

    const hdr = document.createElement('header');
    hdr.innerHTML = `
      <div class="h-badge">LISA 2025</div>
      <h1>Situations de Départ <span id="hdr-total">${items.length} SDD</span></h1>
      <a class="h-back" href="/lisa/2025/Accueil">← Accueil</a>`;
    document.body.appendChild(hdr);

    const ctrl = document.createElement('div');
    ctrl.className = 'ctrl';
    ctrl.innerHTML = `
      <div class="sw">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input id="search" type="text" placeholder="Rechercher une situation…" autocomplete="off" spellcheck="false">
      </div>

      ${hasFamilies ? `<select id="ff">
        <option value="">Toutes les spécialités</option>
        ${families.map(f => `<option value="${escapeHtml(f)}">${escapeHtml(f)}</option>`).join('')}
      </select>` : ''}

      <select id="st">
        <option value="all">Toutes</option>
        <option value="todo">À faire</option>
        <option value="done">Faites</option>
      </select>

      <div class="sb">
        <button class="on" data-s="num">N° ↑</button>
        <button data-s="alpha">A – Z</button>
        ${hasFamilies ? `<button data-s="family">Spécialité</button>` : ''}
      </div>

      <span id="stats"></span>
      <button id="btn-rf" title="Vider le cache et recharger">↺</button>`;
    document.body.appendChild(ctrl);

    const main = document.createElement('main');
    const list = document.createElement('div');
    list.id = 'list';
    main.appendChild(list);
    document.body.appendChild(main);

    let sort = 'num', query = '', status = 'all', family = '';

    function render() {
      items.forEach(i => { i.done = isDone(i.num); });

      const q = query.toLowerCase();
      let filtered = items.filter(item => {
        const tags = item.tags || [];
        const matchQ = !q
          || item.name.toLowerCase().includes(q)
          || tags.some(t => t.toLowerCase().includes(q))
          || String(item.num).includes(q);

        const matchS =
          status === 'all' ||
          (status === 'done' && item.done) ||
          (status === 'todo' && !item.done);

        const matchF = !family || tags.includes(family);

        return matchQ && matchS && matchF;
      });

      if (sort === 'num')   filtered.sort((a,b) => a.num - b.num);
      if (sort === 'alpha') filtered.sort((a,b) => a.name.localeCompare(b.name, 'fr'));
      if (sort === 'family') filtered.sort((a,b) => (a.family||'zzz').localeCompare(b.family||'zzz','fr') || a.num - b.num);

      document.getElementById('stats').textContent = `${filtered.length} / ${items.length}`;

      if (!filtered.length) {
        list.innerHTML = '<div class="no-r">Aucune situation trouvée.</div>';
        return;
      }

      const frag = document.createDocumentFragment();
      filtered.forEach(item => {
        const tags = item.tags || [];
        const c = getFamilyColor(item.family);

        const a = document.createElement('a');
        a.className = 'row';
        a.href = item.href;
        a.classList.toggle('row-done', !!item.done);

        const pillsHTML = tags.slice(0,2).map(t => {
          const tc = getFamilyColor(t);
          return `<span class="row-pill" style="background:${tc.pill};color:${tc.text}">${escapeHtml(t)}</span>`;
        }).join('');

        a.innerHTML = `
          <span class="row-num">SDD-${String(item.num).padStart(3,'0')}</span>
          <span class="row-dot" style="background:${c.dot}"></span>
          <span class="row-name">${escapeHtml(item.name)}</span>
          <span class="row-tags">${pillsHTML}</span>
          <span class="row-ck ${item.done ? 'on' : ''}" title="Marquer comme faite">${item.done ? '✓' : ''}</span>
          <span class="row-arr">›</span>`;

        const ck = a.querySelector('.row-ck');
        ck.addEventListener('click', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          const v = !item.done;
          item.done = v;
          setDone(item.num, v);
          ck.classList.toggle('on', v);
          ck.textContent = v ? '✓' : '';
          a.classList.toggle('row-done', v);
          if (status !== 'all') render();
        });

        frag.appendChild(a);
      });

      list.innerHTML = '';
      list.appendChild(frag);
    }

    document.getElementById('search').addEventListener('input', e => { query = e.target.value; render(); });
    document.getElementById('st').addEventListener('change', e => { status = e.target.value; render(); });
    if (hasFamilies) document.getElementById('ff').addEventListener('change', e => { family = e.target.value; render(); });

    ctrl.querySelectorAll('.sb button').forEach(btn => {
      btn.addEventListener('click', () => {
        ctrl.querySelectorAll('.sb button').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        sort = btn.dataset.s;
        render();
      });
    });

    document.getElementById('btn-rf').addEventListener('click', () => {
      GM_setValue(CACHE_TS, 0);
      location.reload();
    });

    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement?.id !== 'search') {
        e.preventDefault();
        document.getElementById('search').focus();
      }
    });

    render();
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SDD PAGE REDESIGN (FIX mobile)
  // ──────────────────────────────────────────────────────────────────────────
  function redesignSDDPage() {
    const style = document.createElement('style');
    style.textContent = `
      @import url('${googleFontLink(CFG.fontFamily, CFG.fontWeights)}');

      ${cssVarsRoot()}
      html,body{
        background:var(--bg)!important;color:var(--text)!important;
        font-family:var(--ff)!important;
        font-size:var(--fs-base)!important;
        font-weight:var(--fw-base)!important;
        overflow-x:hidden!important;
      }

      /* hide MW chrome */
      #mw-navigation,.p-navbar.not-collapsible,#footer-icons,#footer-places,
      #footer-info,#catlinks,.printfooter,#jump-to-nav,#siteSub,
      .contentHeader{display:none!important}

      .flex-fill.container{max-width:100%!important;padding:0!important}
      .flex-fill.container>.row{flex-direction:column!important}
      .flex-fill.container>.row>.col{padding:0!important}
      #content{border:none!important;background:transparent!important;padding:0!important;margin:0!important;box-shadow:none!important}
      .bodyContent{padding:0!important}

      /* Breadcrumb */
      #sdd-bc{
        background:var(--surface);border-bottom:1px solid var(--border);
        padding:12px 40px;display:flex;align-items:center;gap:8px;
        font-size:var(--fs-small);color:#64748b;
      }
      #sdd-bc a{color:#64748b;text-decoration:none;transition:color .12s;font-weight:var(--fw-med)}
      #sdd-bc a:hover{color:var(--ac)}
      #sdd-bc span{color:var(--border2)}

      /* Top */
      #sdd-top{
        background:var(--surface);border-bottom:1px solid var(--border);
        padding:22px 40px 24px;display:flex;align-items:flex-start;gap:18px;
        box-shadow:0 1px 3px rgba(0,0,0,.06);
      }
      #sdd-top-pill{
        font-size:var(--fs-tiny);font-weight:var(--fw-bold);letter-spacing:.9px;text-transform:uppercase;
        padding:6px 12px;border-radius:10px;background:var(--ac-light);color:var(--ac);
        flex-shrink:0;margin-top:4px;
      }
      #sdd-top-info{flex:1}
      #sdd-top-title{
        font-size:var(--fs-title);
        font-weight:var(--fw-heavy);
        letter-spacing:-.5px;line-height:1.2
      }
      #sdd-top-family{font-size:var(--fs-small);color:#64748b;margin-top:8px}
      #sdd-top-family a{color:var(--ac);text-decoration:none;font-weight:var(--fw-semi)}
      #sdd-top-back{
        padding:10px 14px;background:var(--surface2);border:1px solid var(--border);
        border-radius:var(--r);color:#64748b;font-size:var(--fs-small);
        text-decoration:none;transition:all .12s;white-space:nowrap;
        align-self:flex-start;font-family:inherit;font-weight:var(--fw-med);
      }
      #sdd-top-back:hover{color:var(--text);border-color:var(--border2);background:#fff}

      /* Layout */
      #sdd-body{
        max-width:none;margin:0;
        padding:28px clamp(var(--rails-min), 3vw, var(--rails-max)) 70px;
        display:grid;
        grid-template-columns:var(--notes-col) minmax(0, 1fr);
        gap:16px;
        align-items:start;
        min-width:0;
      }
      #sdd-follow{position:sticky;top:${CFG.stickyTop}px}

      /* Cards */
      .sc{
        background:var(--surface);
        border:1px solid var(--border);
        border-radius:var(--r);
        overflow:hidden;
        box-shadow:0 1px 3px rgba(0,0,0,.05)
      }
      .sc-head{
        padding:12px 18px;border-bottom:1px solid var(--border);
        display:flex;align-items:center;gap:10px;
        font-size:var(--fs-tiny);
        font-weight:var(--fw-bold);
        letter-spacing:.8px;text-transform:uppercase;color:#64748b;
        background:linear-gradient(to bottom, #fff, #fafcff);
        cursor:pointer;user-select:none;
      }
      .sc-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
      .sc-body{padding:18px;min-width:0}

      .sc-toggle{margin-left:auto;font-size:16px;color:#94a3b8;transition:transform .15s ease}
      .sc.collapsed .sc-toggle{transform:rotate(-90deg)}
      .sc.collapsed .sc-body{display:none}

      .chips{display:flex;flex-wrap:wrap;gap:8px}
      .chip{
        display:inline-block;padding:8px 12px;border-radius:999px;
        font-size:var(--fs-chip);font-weight:var(--fw-med);
        text-decoration:none;transition:opacity .12s,transform .1s;
      }
      .chip:hover{opacity:.85;transform:translateY(-1px)}
      .chip-sub{
        font-size:var(--fs-tiny);font-weight:var(--fw-bold);
        padding:4px 10px;margin-bottom:10px;
        display:inline-block;border-radius:10px;letter-spacing:.6px;text-transform:uppercase
      }

      .at{width:100%;border-collapse:collapse}
      .at thead th{
        padding:10px 12px;text-align:left;font-size:var(--fs-tiny);
        font-weight:var(--fw-bold);
        text-transform:uppercase;letter-spacing:.6px;color:#64748b;
        background:var(--surface2);border-bottom:1px solid var(--border);
      }
      .at tbody tr{border-bottom:1px solid var(--border)}
      .at tbody tr:last-child{border-bottom:none}
      .at tbody td{padding:12px 12px;font-size:var(--fs-table);vertical-align:top;min-width:0}
      .at tbody td:first-child a{color:var(--text2);text-decoration:none;font-weight:var(--fw-med);line-height:1.45}
      .at tbody td:first-child a:hover{color:var(--ac)}
      .tag{display:inline-block;padding:3px 9px;margin:3px;border-radius:9px;font-size:var(--fs-tiny);font-weight:var(--fw-semi)}
      .tag-d{background:#eff6ff;color:#1d4ed8}
      .tag-c{background:#f0fdf4;color:#15803d}

      /* ✅ FIX MOBILE: media query en dur (pas de var()) */
      @media(max-width:${CFG.breakpointOneCol}px){
        #sdd-bc,#sdd-top{padding-left:14px;padding-right:14px}
        #sdd-body{grid-template-columns:1fr}
        #sdd-follow{position:static}
        #sdd-top{flex-wrap:wrap}
        #sdd-top-title{font-size:calc(var(--fs-title) - 8px)}
      }
    `;
    document.head.appendChild(style);

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildSDD);
    else buildSDD();
  }

  function buildSDD() {
    const tables = document.querySelectorAll('.navbox table');
    if (!tables.length) return;

    const fullTitle = document.querySelector('#firstHeading')?.textContent?.trim() || document.title;
    const numMatch  = fullTitle.match(/SDD-(\d+)/i);
    const sddN      = numMatch ? parseInt(numMatch[1], 10) : null;
    const sddNum    = numMatch ? 'SDD-' + String(sddN).padStart(3,'0') : '';
    const sddName   = fullTitle.replace(/\s*SDD-\d+\s*/i, '').trim();

    let famille = '', famille_href = '';
    tables[0]?.querySelectorAll('tr').forEach(tr => {
      const th = tr.querySelector('th')?.textContent?.trim();
      const td = tr.querySelector('td');
      if (!td) return;
      if (th === 'Famille') {
        const a = td.querySelector('a');
        famille = a?.textContent?.trim() || td.textContent.trim();
        famille_href = a?.href || '';
      }
    });

    let items_primary = [], items_secondary = [], items_tertiary = [];
    if (tables[1]) {
      tables[1].querySelectorAll('tr').forEach(tr => {
        const th = tr.querySelector('th')?.textContent?.trim() || '';
        const links = [...tr.querySelectorAll('td a')].map(a => ({text: a.textContent.trim(), href: a.href}));
        if (th.includes('en rapport')) items_primary = links;
        else if (th.includes('non traités')) items_secondary = links;
        else if (th.includes('general')) items_tertiary = links;
      });
    }

    function parseAttendus(table) {
      if (!table) return [];
      return [...table.querySelectorAll('tbody tr')].slice(1).map(tr => {
        const tds = tr.querySelectorAll('td');
        if (!tds.length) return null;
        const a = tds[0]?.querySelector('a');
        return {
          text: a?.textContent?.trim() || tds[0]?.textContent?.trim(),
          href: a?.href,
          domains: (tds[1]?.textContent?.trim()||'').split(',').map(s=>s.trim()).filter(Boolean),
          comps:   (tds[2]?.textContent?.trim()||'').split(',').map(s=>s.trim()).filter(Boolean),
        };
      }).filter(Boolean);
    }

    const att_famille    = parseAttendus(tables[2]);
    const att_specifique = parseAttendus(tables[3]);
    const att_stage      = parseAttendus(tables[4]);

    document.body.innerHTML = '';

    // Breadcrumb
    const bc = document.createElement('div');
    bc.id = 'sdd-bc';
    bc.innerHTML = `<a href="/lisa/2025/Accueil">Accueil</a><span>›</span>
      <a href="/lisa/2025/Cat%C3%A9gorie:Situation_de_d%C3%A9part">Situations de départ</a>
      <span>›</span><strong style="color:var(--text2);font-weight:var(--fw-semi)">${escapeHtml(sddNum)}</strong>`;
    document.body.appendChild(bc);

    // Top
    const top = document.createElement('div');
    top.id = 'sdd-top';
    top.innerHTML = `
      <div id="sdd-top-pill">${escapeHtml(sddNum)}</div>
      <div id="sdd-top-info">
        <div id="sdd-top-title">${escapeHtml(sddName)}</div>
        ${famille ? `<div id="sdd-top-family">Famille · <a href="${famille_href}">${escapeHtml(famille)}</a></div>` : ''}
      </div>
      <a id="sdd-top-back" href="/lisa/2025/Cat%C3%A9gorie:Situation_de_d%C3%A9part">← Liste SDD</a>`;
    document.body.appendChild(top);

    const body = document.createElement('div');
    body.id = 'sdd-body';

    function card(title, dotColor, html, key) {
      const k = key || '';
      const collapsed = (sddN != null && k) ? isCollapsedKey(`sdd_${sddN}_${k}`) : false;
      return `<div class="sc ${collapsed ? 'collapsed' : ''}" data-key="${escapeHtml(k)}">
        <div class="sc-head">
          <div class="sc-dot" style="background:${dotColor}"></div>
          ${escapeHtml(title)}
          <span class="sc-toggle">▾</span>
        </div>
        <div class="sc-body">${html}</div>
      </div>`;
    }

    function chipsBlock(links, pillBg, pillText) {
      return `<div class="chips">${links.map(l =>
        `<a class="chip" style="background:${pillBg};color:${pillText}" href="${l.href}">${escapeHtml(l.text)}</a>`
      ).join('')}</div>`;
    }

    function attTable(rows) {
      if (!rows.length) return '<p style="color:#64748b;font-size:var(--fs-base)">Aucun attendu.</p>';
      return `<table class="at"><thead><tr>
        <th style="width:55%">Attendu</th><th style="width:25%">Domaines</th><th>Compétences</th>
      </tr></thead><tbody>${rows.map(r => `<tr>
        <td>${r.href ? `<a href="${r.href}">${escapeHtml(r.text)}</a>` : escapeHtml(r.text)}</td>
        <td>${r.domains.map(d=>`<span class="tag tag-d">${escapeHtml(d)}</span>`).join('')}</td>
        <td>${r.comps.map(c=>`<span class="tag tag-c">${escapeHtml(c)}</span>`).join('')}</td>
      </tr>`).join('')}</tbody></table>`;
    }

    // Content (RIGHT)
    const content = document.createElement('div');
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    content.style.gap = '16px';
    content.style.minWidth = '0';

    if (items_primary.length || items_secondary.length || items_tertiary.length) {
      let html = '';
      if (items_primary.length) html += `
        <span class="chip-sub" style="background:#eef2ff;color:#4338ca">En rapport direct</span>
        ${chipsBlock(items_primary, '#eef2ff', '#4338ca')}`;
      if (items_secondary.length) html += `
        <span class="chip-sub" style="background:#f1f5f9;color:#475569;margin-top:14px">Reliés, non traités ici</span>
        ${chipsBlock(items_secondary, '#f1f5f9', '#475569')}`;
      if (items_tertiary.length) html += `
        <span class="chip-sub" style="background:#f0fdf4;color:#15803d;margin-top:14px">Reliés en général</span>
        ${chipsBlock(items_tertiary, '#f0fdf4', '#15803d')}`;
      content.innerHTML += card('Items de connaissance', '#6366f1', html, 'items');
    }

    if (att_famille.length)    content.innerHTML += card(`Attendus — ${famille || 'Famille'}`, '#10b981', attTable(att_famille), 'att_famille');
    if (att_specifique.length) content.innerHTML += card('Attendus spécifiques', '#3b82f6', attTable(att_specifique), 'att_specifique');
    if (att_stage.length)      content.innerHTML += card('Valorisation du stage', '#f59e0b', attTable(att_stage), 'att_stage');

    // Follow (LEFT)
    const follow = document.createElement('div');
    const notesCollapsed = (sddN != null) ? isCollapsedKey(`sdd_${sddN}_notes`) : false;
    follow.className = `sc ${notesCollapsed ? 'collapsed' : ''}`;
    follow.id = 'sdd-follow';
    follow.dataset.key = 'notes';

    // Notes UI
    if (sddN != null) {
      follow.innerHTML = `
        <div class="sc-head">
          <div class="sc-dot" style="background:#4f46e5"></div>Suivi & notes
          <span class="sc-toggle">▾</span>
        </div>
        <div class="sc-body">

          <label style="display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none;margin-bottom:10px">
            <input id="sdd-done" type="checkbox" style="width:18px;height:18px">
            <span style="font-size:var(--fs-base);font-weight:var(--fw-semi);color:#0f172a">SDD faite</span>
          </label>

          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:10px 0 8px">
            <button id="md-save" type="button"
              style="padding:8px 10px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;cursor:pointer;
                font-family:inherit;font-size:var(--fs-small);color:#0f172a;font-weight:var(--fw-semi)">
              Sauver (Ctrl/Cmd+S)
            </button>

            <button id="md-toggle" type="button"
              style="padding:8px 10px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;cursor:pointer;
                font-family:inherit;font-size:var(--fs-small);color:#475569;font-weight:var(--fw-semi)">
              Aperçu
            </button>

            <span id="md-status" style="margin-left:auto;font-size:var(--fs-small);color:#94a3b8;font-weight:var(--fw-med)"></span>
          </div>

          <textarea id="md-area" spellcheck="false"
            style="width:100%;min-height:240px;max-height:65vh;resize:vertical;padding:10px 12px;border:1px solid #e2e8f0;border-radius:12px;
              font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;
              font-size:var(--fs-notes);line-height:1.55;color:#0f172a;outline:none"
            placeholder="# Notes (Markdown)

Raccourcis :
- Ctrl/Cmd+B : **gras**
- Ctrl/Cmd+I : *italique*
- Ctrl/Cmd+U : __souligné__
- Tab / Shift+Tab : indentation"
          ></textarea>

          <div id="md-prev" style="display:none;margin-top:10px;padding:12px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc"></div>

          <div style="margin-top:10px;font-size:var(--fs-small);color:#94a3b8;font-weight:var(--fw-med)">
            Auto-save activé (~${CFG.autosaveDelay} ms).
          </div>
        </div>
      `;

      const doneEl   = follow.querySelector('#sdd-done');
      const saveBtn  = follow.querySelector('#md-save');
      const togEl    = follow.querySelector('#md-toggle');
      const statusEl = follow.querySelector('#md-status');
      const areaEl   = follow.querySelector('#md-area');
      const prevEl   = follow.querySelector('#md-prev');

      doneEl.checked = isDone(sddN);
      areaEl.value   = getNotes(sddN);

      const setStatus = (txt) => { statusEl.textContent = txt || ''; };

      const saveNow = () => {
        setNotes(sddN, areaEl.value);
        setStatus('Sauvé ✓');
        clearTimeout(saveNow._t);
        saveNow._t = setTimeout(() => setStatus(''), 1200);
      };

      saveBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); saveNow(); });
      doneEl.addEventListener('click', (e) => e.stopPropagation());
      doneEl.addEventListener('change', () => setDone(sddN, doneEl.checked));

      // autosave + preview refresh
      let t = null;
      areaEl.addEventListener('input', () => {
        setStatus('…');
        clearTimeout(t);
        t = setTimeout(saveNow, CFG.autosaveDelay);
        if (prevEl.style.display !== 'none') prevEl.innerHTML = mdToHtml(areaEl.value);
      });

      togEl.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const show = prevEl.style.display === 'none';
        prevEl.style.display = show ? 'block' : 'none';
        areaEl.style.display = show ? 'none' : 'block';
        togEl.textContent = show ? 'Éditer' : 'Aperçu';
        if (show) prevEl.innerHTML = mdToHtml(areaEl.value);
      });

      // Shortcuts
      areaEl.addEventListener('keydown', (e) => {
        const mod = e.ctrlKey || e.metaKey;

        if (mod && (e.key === 's' || e.key === 'S')) { e.preventDefault(); saveNow(); return; }
        if (mod && (e.key === 'b' || e.key === 'B')) { e.preventDefault(); wrapSelection(areaEl, '**', '**'); return; }
        if (mod && (e.key === 'i' || e.key === 'I')) { e.preventDefault(); wrapSelection(areaEl, '*', '*'); return; }
        if (mod && (e.key === 'u' || e.key === 'U')) { e.preventDefault(); wrapSelection(areaEl, '__', '__'); return; }

        if (e.key === 'Tab') {
          e.preventDefault();
          if (e.shiftKey) outdentSelection(areaEl, CFG.indentSpaces);
          else indentSelection(areaEl, CFG.indentSpaces);
        }
      });

      // Global Ctrl/Cmd+S when notes are relevant
      window.addEventListener('keydown', (e) => {
        const mod = e.ctrlKey || e.metaKey;
        if (!mod || (e.key !== 's' && e.key !== 'S')) return;

        const active = document.activeElement;
        const inNotes = active === areaEl || follow.contains(active);
        const previewOpen = prevEl.style.display !== 'none';
        if (inNotes || previewOpen) {
          e.preventDefault();
          saveNow();
        }
      }, { capture: true });
    } else {
      follow.innerHTML = `
        <div class="sc-head">
          <div class="sc-dot" style="background:#4f46e5"></div>Suivi & notes
          <span class="sc-toggle">▾</span>
        </div>
        <div class="sc-body" style="color:#64748b">Impossible d’identifier le numéro SDD.</div>`;
    }

    // Append
    body.appendChild(follow);
    body.appendChild(content);
    document.body.appendChild(body);

    // Collapsible wiring
    document.querySelectorAll('#sdd-body .sc').forEach(sc => {
      const head = sc.querySelector('.sc-head');
      const key = sc.dataset.key;
      if (!head || !key || sddN == null) return;

      head.addEventListener('click', (ev) => {
        const t = ev.target;
        if (t && (t.closest('button') || t.closest('input') || t.closest('textarea') || t.closest('select') || t.closest('a'))) return;
        const collapsed = sc.classList.toggle('collapsed');
        setCollapsedKey(`sdd_${sddN}_${key}`, collapsed);
      });
    });
  }

})();

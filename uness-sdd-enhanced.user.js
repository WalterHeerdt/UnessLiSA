// ==UserScript==
// @name         UNESS – SDD Enhanced (Liste + Pages) — DONE + Notes + Collapse + Font vars + Cloud Sync (Firebase) + Auto-update
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Liste SDD + redesign pages + case "faite" + notes Markdown (local) + sticky + raccourcis (Ctrl/Cmd+S,B,I,U) + Tab/Shift+Tab + encarts minimisables (persistant) + tailles de police via constantes + FIX mobile (media query sans var()) + Cloud sync (username+PIN via Firebase) + auto-update GitHub
// @author       You
// @match        https://livret.uness.fr/lisa/2025/Cat%C3%A9gorie:Situation_de_d%C3%A9part
// @match        https://livret.uness.fr/lisa/2025/Cat*gorie:Situation_de_d*part
// @match        https://livret.uness.fr/lisa/2025/*_SDD-*
// @homepageURL  https://github.com/WalterHeerdt/UnessLiSA
// @supportURL   https://github.com/WalterHeerdt/UnessLiSA/issues
// @downloadURL  https://raw.githubusercontent.com/WalterHeerdt/UnessLiSA/main/uness-sdd-enhanced.user.js
// @updateURL    https://raw.githubusercontent.com/WalterHeerdt/UnessLiSA/main/uness-sdd-enhanced.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @connect      firestore.googleapis.com
// @connect      identitytoolkit.googleapis.com
// @connect      securetoken.googleapis.com
// @connect      *.googleapis.com
// ==/UserScript==

(async function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════════════════
  // CONFIG
  // ══════════════════════════════════════════════════════════════════════════
  const SDD_TAGS = {1:["Hépato-Gastro-Entérologie"],2:["Hépato-Gastro-Entérologie","Maladies Infectieuses et Tropicales"],3:["Chirurgie Viscérale et Digestive","Médecine d'Urgence"],4:["Médecine d'Urgence","Chirurgie Viscérale et Digestive"],5:["Hépato-Gastro-Entérologie"],6:["Hépato-Gastro-Entérologie","Médecine Interne Immunologie"],7:["Hépato-Gastro-Entérologie","MPR"],8:["Hépato-Gastro-Entérologie","Oncologie"],9:["Chirurgie Viscérale et Digestive"],10:["Médecine d'Urgence","Hépato-Gastro-Entérologie"],11:["Pédiatrie"],12:["Médecine d'Urgence","Gériatrie"],13:["Médecine d'Urgence","Hépato-Gastro-Entérologie"],14:["Médecine d'Urgence","Hépato-Gastro-Entérologie"],15:["Médecine Vasculaire","Médecine Cardiovasculaire"],16:["Médecine Interne Immunologie","Hématologie"],17:["Médecine Interne Immunologie","Oncologie"],18:["Médecine Cardiovasculaire"],19:["Médecine Vasculaire","Chirurgie Vasculaire"],20:["Pneumologie","Médecine d'Urgence"],21:["Médecine Interne Immunologie"],22:["Néphrologie","Médecine d'Urgence"],23:["Urologie"],24:["Endocrinologie - Diabétologie - Nutrition","Gynécologie Médicale"],25:["Endocrinologie - Diabétologie - Nutrition"],26:["Pédiatrie","Endocrinologie - Diabétologie - Nutrition"],27:["Gériatrie","Médecine d'Urgence"],28:["Médecine Intensive Réanimation","Neurologie"],29:["Neurologie"],30:["Endocrinologie - Diabétologie - Nutrition","Gériatrie"],31:["Gériatrie","Neurologie"],32:["Pédiatrie","Médecine d'Urgence"],33:["Gynécologie Médicale"],34:["Anesthésie Réanimation"],35:["MPR","Rhumatologie"],36:["Rhumatologie","MPR"],37:["Pédiatrie","Dermatologie Vénérologie"],38:["Médecine d'Urgence","Médecine Intensive Réanimation"],39:["Pédiatrie"],40:["Gynécologie Médicale","Endocrinologie - Diabétologie - Nutrition"],41:["Endocrinologie - Diabétologie - Nutrition","Chirurgie Plastique"],42:["Médecine Cardiovasculaire"],43:["Médecine d'Urgence","Médecine Cardiovasculaire"],44:["Médecine d'Urgence","Maladies Infectieuses et Tropicales"],45:["Médecine d'Urgence","Médecine Intensive Réanimation"],46:["Pédiatrie","Médecine d'Urgence"],47:["Hépato-Gastro-Entérologie"],48:["Pédiatrie"],49:["Médecine d'Urgence"],50:["Médecine d'Urgence","Neurologie"],51:["Endocrinologie - Diabétologie - Nutrition"],52:["ORL - CCF","Hépato-Gastro-Entérologie"],53:["Gynécologie Obstétrique"],54:["Médecine Interne Immunologie","Néphrologie"],55:["Pédiatrie","Hématologie"],56:["Rhumatologie"],57:["Endocrinologie - Diabétologie - Nutrition"],58:["Hématologie","Médecine Interne Immunologie"],59:["Hématologie"],60:["Médecine d'Urgence","Anesthésie Réanimation"],61:["Endocrinologie - Diabétologie - Nutrition","Néphrologie"],62:["ORL - CCF","Neurologie"],63:["Urologie"],64:["ORL - CCF","Neurologie"],65:["Chirurgie Orthopédique et Traumatologique","Rhumatologie"],66:["Neurologie","MPR"],67:["Rhumatologie"],68:["Chirurgie Orthopédique et Traumatologique","Pédiatrie"],69:["Médecine Vasculaire","Chirurgie Vasculaire"],70:["Rhumatologie","Chirurgie Orthopédique et Traumatologique"],71:["Chirurgie Orthopédique et Traumatologique","Médecine d'Urgence"],72:["Rhumatologie","Chirurgie Orthopédique et Traumatologique"],73:["Neurologie"],74:["Neurologie"],75:["Chirurgie Orthopédique et Traumatologique"],76:["Médecine Vasculaire"],77:["Médecine Interne Immunologie","Rhumatologie"],78:["Dermatologie Vénérologie"],79:["Endocrinologie - Diabétologie - Nutrition","Gynécologie Médicale"],80:["Dermatologie Vénérologie"],81:["Dermatologie Vénérologie"],82:["Dermatologie Vénérologie"],83:["Chirurgie Plastique"],84:["Dermatologie Vénérologie"],85:["Dermatologie Vénérologie"],86:["Gériatrie","MPR"],87:["Médecine d'Urgence","Maladies Infectieuses et Tropicales"],88:["Dermatologie Vénérologie","Allergologie"],89:["Hématologie","Médecine Interne Immunologie"],90:["Pédiatrie","Dermatologie Vénérologie"],91:["Dermatologie Vénérologie","ORL - CCF"],92:["Dermatologie Vénérologie","Médecine Vasculaire"],93:["Dermatologie Vénérologie","Maladies Infectieuses et Tropicales"],94:["Gynécologie Médicale"],95:["Hépato-Gastro-Entérologie","Urologie"],96:["Urologie","Maladies Infectieuses et Tropicales"],97:["Urologie","Médecine d'Urgence"],98:["Gynécologie Obstétrique"],99:["Gynécologie Obstétrique","Urologie"],100:["Urologie","Médecine d'Urgence"],101:["Urologie","Maladies Infectieuses et Tropicales"],102:["Urologie"],103:["Urologie","Gériatrie"],104:["Gynécologie Médicale"],105:["Gynécologie Obstétrique","Urologie"],106:["Gynécologie Obstétrique","Oncologie"],107:["Gynécologie Obstétrique","Urologie"],108:["Urologie"],109:["Gynécologie Obstétrique"],110:["Gynécologie Obstétrique","Anesthésie Réanimation"],111:["Gynécologie Obstétrique","Médecine d'Urgence"],112:["Gynécologie Médicale","Gynécologie Obstétrique"],113:["Pédiatrie","Endocrinologie - Diabétologie - Nutrition"],114:["Psychiatrie","Médecine d'Urgence"],115:["Pédiatrie","Neurologie"],116:["Psychiatrie"],117:["Psychiatrie","Gériatrie"],118:["Neurologie","Médecine d'Urgence"],119:["Gériatrie","Médecine d'Urgence"],120:["Neurologie","Médecine d'Urgence"],121:["Neurologie","Médecine d'Urgence"],122:["Psychiatrie"],123:["Psychiatrie"],124:["Psychiatrie"],125:["Psychiatrie"],126:["Neurologie"],127:["ORL - CCF","Neurologie"],128:["Neurologie"],129:["Psychiatrie","Neurologie"],130:["Neurologie","ORL - CCF"],131:["Gériatrie","Neurologie"],132:["Psychiatrie","Endocrinologie - Diabétologie - Nutrition"],133:["Pédiatrie","Psychiatrie"],134:["ORL - CCF","Neurologie"],135:["Psychiatrie","Neurologie"],136:["Psychiatrie"],137:["Psychiatrie","Gynécologie Obstétrique"],138:["Ophtalmologie","Neurologie"],139:["Ophtalmologie","Chirurgie Plastique"],140:["ORL - CCF"],141:["Ophtalmologie"],142:["ORL - CCF","Médecine d'Urgence"],143:["Ophtalmologie","Neurologie"],144:["ORL - CCF","CMF"],145:["ORL - CCF"],146:["ORL - CCF"],147:["ORL - CCF","Médecine d'Urgence"],148:["Endocrinologie - Diabétologie - Nutrition","Chirurgie Viscérale et Digestive"],149:["Médecine d'Urgence","ORL - CCF"],150:["CMF","Chirurgie Orale"],151:["ORL - CCF","Médecine d'Urgence"],152:["Ophtalmologie","Médecine d'Urgence"],153:["ORL - CCF"],154:["ORL - CCF"],155:["ORL - CCF","Allergologie"],156:["ORL - CCF"],157:["Ophtalmologie","Pédiatrie"],158:["ORL - CCF","CMF"],159:["Médecine Cardiovasculaire","Médecine d'Urgence"],160:["Médecine d'Urgence","Médecine Intensive Réanimation"],161:["Médecine d'Urgence","Médecine Cardiovasculaire"],162:["Médecine d'Urgence","Pneumologie"],163:["Pneumologie","Maladies Infectieuses et Tropicales"],164:["Gynécologie Médicale","Oncologie"],165:["Médecine Cardiovasculaire","Médecine d'Urgence"],166:["Médecine d'Urgence","Médecine Cardiovasculaire"],167:["Pneumologie","Médecine d'Urgence"],168:["Médecine d'Urgence","Chirurgie Plastique"],169:["Médecine d'Urgence","Maladies Infectieuses et Tropicales"],170:["Médecine d'Urgence","Chirurgie Plastique"],171:["Médecine d'Urgence","Chirurgie Viscérale et Digestive"],172:["Médecine d'Urgence","Neurochirurgie"],173:["Médecine d'Urgence","Chirurgie Orthopédique et Traumatologique"],174:["Médecine d'Urgence","CMF"],175:["Médecine d'Urgence","Neurochirurgie"],176:["Médecine d'Urgence","Médecine Intensive Réanimation"],177:["Médecine d'Urgence","Chirurgie Thoracique et Cardiovasculaire"],178:["Radiologie et Imagerie Médicale"],179:["Anatomie et Cytologie Pathologiques"],180:["Anatomie et Cytologie Pathologiques"],181:["Anatomie et Cytologie Pathologiques","Oncologie"],182:["Biologie Médicale","Urologie"],183:["Biologie Médicale","Neurologie"],184:["ORL - CCF"],185:["Médecine Cardiovasculaire"],186:["Médecine Interne Immunologie","Maladies Infectieuses et Tropicales"],187:["Biologie Médicale","Maladies Infectieuses et Tropicales"],188:["Maladies Infectieuses et Tropicales","Biologie Médicale"],189:["Biologie Médicale","Urologie"],190:["Biologie Médicale","Maladies Infectieuses et Tropicales"],191:["Biologie Médicale","Hépato-Gastro-Entérologie"],192:["Médecine Intensive Réanimation","Biologie Médicale"],193:["Biologie Médicale","Hématologie"],194:["Endocrinologie - Diabétologie - Nutrition"],195:["Médecine Cardiovasculaire","Endocrinologie - Diabétologie - Nutrition"],196:["Biologie Médicale","Néphrologie"],197:["Néphrologie","Biologie Médicale"],198:["Hépato-Gastro-Entérologie"],199:["Néphrologie"],200:["Endocrinologie - Diabétologie - Nutrition","Néphrologie"],201:["Néphrologie"],202:["Néphrologie","Médecine Intensive Réanimation"],203:["Allergologie","Dermatologie Vénérologie"],204:["Médecine Cardiovasculaire","Médecine d'Urgence"],205:["Hépato-Gastro-Entérologie","Médecine d'Urgence"],206:["Hépato-Gastro-Entérologie"],207:["Hématologie","Médecine Interne Immunologie"],208:["Endocrinologie - Diabétologie - Nutrition","Médecine d'Urgence"],209:["Endocrinologie - Diabétologie - Nutrition","Médecine d'Urgence"],210:["Hématologie","Médecine Interne Immunologie"],211:["Hépato-Gastro-Entérologie","Néphrologie"],212:["Néphrologie"],213:["Hématologie"],214:["Hématologie"],215:["Hématologie"],216:["Hématologie"],217:["Hématologie"],218:["Hématologie","Hépato-Gastro-Entérologie"],219:["Allergologie","Hématologie"],220:["Hématologie"],221:["Hématologie"],222:["Hématologie"],223:["Hématologie"],224:["Radiologie et Imagerie Médicale","Hépato-Gastro-Entérologie"],225:["Radiologie et Imagerie Médicale","ORL - CCF"],226:["Radiologie et Imagerie Médicale","Neurologie"],227:["Radiologie et Imagerie Médicale","Neurochirurgie"],228:["Radiologie et Imagerie Médicale","Chirurgie Orthopédique et Traumatologique"],229:["Radiologie et Imagerie Médicale","Gynécologie Obstétrique"],230:["Radiologie et Imagerie Médicale","Médecine Cardiovasculaire"],231:["Radiologie et Imagerie Médicale"],232:["Radiologie et Imagerie Médicale"],233:["Radiologie et Imagerie Médicale"],234:["Maladies Infectieuses et Tropicales","Biologie Médicale"],235:["Maladies Infectieuses et Tropicales","Santé Publique"],236:["Biologie Médicale","Maladies Infectieuses et Tropicales"],237:["Médecine d'Urgence","Médecine Légale et Expertise médicale"],238:["Hépato-Gastro-Entérologie","Pneumologie"],239:["Anesthésie Réanimation"],240:["Psychiatrie"],241:["Médecine d'Urgence","Psychiatrie"],242:["Pneumologie","Addictologie"],243:["Chirurgie Orthopédique et Traumatologique"],244:["Psychiatrie","Médecine d'Urgence"],245:["MPR","Chirurgie Orthopédique et Traumatologique"],246:["Médecine Générale","Santé Publique"],247:["MPR"],248:["Médecine Cardiovasculaire","Hématologie"],249:["Rhumatologie"],250:["Anesthésie Réanimation"],251:["Médecine Interne Immunologie"],252:["Médecine Cardiovasculaire"],253:["Médecine Cardiovasculaire","Néphrologie"],254:["Oncologie"],255:["Maladies Infectieuses et Tropicales"],256:["Psychiatrie"],257:["Gynécologie Médicale"],258:["Anesthésie Réanimation"],259:["Médecine d'Urgence","Anesthésie Réanimation"],260:["MPR","Rhumatologie"],261:["Pédiatrie","Anesthésie Réanimation"],262:["Maladies Infectieuses et Tropicales","Médecine d'Urgence"],263:["Dermatologie Vénérologie","Maladies Infectieuses et Tropicales"],264:["Médecine Interne Immunologie","Néphrologie"],265:["Pédiatrie"],266:["Gériatrie","Médecine Interne Immunologie"],267:["Médecine Interne Immunologie","Gériatrie"],268:["Gynécologie Obstétrique"],269:["Psychiatrie"],270:["Endocrinologie - Diabétologie - Nutrition"],271:["Anesthésie Réanimation","Médecine Intensive Réanimation"],272:["Anesthésie Réanimation","Hématologie"],273:["Pédiatrie","Gynécologie Obstétrique"],274:["Maladies Infectieuses et Tropicales","Pneumologie"],275:["Hématologie"],276:["Gériatrie","MPR"],277:["Rhumatologie","MPR"],278:["Gynécologie Médicale","Endocrinologie - Diabétologie - Nutrition"],279:["Médecine Interne Immunologie"],280:["Endocrinologie - Diabétologie - Nutrition"],281:["Endocrinologie - Diabétologie - Nutrition"],282:["Médecine Cardiovasculaire"],283:["Pneumologie"],284:["Endocrinologie - Diabétologie - Nutrition"],285:["Médecine Cardiovasculaire"],286:["Pneumologie"],287:["Médecine Cardiovasculaire"],288:["Psychiatrie"],289:["Neurologie"],290:["Néphrologie"],291:["Médecine Interne Immunologie","Maladies Infectieuses et Tropicales"],292:["Psychiatrie"],293:["Psychiatrie"],294:["Gynécologie Médicale"],295:["Gériatrie"],296:["Pédiatrie"],297:["Oncologie"],298:["Neurologie","Gériatrie"],299:["Allergologie"],300:["Anesthésie Réanimation"],301:["Maladies Infectieuses et Tropicales","Pneumologie"],302:["Maladies Infectieuses et Tropicales"],303:["Santé Publique","Oncologie"],304:["Gynécologie Obstétrique","Endocrinologie - Diabétologie - Nutrition"],305:["Maladies Infectieuses et Tropicales","Gynécologie Médicale"],306:["Rhumatologie","Gériatrie"],307:["Gynécologie Obstétrique","Génétique Médicale"],308:["Pédiatrie","Santé Publique"],309:["Psychiatrie","Médecine d'Urgence"],310:["Maladies Infectieuses et Tropicales","Santé Publique"],311:["Santé Publique","Maladies Infectieuses et Tropicales"],312:["Gynécologie Obstétrique"],313:["Santé Publique"],314:["Santé Publique","Pneumologie"],315:["Médecine et Santé au Travail"],316:["Médecine et Santé au Travail","MPR"],317:["Gynécologie Médicale","Santé Publique"],318:["Pédiatrie","Santé Publique"],319:["Santé Publique","Endocrinologie - Diabétologie - Nutrition"],320:["Santé Publique","Médecine Cardiovasculaire"],321:["Pédiatrie","Médecine Légale et Expertise médicale"],322:["Santé Publique","Maladies Infectieuses et Tropicales"],323:["Pédiatrie","Santé Publique"],324:["Endocrinologie - Diabétologie - Nutrition","Santé Publique"],325:["Santé Publique","Pédiatrie"],326:["Médecine et Santé au Travail","Médecine d'Urgence"],327:["Oncologie","Médecine Interne Immunologie"],328:["Médecine Interne Immunologie"],329:["Santé Publique","Médecine Légale et Expertise médicale"],330:["Gériatrie","Santé Publique"],331:["Médecine Légale et Expertise médicale"],332:["Gynécologie Obstétrique"],333:["Médecine Légale et Expertise médicale","Médecine d'Urgence"],334:["Santé Publique","Médecine Interne Immunologie"],335:["Médecine Cardiovasculaire"],336:["Maladies Infectieuses et Tropicales","Médecine d'Urgence"],337:["Oncologie","Médecine Interne Immunologie"],338:["Santé Publique"],339:["Médecine et Santé au Travail"],340:["Médecine d'Urgence","Médecine Intensive Réanimation"],341:["Psychiatrie","Médecine d'Urgence"],342:["Santé Publique"],343:["Médecine Légale et Expertise médicale","Santé Publique"],344:["Psychiatrie","Médecine et Santé au Travail"],345:["MPR","Santé Publique"],346:["Santé Publique","Médecine d'Urgence"],347:["Santé Publique"],348:["Médecine Interne Immunologie"],349:["Psychiatrie"],350:["Médecine Légale et Expertise médicale","Gynécologie Obstétrique"],351:["Médecine Légale et Expertise médicale","Médecine d'Urgence"],352:["Santé Publique"],353:["MPR","Médecine Cardiovasculaire"],354:["Santé Publique"],355:["Santé Publique","Gériatrie"],356:["Anesthésie Réanimation"]};
  const CFG = {
    // Police (Google Fonts)
    fontFamily: 'Inter',
    fontWeights: [400, 500, 600, 700, 800],

    // Tailles (px) → variables CSS
    fsBase:    16,
    fsSmall:   14,
    fsTiny:    12,
    fsTitle:   26,
    fsH1:      24,
    fsH2:      22,
    fsH3:      20,
    fsH4:      18,
    fsRow:     16,
    fsRowNum:  13,
    fsChip:    14,
    fsTable:   15,
    fsNotes:   13,

    // Weights
    fwBase:     400,
    fwMedium:   500,
    fwSemibold: 600,
    fwBold:     700,
    fwHeavy:    800,

    // Layout
    notesColWidth:     340,   // px colonne notes (desktop) — réduit pour plus d'espace contenu
    railsMin:           14,   // px padding min
    railsMax:           48,   // px padding max
    breakpointOneCol:  980,   // px → 1-col (utilisé en dur dans @media)
    stickyTop:          14,   // px

    // Cache liste
    cacheTTLms: 48 * 60 * 60 * 1000,

    // Notes
    autosaveDelay: 250,   // ms
    indentSpaces:    2,

    // ──────────────────────────────────────────────────────────────────────
    // CLOUD SYNC — Firebase (Email/Password Auth + Firestore REST)
    // ──────────────────────────────────────────────────────────────────────
    cloud: {
      enabled: true,
      usernameKey: 'uness_cloud_user_v1',
      pinKey:      'uness_cloud_pin_v1',

      apiKey:    'AIzaSyAHyhowmrjXjGyJKbPibpeevBluc0qFtzg',
      projectId: 'uneisa-26e34',

      pushDebounceMs: 900,
    },
  };

  const BASE      = 'https://livret.uness.fr';
  const CACHE_KEY = 'uness_sdd_v5';
  const CACHE_TS  = 'uness_sdd_ts_v5';
  const CACHE_TTL = CFG.cacheTTLms;

  // ══════════════════════════════════════════════════════════════════════════
  // STOCKAGE LOCAL (Tampermonkey)
  // ══════════════════════════════════════════════════════════════════════════
  const DONE_PREFIX     = 'uness_sdd_done_v1_';
  const NOTES_PREFIX    = 'uness_sdd_notes_v1_';
  const COLLAPSE_PREFIX = 'uness_sdd_collapse_v1_';

  const pad3     = (n) => String(parseInt(n, 10)).padStart(3, '0');
  const doneKey  = (n) => DONE_PREFIX  + pad3(n);
  const notesKey = (n) => NOTES_PREFIX + pad3(n);

  const isDone   = (n)    => !!GM_getValue(doneKey(n), false);
  const setDone  = (n, v) => { GM_setValue(doneKey(n), !!v); cloudSchedulePush(); };

  const getNotes = (n)      => GM_getValue(notesKey(n), '');
  const setNotes = (n, md)  => { GM_setValue(notesKey(n), String(md ?? '')); cloudSchedulePush(); };

  const isCollapsedKey  = (k)    => !!GM_getValue(COLLAPSE_PREFIX + k, false);
  const setCollapsedKey = (k, v) => { GM_setValue(COLLAPSE_PREFIX + k, !!v); cloudSchedulePush(); };

  // ══════════════════════════════════════════════════════════════════════════
  // COULEURS
  // ══════════════════════════════════════════════════════════════════════════
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

  const _familyColorCache = {};
  function getFamilyColor(f) {
    if (!f) return PALETTE[9];
    if (_familyColorCache[f]) return _familyColorCache[f];
    let h = 5381;
    for (let i = 0; i < f.length; i++) h = ((h << 5) + h) ^ f.charCodeAt(i);
    return (_familyColorCache[f] = PALETTE[Math.abs(h) % (PALETTE.length - 1)]);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // UTILS
  // ══════════════════════════════════════════════════════════════════════════
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  function googleFontLink(family, weights) {
    const fam = encodeURIComponent(family).replace(/%20/g, '+');
    return `https://fonts.googleapis.com/css2?family=${fam}:wght@${(weights || [400,500,600,700]).join(';')}&display=swap`;
  }

  function cssVarsRoot() {
    return `
      :root {
        --bg:#f1f5f9; --surface:#ffffff; --surface2:#f8fafc;
        --border:#e2e8f0; --border2:#cbd5e1;
        --text:#0f172a; --text2:#334155; --muted:#94a3b8;
        --ac:#4f46e5; --ac-light:#eef2ff; --ac-dark:#3730a3;
        --success:#10b981; --success-light:#d1fae5;
        --warning:#f59e0b; --warning-light:#fef3c7;
        --danger:#ef4444; --danger-light:#fee2e2;
        --r:12px; --r-sm:8px;
        --sh:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
        --sh2:0 10px 26px rgba(0,0,0,.10);
        --sh-focus:0 0 0 3px rgba(79,70,229,.2);

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

        --transition:.15s ease;
      }
    `;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MARKDOWN (subset)
  // ══════════════════════════════════════════════════════════════════════════
  function mdToHtml(md) {
    let s = escapeHtml(md || '');

    // underline: __text__
    s = s.replace(/__([^_\n]+)__/g, '<u>$1</u>');

    // inline code
    s = s.replace(/`([^`\n]+)`/g,
      '<code style="background:#f1f5f9;padding:2px 6px;border-radius:6px;border:1px solid #e2e8f0;font-size:.9em">$1</code>'
    );

    // bold & italic (ordre important : ** avant *)
    s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');

    // liens [txt](url)
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--ac);text-decoration:none;font-weight:var(--fw-semi)">$1</a>'
    );

    // headings
    s = s.replace(/^######\s(.+)$/gm, '<h6 style="margin:.65rem 0 .3rem;font-size:var(--fs-small)">$1</h6>');
    s = s.replace(/^#####\s(.+)$/gm,  '<h5 style="margin:.75rem 0 .35rem;font-size:var(--fs-h4)">$1</h5>');
    s = s.replace(/^####\s(.+)$/gm,   '<h4 style="margin:.85rem 0 .4rem;font-size:var(--fs-h3)">$1</h4>');
    s = s.replace(/^###\s(.+)$/gm,    '<h3 style="margin:.95rem 0 .45rem;font-size:var(--fs-h2)">$1</h3>');
    s = s.replace(/^##\s(.+)$/gm,     '<h2 style="margin:1.05rem 0 .5rem;font-size:var(--fs-h1)">$1</h2>');
    s = s.replace(/^#\s(.+)$/gm,      '<h1 style="margin:1.15rem 0 .55rem;font-size:var(--fs-title);font-weight:var(--fw-heavy)">$1</h1>');

    // listes (- ou *)
    s = s.replace(/^(?:- |\* )(.*)$/gm, '<li>$1</li>');
    s = s.replace(/(<li>.*<\/li>\n?)+/g, m =>
      `<ul style="margin:.45rem 0 .9rem 1.25rem;list-style:disc;color:var(--text2);line-height:1.65;font-size:var(--fs-base)">${m}</ul>`
    );

    // paragraphes
    s = s.split(/\n{2,}/).map(block => {
      const t = block.trim();
      if (!t) return '';
      if (t.startsWith('<h') || t.startsWith('<ul')) return block;
      return `<p style="margin:.55rem 0;color:var(--text2);line-height:1.7;font-size:var(--fs-base)">${block.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return s || '<p style="color:var(--muted);margin:0;font-style:italic">Aucune note.</p>';
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HELPERS TEXTAREA
  // ══════════════════════════════════════════════════════════════════════════
  function wrapSelection(ta, left, right) {
    const { selectionStart: s, selectionEnd: e, value: v } = ta;
    const sel = v.slice(s, e);
    ta.value = v.slice(0, s) + left + sel + right + v.slice(e);
    if (sel.length) {
      ta.selectionStart = s + left.length;
      ta.selectionEnd   = s + left.length + sel.length;
    } else {
      ta.selectionStart = ta.selectionEnd = s + left.length;
    }
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function indentSelection(ta, spaces = CFG.indentSpaces) {
    const { selectionStart: s, selectionEnd: e, value: v } = ta;
    const pref = ' '.repeat(spaces);
    if (s === e) {
      ta.value = v.slice(0, s) + pref + v.slice(e);
      ta.selectionStart = ta.selectionEnd = s + pref.length;
    } else {
      const out = v.slice(s, e).split('\n').map(l => pref + l).join('\n');
      ta.value = v.slice(0, s) + out + v.slice(e);
      ta.selectionStart = s;
      ta.selectionEnd   = s + out.length;
    }
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function outdentSelection(ta, spaces = CFG.indentSpaces) {
    const { selectionStart: s, selectionEnd: e, value: v } = ta;
    if (s === e) return;
    const pref = ' '.repeat(spaces);
    const out = v.slice(s, e).split('\n')
      .map(l => l.startsWith(pref) ? l.slice(spaces) : l.startsWith(' ') ? l.slice(1) : l)
      .join('\n');
    ta.value = v.slice(0, s) + out + v.slice(e);
    ta.selectionStart = s;
    ta.selectionEnd   = s + out.length;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Safe tags getter (SDD_TAGS est optionnel)
  function tagsForNum(n) {
    try {
      if (typeof SDD_TAGS !== 'undefined' && SDD_TAGS?.[n]) return SDD_TAGS[n]; // eslint-disable-line no-undef
    } catch (_) {}
    return [];
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CLOUD SYNC — Firebase Auth (Email/Password) + Firestore REST
  // ══════════════════════════════════════════════════════════════════════════
  const TOKEN_KEY = 'uness_cloud_token_v1';

  function cloudEnabled() {
    const { cloud: c } = CFG;
    return !!(c?.enabled && c?.apiKey && c?.projectId
      && !c.apiKey.includes('PASTE_')
      && !c.projectId.includes('PASTE_'));
  }

  const getCloudUsername = ()    => (GM_getValue(CFG.cloud.usernameKey, '') || '').trim();
  const setCloudUsername = (u)   => GM_setValue(CFG.cloud.usernameKey, (u || '').trim());
  const getCloudPin      = ()    => (GM_getValue(CFG.cloud.pinKey, '') || '').trim();
  const setCloudPin      = (p)   => GM_setValue(CFG.cloud.pinKey, (p || '').trim());

  const cloudEmail = (username) =>
    `${(username || '').trim().toLowerCase()}@uness.local`;

  const loadToken = () => {
    try { return JSON.parse(GM_getValue(TOKEN_KEY, '') || ''); } catch { return {}; }
  };
  const saveToken = (obj) => GM_setValue(TOKEN_KEY, JSON.stringify(obj || {}));

  const IDENTITY_URL     = `https://identitytoolkit.googleapis.com/v1`;
  const SECURE_TOKEN_URL = `https://securetoken.googleapis.com/v1`;
  const firestoreBase    = () =>
    `https://firestore.googleapis.com/v1/projects/${CFG.cloud.projectId}/databases/(default)/documents`;

  async function firebasePost(url, body) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const err = new Error(j?.error?.message || `HTTP ${r.status}`);
      err._firebase = j;
      throw err;
    }
    return j;
  }

  async function cloudSignInOrSignUp(username, pin) {
    const email  = cloudEmail(username);
    const apiKey = CFG.cloud.apiKey;

    const storeToken = (j) => {
      const expiresAt = Date.now() + Number(j.expiresIn) * 1000 - 30_000;
      saveToken({ idToken: j.idToken, refreshToken: j.refreshToken, expiresAt, uid: j.localId });
      return { uid: j.localId, idToken: j.idToken };
    };

    try {
      return storeToken(await firebasePost(
        `${IDENTITY_URL}/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,
        { email, password: pin, returnSecureToken: true }
      ));
    } catch (e) {
      // Compte inexistant → on le crée
      if (/EMAIL_NOT_FOUND|INVALID_LOGIN_CREDENTIALS/.test(e.message || '')) {
        return storeToken(await firebasePost(
          `${IDENTITY_URL}/accounts:signUp?key=${encodeURIComponent(apiKey)}`,
          { email, password: pin, returnSecureToken: true }
        ));
      }
      throw e;
    }
  }

  async function cloudRefreshIfNeeded() {
    const t = loadToken();
    if (t?.idToken && t?.expiresAt && Date.now() < t.expiresAt) return t;
    if (!t?.refreshToken) return {};

    const r = await fetch(`${SECURE_TOKEN_URL}/token?key=${encodeURIComponent(CFG.cloud.apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: t.refreshToken }).toString(),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { saveToken({}); return {}; }

    const out = {
      idToken:      j.id_token,
      refreshToken: j.refresh_token || t.refreshToken,
      expiresAt:    Date.now() + Number(j.expires_in) * 1000 - 30_000,
      uid:          j.user_id || t.uid,
    };
    saveToken(out);
    return out;
  }

  async function cloudEnsureSession() {
    if (!cloudEnabled()) return null;

    let username = getCloudUsername();
    let pin      = getCloudPin();

    if (!username) {
      username = (prompt('Cloud — nom d\'utilisateur :') || '').trim();
      if (!username) return null;
      setCloudUsername(username);
    }
    if (!pin) {
      pin = (prompt('Cloud — PIN (stocké localement) :') || '').trim();
      if (!pin) return null;
      setCloudPin(pin);
    }

    let tok = await cloudRefreshIfNeeded();
    if (!tok?.idToken) {
      await cloudSignInOrSignUp(username, pin);
      tok = await cloudRefreshIfNeeded();
    }
    return tok?.idToken ? tok : null;
  }

  function exportLocalState() {
    const prefixes = [DONE_PREFIX, NOTES_PREFIX, COLLAPSE_PREFIX];
    const out = {};
    GM_listValues().forEach(k => {
      if (prefixes.some(p => k.startsWith(p))) out[k] = GM_getValue(k, null);
    });
    return out;
  }

  function importLocalState(obj) {
    if (!obj || typeof obj !== 'object') return;
    const prefixes = [DONE_PREFIX, NOTES_PREFIX, COLLAPSE_PREFIX];
    Object.entries(obj).forEach(([k, v]) => {
      if (prefixes.some(p => k.startsWith(p))) GM_setValue(k, v);
    });
  }

  // Firestore → valeur JS
  function fsValueToJS(fv) {
    if (fv == null) return null;
    if (fv.stringValue  != null) return fv.stringValue;
    if (fv.booleanValue != null) return fv.booleanValue;
    if (fv.integerValue != null) return Number(fv.integerValue);
    if (fv.nullValue    != null) return null;
    return null;
  }

  // JS → valeur Firestore
  function jsToFsValue(v) {
    if (typeof v === 'boolean')                       return { booleanValue: v };
    if (typeof v === 'number' && Number.isFinite(v))  return { integerValue: String(Math.trunc(v)) };
    if (v == null)                                    return { nullValue: null };
    return { stringValue: String(v) };
  }

  async function cloudPull() {
    const tok = await cloudEnsureSession();
    if (!tok) return null;

    const url = `${firestoreBase()}/users/${encodeURIComponent(tok.uid)}/state/main`;
    const r   = await fetch(url, { headers: { Authorization: `Bearer ${tok.idToken}` } });

    if (r.status === 404) return null;
    if (!r.ok) throw new Error(`Cloud pull: HTTP ${r.status}`);

    const doc = await r.json().catch(() => ({}));
    const fields = doc?.fields?.payload?.mapValue?.fields || {};
    const out = {};
    for (const [k, fv] of Object.entries(fields)) out[k] = fsValueToJS(fv);
    return out;
  }

  async function cloudPush(obj) {
    const tok = await cloudEnsureSession();
    if (!tok) return;

    const url    = `${firestoreBase()}/users/${encodeURIComponent(tok.uid)}/state/main`;
    const fields = {};
    for (const [k, v] of Object.entries(obj || {})) fields[k] = jsToFsValue(v);

    const r = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok.idToken}` },
      body: JSON.stringify({
        fields: {
          payload:   { mapValue: { fields } },
          updatedAt: { integerValue: String(Date.now()) },
        },
      }),
    });
    if (!r.ok) throw new Error(`Cloud push: HTTP ${r.status}`);
  }

  let _pushTimer = null;
  function cloudSchedulePush() {
    if (!cloudEnabled()) return;
    clearTimeout(_pushTimer);
    _pushTimer = setTimeout(async () => {
      try { await cloudPush(exportLocalState()); } catch (_) {}
    }, CFG.cloud.pushDebounceMs || 900);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ROUTING
  // ══════════════════════════════════════════════════════════════════════════
  const path     = decodeURIComponent(window.location.pathname);
  const fullHref = decodeURIComponent(window.location.href);

  const isList = (path.includes('Cat') || fullHref.includes('Cat'))
    && (path.includes('Situation_de_d') || fullHref.includes('Situation_de_d'));
  const isSDD  = /SDD-\d+/i.test(path) && !isList;

  console.log('[UNESS-SDD] path:', path, '| isList:', isList, '| isSDD:', isSDD);

  if (isList) {
    showLoading();
    try {
      if (cloudEnabled()) {
        try { const r = await cloudPull(); if (r) importLocalState(r); } catch (_) {}
      }
      buildListUI(await getData());
    } catch (e) { showError(e); }
  } else if (isSDD) {
    redesignSDDPage();
  } else {
    console.warn('[UNESS-SDD] Page non reconnue, aucune action.');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DONNÉES (liste SDD)
  // ══════════════════════════════════════════════════════════════════════════
  async function getData() {
    let pageItems;
    if (Date.now() - GM_getValue(CACHE_TS, 0) < CACHE_TTL) {
      try { const c = GM_getValue(CACHE_KEY, null); if (c) pageItems = JSON.parse(c); } catch (_) {}
    }
    if (!pageItems) {
      pageItems = await fetchPageItems();
      GM_setValue(CACHE_KEY, JSON.stringify(pageItems));
      GM_setValue(CACHE_TS, Date.now());
    }
    return pageItems.map(item => {
      const tags = tagsForNum(item.num);
      return { ...item, tags, family: tags[0] || '', done: isDone(item.num) };
    });
  }

  async function fetchPageItems() {
    async function getPage(url, ref) {
      const r = await fetch(url, {
        credentials: 'include',
        headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
        referrer: ref,
        method: 'GET',
        mode: 'cors',
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
          num:  parseInt(m[1], 10),
          name: title.replace(/\s*SDD-\d+\s*/i, '').trim(),
        });
      });
      return out;
    }

    const [h1, h2] = await Promise.all([
      getPage(
        BASE + '/lisa/2025/Cat%C3%A9gorie:Situation_de_d%C3%A9part',
        BASE + '/lisa/2025/Accueil'
      ),
      getPage(
        BASE + '/lisa/2025/index.php?title=Cat%C3%A9gorie:Situation_de_d%C3%A9part&pagefrom=Leucorrh%C3%A9es+SDD-104#mw-pages',
        BASE + '/lisa/2025/Cat%C3%A9gorie:Situation_de_d%C3%A9part'
      ),
    ]);

    const seen = new Set();
    return [...parse(h1), ...parse(h2)].filter(i => {
      if (seen.has(i.num)) return false;
      seen.add(i.num);
      return true;
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LIST UI
  // ══════════════════════════════════════════════════════════════════════════
  function showLoading() {
    document.head.innerHTML = '<meta charset="UTF-8"><title>SDD…</title>';
    document.body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;
        min-height:100vh;background:#f8fafc;flex-direction:column;gap:14px;font-family:sans-serif;">
        <div style="width:36px;height:36px;border:3px solid #e2e8f0;border-top-color:#6366f1;
          border-radius:50%;animation:spin .7s linear infinite;"></div>
        <p style="color:#94a3b8;font-size:14px;letter-spacing:.3px;">Chargement…</p>
        <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
      </div>`;
  }

  function showError(e) {
    document.body.innerHTML = `
      <div style="padding:40px;font-family:sans-serif;background:#f8fafc;min-height:100vh;max-width:600px;margin:0 auto">
        <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;padding:20px;margin-top:40px">
          <h2 style="color:#991b1b;font-size:16px;font-weight:600;margin-bottom:8px">⚠ Erreur de chargement</h2>
          <p style="color:#7f1d1d;font-size:14px;">${escapeHtml(e?.message || String(e))}</p>
        </div>
        <p style="margin-top:16px;color:#64748b;font-size:13px;">Vérifiez que vous êtes connecté à LISA, puis rechargez la page.</p>
      </div>`;
  }

  function buildListUI(items) {
    const allTags    = new Set(items.flatMap(i => i.tags || []));
    const families   = [...allTags].sort((a, b) => a.localeCompare(b, 'fr'));
    const hasFamilies = families.length > 0;

    document.title = 'SDD · LISA 2025';
    document.head.innerHTML = `
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <title>SDD · LISA 2025</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="${googleFontLink(CFG.fontFamily, CFG.fontWeights)}" rel="stylesheet">
      <style>
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      ${cssVarsRoot()}

      html,body{
        background:var(--bg);color:var(--text);height:100%;
        font-family:var(--ff);font-size:var(--fs-base);font-weight:var(--fw-base);
        overflow-x:hidden;
      }

      /* ── Header ── */
      header{
        background:var(--surface);border-bottom:1px solid var(--border);
        padding:16px 40px;display:flex;align-items:center;gap:14px;box-shadow:var(--sh);
      }
      .h-badge{
        background:var(--ac);color:#fff;
        font-size:var(--fs-tiny);font-weight:var(--fw-bold);
        letter-spacing:.9px;text-transform:uppercase;
        padding:5px 10px;border-radius:var(--r-sm);flex-shrink:0;
      }
      header h1{
        font-size:calc(var(--fs-base) + 1px);font-weight:var(--fw-semi);
        color:var(--text);letter-spacing:-.2px;
      }
      header h1 span{font-size:var(--fs-small);color:var(--muted);margin-left:10px;font-weight:var(--fw-med)}
      .h-back{
        margin-left:auto;color:var(--muted);text-decoration:none;font-size:var(--fs-small);
        padding:8px 14px;border:1px solid var(--border);border-radius:var(--r);
        transition:all var(--transition);background:var(--surface2);font-weight:var(--fw-med);
        white-space:nowrap;
      }
      .h-back:hover{color:var(--text);border-color:var(--border2);background:#fff}

      /* ── Barre de contrôle ── */
      .ctrl{
        position:sticky;top:0;z-index:200;
        background:rgba(241,245,249,.97);backdrop-filter:blur(10px);
        border-bottom:1px solid var(--border);
        padding:10px 40px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;
      }

      /* Champ de recherche */
      .search-wrap{position:relative;flex:1;min-width:220px;max-width:400px}
      .search-wrap svg{
        position:absolute;left:10px;top:50%;transform:translateY(-50%);
        color:var(--muted);pointer-events:none;
      }
      #search{
        width:100%;padding:9px 11px 9px 34px;
        background:#fff;border:1px solid var(--border);border-radius:var(--r);
        color:var(--text);font-size:var(--fs-small);font-family:inherit;outline:none;
        transition:border-color var(--transition),box-shadow var(--transition);
      }
      #search::placeholder{color:var(--muted)}
      #search:focus{border-color:var(--ac);box-shadow:var(--sh-focus)}

      /* Selects */
      select{
        padding:9px 12px;background:#fff;border:1px solid var(--border);
        border-radius:var(--r);color:var(--text2);font-size:var(--fs-small);
        font-family:inherit;outline:none;cursor:pointer;
        transition:border-color var(--transition),box-shadow var(--transition);
      }
      select:focus{border-color:var(--ac);box-shadow:var(--sh-focus)}

      /* Boutons tri */
      .sort-btns{display:flex;gap:6px}
      .sort-btns button{
        padding:8px 12px;background:#fff;border:1px solid var(--border);
        border-radius:var(--r);color:var(--muted);font-size:var(--fs-small);
        font-family:inherit;font-weight:var(--fw-med);cursor:pointer;
        transition:all var(--transition);white-space:nowrap;
      }
      .sort-btns button:hover{color:var(--text);border-color:var(--border2)}
      .sort-btns button.on{
        background:var(--ac);color:#fff;border-color:var(--ac);
        box-shadow:0 4px 12px rgba(79,70,229,.3);
      }

      #stats{font-size:var(--fs-small);color:var(--muted);white-space:nowrap;margin-left:auto;font-weight:var(--fw-med)}

      #btn-rf{
        padding:8px 12px;background:transparent;border:1px solid var(--border);
        border-radius:var(--r);color:var(--muted);font-size:var(--fs-small);
        font-family:inherit;font-weight:var(--fw-med);cursor:pointer;
        transition:all var(--transition);
      }
      #btn-rf:hover{color:var(--danger);border-color:#fca5a5;background:var(--danger-light)}

      /* ── Liste ── */
      main{padding:20px 40px 70px}
      #list{display:flex;flex-direction:column;gap:7px}

      .row{
        display:grid;
        grid-template-columns:96px 10px 1fr auto 32px 18px;
        align-items:center;gap:12px;
        padding:11px 16px;
        background:var(--surface);border:1px solid var(--border);border-radius:var(--r);
        text-decoration:none;color:var(--text);
        box-shadow:var(--sh);
        transition:box-shadow var(--transition),border-color var(--transition),
                   background var(--transition),transform var(--transition);
      }
      .row:hover{border-color:var(--border2);box-shadow:var(--sh2);background:#fafcff;transform:translateY(-1px)}

      .row-num{
        font-size:var(--fs-rownum);font-weight:var(--fw-bold);
        color:var(--muted);font-variant-numeric:tabular-nums;
      }
      .row-dot{width:8px;height:8px;border-radius:50%;justify-self:center;flex-shrink:0}
      .row-name{
        font-size:var(--fs-row);font-weight:var(--fw-med);color:var(--text2);
        white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;
        transition:color var(--transition);
      }
      .row:hover .row-name{color:var(--ac)}

      .row-tags{display:flex;gap:6px;flex-wrap:nowrap;overflow:hidden;justify-content:flex-end}
      .row-pill{
        font-size:var(--fs-tiny);font-weight:var(--fw-semi);
        padding:3px 9px;border-radius:999px;white-space:nowrap;flex-shrink:0;
      }

      .row-arr{color:var(--border2);font-size:17px;justify-self:end;transition:color var(--transition)}
      .row:hover .row-arr{color:var(--ac)}

      /* Checkbox "faite" */
      .row-ck{
        width:26px;height:26px;border-radius:var(--r-sm);
        border:1.5px solid var(--border2);
        display:grid;place-items:center;
        color:transparent;background:#fff;cursor:pointer;
        user-select:none;font-size:15px;font-weight:var(--fw-bold);
        transition:all var(--transition);flex-shrink:0;
      }
      .row-ck:hover{border-color:var(--ac);box-shadow:var(--sh-focus)}
      .row-ck.on{
        background:var(--ac);border-color:var(--ac);color:#fff;
        box-shadow:0 4px 12px rgba(79,70,229,.3);
      }
      .row-done .row-name{color:var(--muted);text-decoration:line-through}
      .row-done .row-num{opacity:.6}
      .row-done .row-dot{opacity:.4}

      .no-results{
        text-align:center;padding:70px 20px;color:var(--muted);
        font-size:var(--fs-base);
      }
      .no-results span{font-size:32px;display:block;margin-bottom:12px}

      /* ── Responsive ── */
      @media(max-width:640px){
        header,.ctrl,main{padding-left:14px;padding-right:14px}
        .row{grid-template-columns:86px 10px 1fr 28px 16px}
        .row-tags{display:none}
        select{max-width:200px}
      }
      </style>`;

    document.body.innerHTML = '';

    // Header
    const hdr = document.createElement('header');
    hdr.innerHTML = `
      <div class="h-badge">LISA 2025</div>
      <h1>Situations de Départ <span id="hdr-total">${items.length} SDD</span></h1>
      <a class="h-back" href="/lisa/2025/Accueil">← Accueil</a>`;
    document.body.appendChild(hdr);

    // Barre de contrôle
    const ctrl = document.createElement('div');
    ctrl.className = 'ctrl';
    ctrl.innerHTML = `
      <div class="search-wrap">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input id="search" type="text" placeholder="Rechercher…" autocomplete="off" spellcheck="false">
      </div>

      ${hasFamilies ? `<select id="ff" title="Filtrer par spécialité">
        <option value="">Toutes les spécialités</option>
        ${families.map(f => `<option value="${escapeHtml(f)}">${escapeHtml(f)}</option>`).join('')}
      </select>` : ''}

      <select id="st" title="Filtrer par statut">
        <option value="all">Toutes</option>
        <option value="todo">À faire</option>
        <option value="done">Faites ✓</option>
      </select>

      <div class="sort-btns">
        <button class="on" data-s="num">N° ↑</button>
        <button data-s="alpha">A – Z</button>
        ${hasFamilies ? `<button data-s="family">Spécialité</button>` : ''}
      </div>

      <span id="stats"></span>
      <button id="btn-rf" title="Vider le cache et recharger la liste">↺</button>`;
    document.body.appendChild(ctrl);

    const main = document.createElement('main');
    const list = document.createElement('div');
    list.id = 'list';
    main.appendChild(list);
    document.body.appendChild(main);

    // État de la vue
    let sort = 'num', query = '', status = 'all', family = '';

    function render() {
      items.forEach(i => { i.done = isDone(i.num); });

      const q = query.toLowerCase();
      let filtered = items.filter(item => {
        const tags = item.tags || [];
        if (q && !item.name.toLowerCase().includes(q)
               && !String(item.num).includes(q)
               && !tags.some(t => t.toLowerCase().includes(q))) return false;
        if (status === 'done' && !item.done) return false;
        if (status === 'todo' &&  item.done) return false;
        if (family && !tags.includes(family)) return false;
        return true;
      });

      if (sort === 'num')    filtered.sort((a, b) => a.num - b.num);
      if (sort === 'alpha')  filtered.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
      if (sort === 'family') filtered.sort((a, b) =>
        (a.family || 'zzz').localeCompare(b.family || 'zzz', 'fr') || a.num - b.num
      );

      document.getElementById('stats').textContent = `${filtered.length} / ${items.length}`;

      if (!filtered.length) {
        list.innerHTML = `<div class="no-results"><span>🔍</span>Aucune situation trouvée.</div>`;
        return;
      }

      const frag = document.createDocumentFragment();
      filtered.forEach(item => {
        const tags = item.tags || [];
        const c = getFamilyColor(item.family);

        const a = document.createElement('a');
        a.className = `row${item.done ? ' row-done' : ''}`;
        a.href = item.href;

        const pillsHTML = tags.slice(0, 2).map(t => {
          const tc = getFamilyColor(t);
          return `<span class="row-pill" style="background:${tc.pill};color:${tc.text}">${escapeHtml(t)}</span>`;
        }).join('');

        a.innerHTML = `
          <span class="row-num">SDD-${pad3(item.num)}</span>
          <span class="row-dot" style="background:${c.dot}"></span>
          <span class="row-name">${escapeHtml(item.name)}</span>
          <span class="row-tags">${pillsHTML}</span>
          <span class="row-ck ${item.done ? 'on' : ''}" title="${item.done ? 'Marquer comme à faire' : 'Marquer comme faite'}">${item.done ? '✓' : ''}</span>
          <span class="row-arr">›</span>`;

        a.querySelector('.row-ck').addEventListener('click', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          item.done = !item.done;
          setDone(item.num, item.done);
          if (status !== 'all') { render(); return; }
          const ck = a.querySelector('.row-ck');
          ck.classList.toggle('on', item.done);
          ck.textContent = item.done ? '✓' : '';
          ck.title = item.done ? 'Marquer comme à faire' : 'Marquer comme faite';
          a.classList.toggle('row-done', item.done);
        });

        frag.appendChild(a);
      });

      list.innerHTML = '';
      list.appendChild(frag);
    }

    // Events
    document.getElementById('search').addEventListener('input', e => { query = e.target.value; render(); });
    document.getElementById('st').addEventListener('change', e => { status = e.target.value; render(); });
    if (hasFamilies) document.getElementById('ff').addEventListener('change', e => { family = e.target.value; render(); });

    ctrl.querySelectorAll('.sort-btns button').forEach(btn => {
      btn.addEventListener('click', () => {
        ctrl.querySelectorAll('.sort-btns button').forEach(b => b.classList.remove('on'));
        btn.classList.add('on');
        sort = btn.dataset.s;
        render();
      });
    });

    document.getElementById('btn-rf').addEventListener('click', () => {
      GM_setValue(CACHE_TS, 0);
      location.reload();
    });

    // Raccourci "/" pour focus recherche
    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement?.id !== 'search') {
        e.preventDefault();
        document.getElementById('search').focus();
      }
    });

    render();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAGE SDD — REDESIGN
  // ══════════════════════════════════════════════════════════════════════════
  function redesignSDDPage() {
    const style = document.createElement('style');
    style.textContent = `
      @import url('${googleFontLink(CFG.fontFamily, CFG.fontWeights)}');
      ${cssVarsRoot()}

      html,body{
        background:var(--bg)!important;color:var(--text)!important;
        font-family:var(--ff)!important;font-size:var(--fs-base)!important;
        font-weight:var(--fw-base)!important;overflow-x:hidden!important;
      }

      /* Masquer le chrome MediaWiki */
      #mw-navigation,.p-navbar.not-collapsible,#footer-icons,#footer-places,
      #footer-info,#catlinks,.printfooter,#jump-to-nav,#siteSub,.contentHeader,
      #p-tb,.mw-editsection,#mw-head,#mw-panel{display:none!important}

      .flex-fill.container{max-width:100%!important;padding:0!important}
      .flex-fill.container>.row{flex-direction:column!important}
      .flex-fill.container>.row>.col{padding:0!important}
      #content{border:none!important;background:transparent!important;padding:0!important;margin:0!important;box-shadow:none!important}
      .bodyContent{padding:0!important}

      /* ── Breadcrumb ── */
      #sdd-bc{
        background:var(--surface);border-bottom:1px solid var(--border);
        padding:10px 40px;display:flex;align-items:center;gap:8px;
        font-size:var(--fs-small);color:var(--muted);
      }
      #sdd-bc a{color:var(--muted);text-decoration:none;font-weight:var(--fw-med);transition:color var(--transition)}
      #sdd-bc a:hover{color:var(--ac)}
      #sdd-bc .sep{color:var(--border2);user-select:none}

      /* ── Header SDD ── */
      #sdd-top{
        background:var(--surface);border-bottom:1px solid var(--border);
        padding:22px 40px 24px;display:flex;align-items:flex-start;gap:18px;
        box-shadow:0 1px 4px rgba(0,0,0,.06);
      }
      #sdd-top-pill{
        font-size:var(--fs-tiny);font-weight:var(--fw-bold);letter-spacing:.9px;text-transform:uppercase;
        padding:6px 12px;border-radius:var(--r-sm);
        background:var(--ac-light);color:var(--ac);
        flex-shrink:0;margin-top:5px;
      }
      #sdd-top-info{flex:1;min-width:0}
      #sdd-top-title{
        font-size:var(--fs-title);font-weight:var(--fw-heavy);
        letter-spacing:-.5px;line-height:1.25;color:var(--text);
      }
      #sdd-top-family{font-size:var(--fs-small);color:var(--muted);margin-top:8px}
      #sdd-top-family a{color:var(--ac);text-decoration:none;font-weight:var(--fw-semi)}
      #sdd-top-family a:hover{text-decoration:underline}
      #sdd-top-back{
        padding:10px 16px;background:var(--surface2);border:1px solid var(--border);
        border-radius:var(--r);color:var(--muted);font-size:var(--fs-small);
        text-decoration:none;font-family:inherit;font-weight:var(--fw-med);
        transition:all var(--transition);white-space:nowrap;align-self:flex-start;
      }
      #sdd-top-back:hover{color:var(--text);border-color:var(--border2);background:#fff}

      /* ── Layout 2 colonnes ── */
      #sdd-body{
        padding:24px clamp(${CFG.railsMin}px, 3vw, ${CFG.railsMax}px) 70px;
        display:grid;
        grid-template-columns:var(--notes-col) minmax(0,1fr);
        gap:16px;align-items:start;
      }
      #sdd-follow{position:sticky;top:${CFG.stickyTop}px;max-height:calc(100vh - ${CFG.stickyTop + 20}px);overflow-y:auto}

      /* ── Cards ── */
      .sc{
        background:var(--surface);border:1px solid var(--border);
        border-radius:var(--r);overflow:hidden;
        box-shadow:0 1px 3px rgba(0,0,0,.05);
      }
      .sc-head{
        padding:12px 16px;border-bottom:1px solid var(--border);
        display:flex;align-items:center;gap:10px;
        font-size:var(--fs-tiny);font-weight:var(--fw-bold);
        letter-spacing:.8px;text-transform:uppercase;color:var(--muted);
        background:linear-gradient(to bottom,#fff,#fafcff);
        cursor:pointer;user-select:none;
        transition:background var(--transition);
      }
      .sc-head:hover{background:#f5f7ff}
      .sc-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
      .sc-body{padding:18px;min-width:0}
      .sc-toggle{
        margin-left:auto;font-size:15px;color:var(--muted);
        transition:transform var(--transition);
      }
      .sc.collapsed .sc-toggle{transform:rotate(-90deg)}
      .sc.collapsed .sc-body{display:none}

      /* Chips */
      .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
      .chip{
        display:inline-block;padding:7px 13px;border-radius:999px;
        font-size:var(--fs-chip);font-weight:var(--fw-med);
        text-decoration:none;
        transition:opacity var(--transition),transform var(--transition),box-shadow var(--transition);
      }
      .chip:hover{opacity:.85;transform:translateY(-1px);box-shadow:0 3px 8px rgba(0,0,0,.1)}
      .chip-section{
        font-size:var(--fs-tiny);font-weight:var(--fw-bold);letter-spacing:.6px;
        text-transform:uppercase;padding:4px 10px;
        display:inline-block;border-radius:var(--r-sm);margin-bottom:6px;
      }

      /* Table des attendus */
      .at{width:100%;border-collapse:collapse}
      .at thead th{
        padding:10px 12px;text-align:left;
        font-size:var(--fs-tiny);font-weight:var(--fw-bold);
        text-transform:uppercase;letter-spacing:.6px;color:var(--muted);
        background:var(--surface2);border-bottom:1px solid var(--border);
      }
      .at tbody tr{border-bottom:1px solid var(--border);transition:background var(--transition)}
      .at tbody tr:last-child{border-bottom:none}
      .at tbody tr:hover{background:var(--surface2)}
      .at tbody td{padding:11px 12px;font-size:var(--fs-table);vertical-align:top;min-width:0}
      .at td a{color:var(--text2);text-decoration:none;font-weight:var(--fw-med);line-height:1.45}
      .at td a:hover{color:var(--ac)}
      .tag{display:inline-block;padding:3px 8px;margin:2px;border-radius:6px;font-size:var(--fs-tiny);font-weight:var(--fw-semi)}
      .tag-d{background:#eff6ff;color:#1d4ed8}
      .tag-c{background:#f0fdf4;color:#15803d}

      /* ── Boutons dans la card notes ── */
      .md-btn{
        padding:7px 12px;border:1px solid var(--border);border-radius:var(--r-sm);
        background:#fff;cursor:pointer;font-family:inherit;
        font-size:var(--fs-small);font-weight:var(--fw-med);
        color:var(--text2);transition:all var(--transition);
      }
      .md-btn:hover{border-color:var(--border2);background:var(--surface2);color:var(--text)}
      .md-btn.primary{
        background:var(--ac);border-color:var(--ac);color:#fff;
        font-weight:var(--fw-semi);
      }
      .md-btn.primary:hover{background:var(--ac-dark);border-color:var(--ac-dark)}

      /* Checkbox "SDD faite" */
      .done-label{
        display:flex;align-items:center;gap:10px;cursor:pointer;
        user-select:none;margin-bottom:12px;
        padding:10px 12px;border-radius:var(--r-sm);
        border:1px solid var(--border);background:var(--surface2);
        transition:all var(--transition);
      }
      .done-label:hover{border-color:var(--ac);background:var(--ac-light)}
      .done-label input[type=checkbox]{
        width:18px;height:18px;accent-color:var(--ac);cursor:pointer;
      }
      .done-label span{font-size:var(--fs-base);font-weight:var(--fw-semi);color:var(--text)}

      /* Raccourcis hint */
      .shortcuts-hint{
        font-size:var(--fs-tiny);color:var(--muted);line-height:1.8;
        border-top:1px solid var(--border);padding-top:10px;margin-top:10px;
      }
      .shortcuts-hint kbd{
        display:inline-block;padding:1px 5px;border:1px solid var(--border2);
        border-radius:4px;font-family:inherit;font-size:11px;
        background:#fff;color:var(--text2);
      }

      /* ── FIX MOBILE: en dur (pas de CSS var()) ── */
      @media(max-width:${CFG.breakpointOneCol}px){
        #sdd-bc,#sdd-top{padding-left:14px;padding-right:14px}
        #sdd-body{
          grid-template-columns:1fr;
          padding-left:14px;padding-right:14px;
        }
        #sdd-follow{position:static;max-height:none;overflow-y:visible}
        #sdd-top{flex-wrap:wrap}
        #sdd-top-title{font-size:20px}
        #sdd-top-back{order:-1;width:100%}
      }
    `;
    document.head.appendChild(style);

    async function bootSDD() {
      if (cloudEnabled()) {
        try { const r = await cloudPull(); if (r) importLocalState(r); } catch (_) {}
      }
      // Retry jusqu'à ce que les navbox MW soient dans le DOM (max 5s)
      let attempts = 0;
      const tryBuild = () => {
        attempts++;
        const tables = document.querySelectorAll('.navbox table');
        if (tables.length) {
          buildSDD();
        } else if (attempts < 50) {
          setTimeout(tryBuild, 100);
        } else {
          // Fallback : afficher la page avec juste le header/styles, sans les tables
          buildSDD();
        }
      };
      tryBuild();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootSDD);
    else bootSDD();
  }

  function buildSDD() {
    const tables = document.querySelectorAll('.navbox table');
    console.log('[UNESS-SDD] buildSDD() tables trouvées:', tables.length);
    // Ne pas bloquer si pas de tables — on affiche quand même le chrome (header, notes...)

    const fullTitle = document.querySelector('#firstHeading')?.textContent?.trim() || document.title;
    const numMatch  = fullTitle.match(/SDD-(\d+)/i);
    const sddN      = numMatch ? parseInt(numMatch[1], 10) : null;
    const sddNum    = numMatch ? 'SDD-' + pad3(sddN) : '';
    const sddName   = fullTitle.replace(/\s*SDD-\d+\s*/i, '').trim();

    let famille = '', famille_href = '';
    tables[0]?.querySelectorAll('tr').forEach(tr => {
      const th = tr.querySelector('th')?.textContent?.trim();
      const td = tr.querySelector('td');
      if (!td) return;
      if (th === 'Famille') {
        const a = td.querySelector('a');
        famille      = a?.textContent?.trim() || td.textContent.trim();
        famille_href = a?.href || '';
      }
    });

    let items_primary = [], items_secondary = [], items_tertiary = [];
    if (tables[1]) {
      tables[1].querySelectorAll('tr').forEach(tr => {
        const th    = tr.querySelector('th')?.textContent?.trim() || '';
        const links = [...tr.querySelectorAll('td a')].map(a => ({ text: a.textContent.trim(), href: a.href }));
        if      (th.includes('en rapport')) items_primary   = links;
        else if (th.includes('non traités'))items_secondary = links;
        else if (th.includes('general'))    items_tertiary  = links;
      });
    }

    function parseAttendus(table) {
      if (!table) return [];
      return [...table.querySelectorAll('tbody tr')].slice(1).map(tr => {
        const tds = tr.querySelectorAll('td');
        if (!tds.length) return null;
        const a = tds[0]?.querySelector('a');
        return {
          text:    a?.textContent?.trim() || tds[0]?.textContent?.trim() || '',
          href:    a?.href || '',
          domains: (tds[1]?.textContent?.trim() || '').split(',').map(s => s.trim()).filter(Boolean),
          comps:   (tds[2]?.textContent?.trim() || '').split(',').map(s => s.trim()).filter(Boolean),
        };
      }).filter(Boolean);
    }

    const att_famille    = parseAttendus(tables[2]);
    const att_specifique = parseAttendus(tables[3]);
    const att_stage      = parseAttendus(tables[4]);

    // ── Vider et reconstruire le body ──
    document.body.innerHTML = '';

    // Breadcrumb
    const bc = document.createElement('div');
    bc.id = 'sdd-bc';
    bc.innerHTML = `
      <a href="/lisa/2025/Accueil">Accueil</a>
      <span class="sep">›</span>
      <a href="/lisa/2025/Cat%C3%A9gorie:Situation_de_d%C3%A9part">Situations de départ</a>
      <span class="sep">›</span>
      <strong style="color:var(--text2);font-weight:var(--fw-semi)">${escapeHtml(sddNum)}</strong>`;
    document.body.appendChild(bc);

    // Header
    const top = document.createElement('div');
    top.id = 'sdd-top';
    top.innerHTML = `
      <div id="sdd-top-pill">${escapeHtml(sddNum)}</div>
      <div id="sdd-top-info">
        <div id="sdd-top-title">${escapeHtml(sddName)}</div>
        ${famille ? `<div id="sdd-top-family">Famille · <a href="${escapeHtml(famille_href)}">${escapeHtml(famille)}</a></div>` : ''}
      </div>
      <a id="sdd-top-back" href="/lisa/2025/Cat%C3%A9gorie:Situation_de_d%C3%A9part">← Liste SDD</a>`;
    document.body.appendChild(top);

    const body = document.createElement('div');
    body.id = 'sdd-body';

    // ── Helper: card collapsible ──
    function card(title, dotColor, innerHTML, key) {
      const collapsed = (sddN != null && key) ? isCollapsedKey(`sdd_${sddN}_${key}`) : false;
      const div = document.createElement('div');
      div.className = `sc${collapsed ? ' collapsed' : ''}`;
      if (key) div.dataset.key = key;
      div.innerHTML = `
        <div class="sc-head">
          <div class="sc-dot" style="background:${dotColor}"></div>
          ${escapeHtml(title)}
          <span class="sc-toggle">▾</span>
        </div>
        <div class="sc-body">${innerHTML}</div>`;
      return div;
    }

    function chipsBlock(links, bg, color) {
      if (!links.length) return '';
      return `<div class="chips">${links.map(l =>
        `<a class="chip" style="background:${bg};color:${color}" href="${escapeHtml(l.href)}">${escapeHtml(l.text)}</a>`
      ).join('')}</div>`;
    }

    function attTable(rows) {
      if (!rows.length) return '<p style="color:var(--muted);font-size:var(--fs-base);font-style:italic">Aucun attendu.</p>';
      return `<table class="at"><thead><tr>
        <th style="width:55%">Attendu</th>
        <th style="width:25%">Domaines</th>
        <th>Compétences</th>
      </tr></thead><tbody>${rows.map(r => `<tr>
        <td>${r.href ? `<a href="${escapeHtml(r.href)}">${escapeHtml(r.text)}</a>` : escapeHtml(r.text)}</td>
        <td>${r.domains.map(d => `<span class="tag tag-d">${escapeHtml(d)}</span>`).join('')}</td>
        <td>${r.comps.map(c => `<span class="tag tag-c">${escapeHtml(c)}</span>`).join('')}</td>
      </tr>`).join('')}</tbody></table>`;
    }

    // ── Colonne droite : contenu ──
    const content = document.createElement('div');
    content.style.cssText = 'display:flex;flex-direction:column;gap:16px;min-width:0';

    if (items_primary.length || items_secondary.length || items_tertiary.length) {
      let html = '';
      if (items_primary.length)   html += `<span class="chip-section" style="background:#eef2ff;color:#4338ca">En rapport direct</span>${chipsBlock(items_primary,'#eef2ff','#4338ca')}`;
      if (items_secondary.length) html += `<div style="margin-top:14px"><span class="chip-section" style="background:#f1f5f9;color:#475569">Reliés, non traités ici</span>${chipsBlock(items_secondary,'#f1f5f9','#475569')}</div>`;
      if (items_tertiary.length)  html += `<div style="margin-top:14px"><span class="chip-section" style="background:#f0fdf4;color:#15803d">Reliés en général</span>${chipsBlock(items_tertiary,'#f0fdf4','#15803d')}</div>`;
      content.appendChild(card('Items de connaissance', '#6366f1', html, 'items'));
    }

    if (att_famille.length)    content.appendChild(card(`Attendus — ${famille || 'Famille'}`, '#10b981', attTable(att_famille),    'att_famille'));
    if (att_specifique.length) content.appendChild(card('Attendus spécifiques',               '#3b82f6', attTable(att_specifique), 'att_specifique'));
    if (att_stage.length)      content.appendChild(card('Valorisation du stage',              '#f59e0b', attTable(att_stage),      'att_stage'));

    // ── Colonne gauche : notes ──
    const follow = document.createElement('div');
    follow.id = 'sdd-follow';

    if (sddN != null) {
      const notesCollapsed = isCollapsedKey(`sdd_${sddN}_notes`);
      const notesHTML = [
        '<label class="done-label" id="done-wrap">',
        '  <input id="sdd-done" type="checkbox">',
        '  <span>SDD faite ✓</span>',
        '</label>',
        '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:10px">',
        '  <button id="md-save" class="md-btn primary">⌃S Sauver</button>',
        '  <button id="md-toggle" class="md-btn">👁 Aperçu</button>',
        '  <span id="md-status" style="margin-left:auto;font-size:var(--fs-small);color:var(--muted);font-weight:var(--fw-med)"></span>',
        '</div>',
        '<textarea id="md-area" spellcheck="false" style="' +
          'width:100%;min-height:220px;max-height:60vh;resize:vertical;' +
          'padding:10px 12px;border:1px solid var(--border);border-radius:var(--r-sm);' +
          'font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;' +
          'font-size:var(--fs-notes);line-height:1.6;color:var(--text);outline:none;' +
          'background:#fafcff;transition:border-color var(--transition),box-shadow var(--transition)' +
        '" placeholder="Notes Markdown..."></textarea>',
        '<div id="md-prev" style="display:none;margin-top:10px;padding:14px;' +
          'border:1px solid var(--border);border-radius:var(--r-sm);background:#fafcff;min-height:60px"></div>',
        '<div class="shortcuts-hint">',
        '  <kbd>Ctrl/⌘ S</kbd> Sauver &nbsp;',
        '  <kbd>Ctrl/⌘ B</kbd> Gras &nbsp;',
        '  <kbd>Ctrl/⌘ I</kbd> Italique &nbsp;',
        '  <kbd>Ctrl/⌘ U</kbd> Souligné &nbsp;',
        '  <kbd>Tab</kbd> / <kbd>⇧ Tab</kbd> Indent',
        '</div>',
      ].join('\n');
      const noteCard = card('Suivi & notes', '#4f46e5', notesHTML, 'notes');

      if (notesCollapsed) noteCard.classList.add('collapsed');

      const doneEl  = noteCard.querySelector('#sdd-done');
      const saveBtn = noteCard.querySelector('#md-save');
      const togEl   = noteCard.querySelector('#md-toggle');
      const statEl  = noteCard.querySelector('#md-status');
      const areaEl  = noteCard.querySelector('#md-area');
      const prevEl  = noteCard.querySelector('#md-prev');

      doneEl.checked = isDone(sddN);
      areaEl.value   = getNotes(sddN);

      const setStatus = (txt) => { statEl.textContent = txt; };

      const saveNow = () => {
        setNotes(sddN, areaEl.value);
        setStatus('Sauvé ✓');
        clearTimeout(saveNow._t);
        saveNow._t = setTimeout(() => setStatus(''), 1400);
      };

      areaEl.addEventListener('focus', () => {
        areaEl.style.borderColor = 'var(--ac)';
        areaEl.style.boxShadow   = 'var(--sh-focus)';
      });
      areaEl.addEventListener('blur', () => {
        areaEl.style.borderColor = 'var(--border)';
        areaEl.style.boxShadow   = 'none';
      });

      saveBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); saveNow(); });
      doneEl.addEventListener('change', () => setDone(sddN, doneEl.checked));
      // Empêcher le clic sur la checkbox de propager au toggle de la card
      noteCard.querySelector('#done-wrap').addEventListener('click', e => e.stopPropagation());

      let autoTimer = null;
      areaEl.addEventListener('input', () => {
        setStatus('…');
        clearTimeout(autoTimer);
        autoTimer = setTimeout(saveNow, CFG.autosaveDelay);
        if (prevEl.style.display !== 'none') prevEl.innerHTML = mdToHtml(areaEl.value);
      });

      togEl.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const show = prevEl.style.display === 'none';
        prevEl.style.display  = show ? 'block' : 'none';
        areaEl.style.display  = show ? 'none'  : 'block';
        togEl.textContent     = show ? '✏ Éditer' : '👁 Aperçu';
        if (show) prevEl.innerHTML = mdToHtml(areaEl.value);
      });

      // Raccourcis clavier dans la textarea
      areaEl.addEventListener('keydown', (e) => {
        const mod = e.ctrlKey || e.metaKey;
        if (mod && /^[sS]$/.test(e.key)) { e.preventDefault(); saveNow(); return; }
        if (mod && /^[bB]$/.test(e.key)) { e.preventDefault(); wrapSelection(areaEl, '**', '**'); return; }
        if (mod && /^[iI]$/.test(e.key)) { e.preventDefault(); wrapSelection(areaEl, '*', '*'); return; }
        if (mod && /^[uU]$/.test(e.key)) { e.preventDefault(); wrapSelection(areaEl, '__', '__'); return; }
        if (e.key === 'Tab') {
          e.preventDefault();
          e.shiftKey ? outdentSelection(areaEl, CFG.indentSpaces) : indentSelection(areaEl, CFG.indentSpaces);
        }
      });

      // Ctrl/Cmd+S global (quand la card notes est active)
      window.addEventListener('keydown', (e) => {
        if (!(e.ctrlKey || e.metaKey) || !/^[sS]$/.test(e.key)) return;
        if (noteCard.contains(document.activeElement) || prevEl.style.display !== 'none') {
          e.preventDefault();
          saveNow();
        }
      }, { capture: true });

      follow.appendChild(noteCard);
    } else {
      const err = document.createElement('div');
      err.className = 'sc';
      err.innerHTML = `
        <div class="sc-head">
          <div class="sc-dot" style="background:#4f46e5"></div>
          Suivi &amp; notes
        </div>
        <div class="sc-body" style="color:var(--muted);font-style:italic">
          Impossible d'identifier le numéro SDD sur cette page.
        </div>`;
      follow.appendChild(err);
    }

    // Assemblage final
    body.appendChild(follow);
    body.appendChild(content);
    document.body.appendChild(body);

    // ── Gestion du collapse pour toutes les cards ──
    document.querySelectorAll('#sdd-body .sc').forEach(sc => {
      const head = sc.querySelector('.sc-head');
      const key  = sc.dataset.key;
      if (!head || !key || sddN == null) return;

      head.addEventListener('click', (e) => {
        // Ne pas toggle si clic sur un élément interactif
        if (e.target.closest('button,input,textarea,select,a,label')) return;
        const collapsed = sc.classList.toggle('collapsed');
        setCollapsedKey(`sdd_${sddN}_${key}`, collapsed);
      });
    });
  }

})();

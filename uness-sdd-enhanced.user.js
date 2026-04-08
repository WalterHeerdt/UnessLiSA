// ==UserScript==
// @name         UNESS – SDD + ECOS
// @namespace    http://tampermonkey.net/
// @version      14.0
// @description  Liste SDD + redesign pages + notes Markdown + Cloud sync Firebase + Notes communautaires IA + Statut En cours + Date de complétion + Upload ECOS + Point rouge ECOS + Filtre ECOS + Checkbox station faite + Notation /5 + Haptics mobile + ECOS Scoring Panel + Performance globale + Historique par matière
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
// @connect      firebasestorage.googleapis.com
// @connect      storage.googleapis.com
// @connect      docs.google.com
// @connect      identitytoolkit.googleapis.com
// @connect      securetoken.googleapis.com
// @connect      *.googleapis.com
// @connect      api.openai.com
// @connect      cloudfunctions.net
// @connect      haptics.lochie.me
// @require      https://uicdn.toast.com/editor/latest/toastui-editor-all.min.js
// @resource     TOAST_UI_CSS https://uicdn.toast.com/editor/latest/toastui-editor.min.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

(async function () {
  'use strict';

  // ══════════════════════════════════════════════════════════════════════════
  // HAPTICS — WebHaptics (mobile uniquement)
  // ══════════════════════════════════════════════════════════════════════════
  let _hapticTrigger = null;
  (function initHaptics() {
    if (!('ontouchstart' in window) && !navigator.maxTouchPoints) return;
    const s = document.createElement('script');
    s.src = 'https://haptics.lochie.me/haptics.js';
    s.onload = () => {
      try {
        if (window.WebHaptics) {
          const wh = new window.WebHaptics();
          _hapticTrigger = (t) => wh.trigger(t);
        }
      } catch (_) {}
    };
    document.head.appendChild(s);
  })();

  function haptic(type) {
    if (!_hapticTrigger) return;
    try { _hapticTrigger(type); } catch (_) {}
  }
  // ══════════════════════════════════════════════════════════════════════════
  // TOAST UI EDITOR
  // ══════════════════════════════════════════════════════════════════════════
  let _toastAssetsInjected = false;

  function ensureToastAssets() {
    if (_toastAssetsInjected) return;
    _toastAssetsInjected = true;

    try {
      const css = GM_getResourceText('TOAST_UI_CSS');
      if (css) GM_addStyle(css);
    } catch (_) {}

    const style = document.createElement('style');
    style.textContent = `
      .toastui-editor-defaultUI{
        border:none!important;
        border-radius:0!important;
        overflow:visible!important;
        background:#fff!important;
      }
      .toastui-editor-toolbar{
        border-bottom:1px solid var(--border)!important;
        background:var(--surface2)!important;
        padding:3px 6px!important;
        min-height:0!important;
        border-radius:var(--r-sm) var(--r-sm) 0 0!important;
      }
      .toastui-editor-toolbar-group{
        margin:0!important;
      }
      .toastui-editor-toolbar-divider{
        margin:0 3px!important;
      }
      .toastui-editor-mode-switch{
        display:none!important;
      }
      .toastui-editor-main{
        background:#fff!important;
        overflow:visible!important;
      }
      .toastui-editor-contents{
        font-family:var(--ff)!important;
        font-size:13px!important;
        color:var(--text2)!important;
      }
      .toastui-editor-md-container,
      .toastui-editor-ww-container{
        background:#fff!important;
        overflow:visible!important;
      }
      .toastui-editor-ww-container .ProseMirror{
        padding:12px 14px!important;
        min-height:200px!important;
        overflow-y:visible!important;
        border-radius:0 0 var(--r-sm) var(--r-sm)!important;
      }
      .toastui-editor-md-container .toastui-editor-md-preview,
      .toastui-editor-md-container .toastui-editor{
        min-height:200px!important;
        overflow:visible!important;
        border-radius:0 0 var(--r-sm) var(--r-sm)!important;
      }
      .toastui-editor-main-container{
        overflow:visible!important;
      }
      .toastui-editor-popup{
        z-index:1200!important;
      }
      .toastui-editor-ww-container .ProseMirror ul{
        list-style:disc!important;
        padding-left:1.5em!important;
      }
      .toastui-editor-ww-container .ProseMirror ol{
        list-style:decimal!important;
        padding-left:1.5em!important;
      }
      .toastui-editor-ww-container .ProseMirror li{
        position:static!important;
      }
      .toastui-editor-ww-container .ProseMirror li::before{
        display:none!important;
        content:none!important;
      }
      .toastui-editor-defaultUI *{
        scrollbar-width:none!important;
      }
      .toastui-editor-defaultUI *::-webkit-scrollbar{
        display:none!important;
        width:0!important;
        height:0!important;
      }
      .toastui-editor-toolbar-icons{
        opacity:.9;
      }
      .toastui-editor-toolbar-icons:hover{
        opacity:1;
      }
    `;
    document.head.appendChild(style);
  }
  // ══════════════════════════════════════════════════════════════════════════
  // CONFIG
  // ══════════════════════════════════════════════════════════════════════════
  const SDD_TAGS = {1:["Hépato-Gastro-Entérologie"],2:["Hépato-Gastro-Entérologie","Maladies Infectieuses et Tropicales"],3:["Chirurgie Viscérale et Digestive","Médecine d'Urgence"],4:["Médecine d'Urgence","Chirurgie Viscérale et Digestive"],5:["Hépato-Gastro-Entérologie"],6:["Hépato-Gastro-Entérologie","Médecine Interne Immunologie"],7:["Hépato-Gastro-Entérologie","MPR"],8:["Hépato-Gastro-Entérologie","Oncologie"],9:["Chirurgie Viscérale et Digestive"],10:["Médecine d'Urgence","Hépato-Gastro-Entérologie"],11:["Pédiatrie"],12:["Médecine d'Urgence","Gériatrie"],13:["Médecine d'Urgence","Hépato-Gastro-Entérologie"],14:["Médecine d'Urgence","Hépato-Gastro-Entérologie"],15:["Médecine Vasculaire","Médecine Cardiovasculaire"],16:["Médecine Interne Immunologie","Hématologie"],17:["Médecine Interne Immunologie","Oncologie"],18:["Médecine Cardiovasculaire"],19:["Médecine Vasculaire","Chirurgie Vasculaire"],20:["Pneumologie","Médecine d'Urgence"],21:["Médecine Interne Immunologie"],22:["Néphrologie","Médecine d'Urgence"],23:["Urologie"],24:["Endocrinologie - Diabétologie - Nutrition","Gynécologie Médicale"],25:["Endocrinologie - Diabétologie - Nutrition"],26:["Pédiatrie","Endocrinologie - Diabétologie - Nutrition"],27:["Gériatrie","Médecine d'Urgence"],28:["Médecine Intensive Réanimation","Neurologie"],29:["Neurologie"],30:["Endocrinologie - Diabétologie - Nutrition","Gériatrie"],31:["Gériatrie","Neurologie"],32:["Pédiatrie","Médecine d'Urgence"],33:["Gynécologie Médicale"],34:["Anesthésie Réanimation"],35:["MPR","Rhumatologie"],36:["Rhumatologie","MPR"],37:["Pédiatrie","Dermatologie Vénérologie"],38:["Médecine d'Urgence","Médecine Intensive Réanimation"],39:["Pédiatrie"],40:["Gynécologie Médicale","Endocrinologie - Diabétologie - Nutrition"],41:["Endocrinologie - Diabétologie - Nutrition","Chirurgie Plastique"],42:["Médecine Cardiovasculaire"],43:["Médecine d'Urgence","Médecine Cardiovasculaire"],44:["Médecine d'Urgence","Maladies Infectieuses et Tropicales"],45:["Médecine d'Urgence","Médecine Intensive Réanimation"],46:["Pédiatrie","Médecine d'Urgence"],47:["Hépato-Gastro-Entérologie"],48:["Pédiatrie"],49:["Médecine d'Urgence"],50:["Médecine d'Urgence","Neurologie"],51:["Endocrinologie - Diabétologie - Nutrition"],52:["ORL - CCF","Hépato-Gastro-Entérologie"],53:["Gynécologie Obstétrique"],54:["Médecine Interne Immunologie","Néphrologie"],55:["Pédiatrie","Hématologie"],56:["Rhumatologie"],57:["Endocrinologie - Diabétologie - Nutrition"],58:["Hématologie","Médecine Interne Immunologie"],59:["Hématologie"],60:["Médecine d'Urgence","Anesthésie Réanimation"],61:["Endocrinologie - Diabétologie - Nutrition","Néphrologie"],62:["ORL - CCF","Neurologie"],63:["Urologie"],64:["ORL - CCF","Neurologie"],65:["Chirurgie Orthopédique et Traumatologique","Rhumatologie"],66:["Neurologie","MPR"],67:["Rhumatologie"],68:["Chirurgie Orthopédique et Traumatologique","Pédiatrie"],69:["Médecine Vasculaire","Chirurgie Vasculaire"],70:["Rhumatologie","Chirurgie Orthopédique et Traumatologique"],71:["Chirurgie Orthopédique et Traumatologique","Médecine d'Urgence"],72:["Rhumatologie","Chirurgie Orthopédique et Traumatologique"],73:["Neurologie"],74:["Neurologie"],75:["Chirurgie Orthopédique et Traumatologique"],76:["Médecine Vasculaire"],77:["Médecine Interne Immunologie","Rhumatologie"],78:["Dermatologie Vénérologie"],79:["Endocrinologie - Diabétologie - Nutrition","Gynécologie Médicale"],80:["Dermatologie Vénérologie"],81:["Dermatologie Vénérologie"],82:["Dermatologie Vénérologie"],83:["Chirurgie Plastique"],84:["Dermatologie Vénérologie"],85:["Dermatologie Vénérologie"],86:["Gériatrie","MPR"],87:["Médecine d'Urgence","Maladies Infectieuses et Tropicales"],88:["Dermatologie Vénérologie","Allergologie"],89:["Hématologie","Médecine Interne Immunologie"],90:["Pédiatrie","Dermatologie Vénérologie"],91:["Dermatologie Vénérologie","ORL - CCF"],92:["Dermatologie Vénérologie","Médecine Vasculaire"],93:["Dermatologie Vénérologie","Maladies Infectieuses et Tropicales"],94:["Gynécologie Médicale"],95:["Hépato-Gastro-Entérologie","Urologie"],96:["Urologie","Maladies Infectieuses et Tropicales"],97:["Urologie","Médecine d'Urgence"],98:["Gynécologie Obstétrique"],99:["Gynécologie Obstétrique","Urologie"],100:["Urologie","Médecine d'Urgence"],101:["Urologie","Maladies Infectieuses et Tropicales"],102:["Urologie"],103:["Urologie","Gériatrie"],104:["Gynécologie Médicale"],105:["Gynécologie Obstétrique","Urologie"],106:["Gynécologie Obstétrique","Oncologie"],107:["Gynécologie Obstétrique","Urologie"],108:["Urologie"],109:["Gynécologie Obstétrique"],110:["Gynécologie Obstétrique","Anesthésie Réanimation"],111:["Gynécologie Obstétrique","Médecine d'Urgence"],112:["Gynécologie Médicale","Gynécologie Obstétrique"],113:["Pédiatrie","Endocrinologie - Diabétologie - Nutrition"],114:["Psychiatrie","Médecine d'Urgence"],115:["Pédiatrie","Neurologie"],116:["Psychiatrie"],117:["Psychiatrie","Gériatrie"],118:["Neurologie","Médecine d'Urgence"],119:["Gériatrie","Médecine d'Urgence"],120:["Neurologie","Médecine d'Urgence"],121:["Neurologie","Médecine d'Urgence"],122:["Psychiatrie"],123:["Psychiatrie"],124:["Psychiatrie"],125:["Psychiatrie"],126:["Neurologie"],127:["ORL - CCF","Neurologie"],128:["Neurologie"],129:["Psychiatrie","Neurologie"],130:["Neurologie","ORL - CCF"],131:["Gériatrie","Neurologie"],132:["Psychiatrie","Endocrinologie - Diabétologie - Nutrition"],133:["Pédiatrie","Psychiatrie"],134:["ORL - CCF","Neurologie"],135:["Psychiatrie","Neurologie"],136:["Psychiatrie"],137:["Psychiatrie","Gynécologie Obstétrique"],138:["Ophtalmologie","Neurologie"],139:["Ophtalmologie","Chirurgie Plastique"],140:["ORL - CCF"],141:["Ophtalmologie"],142:["ORL - CCF","Médecine d'Urgence"],143:["Ophtalmologie","Neurologie"],144:["ORL - CCF","CMF"],145:["ORL - CCF"],146:["ORL - CCF"],147:["ORL - CCF","Médecine d'Urgence"],148:["Endocrinologie - Diabétologie - Nutrition","Chirurgie Viscérale et Digestive"],149:["Médecine d'Urgence","ORL - CCF"],150:["CMF","Chirurgie Orale"],151:["ORL - CCF","Médecine d'Urgence"],152:["Ophtalmologie","Médecine d'Urgence"],153:["ORL - CCF"],154:["ORL - CCF"],155:["ORL - CCF","Allergologie"],156:["ORL - CCF"],157:["Ophtalmologie","Pédiatrie"],158:["ORL - CCF","CMF"],159:["Médecine Cardiovasculaire","Médecine d'Urgence"],160:["Médecine d'Urgence","Médecine Intensive Réanimation"],161:["Médecine d'Urgence","Médecine Cardiovasculaire"],162:["Médecine d'Urgence","Pneumologie"],163:["Pneumologie","Maladies Infectieuses et Tropicales"],164:["Gynécologie Médicale","Oncologie"],165:["Médecine Cardiovasculaire","Médecine d'Urgence"],166:["Médecine d'Urgence","Médecine Cardiovasculaire"],167:["Pneumologie","Médecine d'Urgence"],168:["Médecine d'Urgence","Chirurgie Plastique"],169:["Médecine d'Urgence","Maladies Infectieuses et Tropicales"],170:["Médecine d'Urgence","Chirurgie Plastique"],171:["Médecine d'Urgence","Chirurgie Viscérale et Digestive"],172:["Médecine d'Urgence","Neurochirurgie"],173:["Médecine d'Urgence","Chirurgie Orthopédique et Traumatologique"],174:["Médecine d'Urgence","CMF"],175:["Médecine d'Urgence","Neurochirurgie"],176:["Médecine d'Urgence","Médecine Intensive Réanimation"],177:["Médecine d'Urgence","Chirurgie Thoracique et Cardiovasculaire"],178:["Radiologie et Imagerie Médicale"],179:["Anatomie et Cytologie Pathologiques"],180:["Anatomie et Cytologie Pathologiques"],181:["Anatomie et Cytologie Pathologiques","Oncologie"],182:["Biologie Médicale","Urologie"],183:["Biologie Médicale","Neurologie"],184:["ORL - CCF"],185:["Médecine Cardiovasculaire"],186:["Médecine Interne Immunologie","Maladies Infectieuses et Tropicales"],187:["Biologie Médicale","Maladies Infectieuses et Tropicales"],188:["Maladies Infectieuses et Tropicales","Biologie Médicale"],189:["Biologie Médicale","Urologie"],190:["Biologie Médicale","Maladies Infectieuses et Tropicales"],191:["Biologie Médicale","Hépato-Gastro-Entérologie"],192:["Médecine Intensive Réanimation","Biologie Médicale"],193:["Biologie Médicale","Hématologie"],194:["Endocrinologie - Diabétologie - Nutrition"],195:["Médecine Cardiovasculaire","Endocrinologie - Diabétologie - Nutrition"],196:["Biologie Médicale","Néphrologie"],197:["Néphrologie","Biologie Médicale"],198:["Hépato-Gastro-Entérologie"],199:["Néphrologie"],200:["Endocrinologie - Diabétologie - Nutrition","Néphrologie"],201:["Néphrologie"],202:["Néphrologie","Médecine Intensive Réanimation"],203:["Allergologie","Dermatologie Vénérologie"],204:["Médecine Cardiovasculaire","Médecine d'Urgence"],205:["Hépato-Gastro-Entérologie","Médecine d'Urgence"],206:["Hépato-Gastro-Entérologie"],207:["Hématologie","Médecine Interne Immunologie"],208:["Endocrinologie - Diabétologie - Nutrition","Médecine d'Urgence"],209:["Endocrinologie - Diabétologie - Nutrition","Médecine d'Urgence"],210:["Hématologie","Médecine Interne Immunologie"],211:["Hépato-Gastro-Entérologie","Néphrologie"],212:["Néphrologie"],213:["Hématologie"],214:["Hématologie"],215:["Hématologie"],216:["Hématologie"],217:["Hématologie"],218:["Hématologie","Hépato-Gastro-Entérologie"],219:["Allergologie","Hématologie"],220:["Hématologie"],221:["Hématologie"],222:["Hématologie"],223:["Hématologie"],224:["Radiologie et Imagerie Médicale","Hépato-Gastro-Entérologie"],225:["Radiologie et Imagerie Médicale","ORL - CCF"],226:["Radiologie et Imagerie Médicale","Neurologie"],227:["Radiologie et Imagerie Médicale","Neurochirurgie"],228:["Radiologie et Imagerie Médicale","Chirurgie Orthopédique et Traumatologique"],229:["Radiologie et Imagerie Médicale","Gynécologie Obstétrique"],230:["Radiologie et Imagerie Médicale","Médecine Cardiovasculaire"],231:["Radiologie et Imagerie Médicale"],232:["Radiologie et Imagerie Médicale"],233:["Radiologie et Imagerie Médicale"],234:["Maladies Infectieuses et Tropicales","Biologie Médicale"],235:["Maladies Infectieuses et Tropicales","Santé Publique"],236:["Biologie Médicale","Maladies Infectieuses et Tropicales"],237:["Médecine d'Urgence","Médecine Légale et Expertise médicale"],238:["Hépato-Gastro-Entérologie","Pneumologie"],239:["Anesthésie Réanimation"],240:["Psychiatrie"],241:["Médecine d'Urgence","Psychiatrie"],242:["Pneumologie","Addictologie"],243:["Chirurgie Orthopédique et Traumatologique"],244:["Psychiatrie","Médecine d'Urgence"],245:["MPR","Chirurgie Orthopédique et Traumatologique"],246:["Médecine Générale","Santé Publique"],247:["MPR"],248:["Médecine Cardiovasculaire","Hématologie"],249:["Rhumatologie"],250:["Anesthésie Réanimation"],251:["Médecine Interne Immunologie"],252:["Médecine Cardiovasculaire"],253:["Médecine Cardiovasculaire","Néphrologie"],254:["Oncologie"],255:["Maladies Infectieuses et Tropicales"],256:["Psychiatrie"],257:["Gynécologie Médicale"],258:["Anesthésie Réanimation"],259:["Médecine d'Urgence","Anesthésie Réanimation"],260:["MPR","Rhumatologie"],261:["Pédiatrie","Anesthésie Réanimation"],262:["Maladies Infectieuses et Tropicales","Médecine d'Urgence"],263:["Dermatologie Vénérologie","Maladies Infectieuses et Tropicales"],264:["Médecine Interne Immunologie","Néphrologie"],265:["Pédiatrie"],266:["Gériatrie","Médecine Interne Immunologie"],267:["Médecine Interne Immunologie","Gériatrie"],268:["Gynécologie Obstétrique"],269:["Psychiatrie"],270:["Endocrinologie - Diabétologie - Nutrition"],271:["Anesthésie Réanimation","Médecine Intensive Réanimation"],272:["Anesthésie Réanimation","Hématologie"],273:["Pédiatrie","Gynécologie Obstétrique"],274:["Maladies Infectieuses et Tropicales","Pneumologie"],275:["Hématologie"],276:["Gériatrie","MPR"],277:["Rhumatologie","MPR"],278:["Gynécologie Médicale","Endocrinologie - Diabétologie - Nutrition"],279:["Médecine Interne Immunologie"],280:["Endocrinologie - Diabétologie - Nutrition"],281:["Endocrinologie - Diabétologie - Nutrition"],282:["Médecine Cardiovasculaire"],283:["Pneumologie"],284:["Endocrinologie - Diabétologie - Nutrition"],285:["Médecine Cardiovasculaire"],286:["Pneumologie"],287:["Médecine Cardiovasculaire"],288:["Psychiatrie"],289:["Neurologie"],290:["Néphrologie"],291:["Médecine Interne Immunologie","Maladies Infectieuses et Tropicales"],292:["Psychiatrie"],293:["Psychiatrie"],294:["Gynécologie Médicale"],295:["Gériatrie"],296:["Pédiatrie"],297:["Oncologie"],298:["Neurologie","Gériatrie"],299:["Allergologie"],300:["Anesthésie Réanimation"],301:["Maladies Infectieuses et Tropicales","Pneumologie"],302:["Maladies Infectieuses et Tropicales"],303:["Santé Publique","Oncologie"],304:["Gynécologie Obstétrique","Endocrinologie - Diabétologie - Nutrition"],305:["Maladies Infectieuses et Tropicales","Gynécologie Médicale"],306:["Rhumatologie","Gériatrie"],307:["Gynécologie Obstétrique","Génétique Médicale"],308:["Pédiatrie","Santé Publique"],309:["Psychiatrie","Médecine d'Urgence"],310:["Maladies Infectieuses et Tropicales","Santé Publique"],311:["Santé Publique","Maladies Infectieuses et Tropicales"],312:["Gynécologie Obstétrique"],313:["Santé Publique"],314:["Santé Publique","Pneumologie"],315:["Médecine et Santé au Travail"],316:["Médecine et Santé au Travail","MPR"],317:["Gynécologie Médicale","Santé Publique"],318:["Pédiatrie","Santé Publique"],319:["Santé Publique","Endocrinologie - Diabétologie - Nutrition"],320:["Santé Publique","Médecine Cardiovasculaire"],321:["Pédiatrie","Médecine Légale et Expertise médicale"],322:["Santé Publique","Maladies Infectieuses et Tropicales"],323:["Pédiatrie","Santé Publique"],324:["Endocrinologie - Diabétologie - Nutrition","Santé Publique"],325:["Santé Publique","Pédiatrie"],326:["Médecine et Santé au Travail","Médecine d'Urgence"],327:["Oncologie","Médecine Interne Immunologie"],328:["Médecine Interne Immunologie"],329:["Santé Publique","Médecine Légale et Expertise médicale"],330:["Gériatrie","Santé Publique"],331:["Médecine Légale et Expertise médicale"],332:["Gynécologie Obstétrique"],333:["Médecine Légale et Expertise médicale","Médecine d'Urgence"],334:["Santé Publique","Médecine Interne Immunologie"],335:["Médecine Cardiovasculaire"],336:["Maladies Infectieuses et Tropicales","Médecine d'Urgence"],337:["Oncologie","Médecine Interne Immunologie"],338:["Santé Publique"],339:["Médecine et Santé au Travail"],340:["Médecine d'Urgence","Médecine Intensive Réanimation"],341:["Psychiatrie","Médecine d'Urgence"],342:["Santé Publique"],343:["Médecine Légale et Expertise médicale","Santé Publique"],344:["Psychiatrie","Médecine et Santé au Travail"],345:["MPR","Santé Publique"],346:["Santé Publique","Médecine d'Urgence"],347:["Santé Publique"],348:["Médecine Interne Immunologie"],349:["Psychiatrie"],350:["Médecine Légale et Expertise médicale","Gynécologie Obstétrique"],351:["Médecine Légale et Expertise médicale","Médecine d'Urgence"],352:["Santé Publique"],353:["MPR","Médecine Cardiovasculaire"],354:["Santé Publique"],355:["Santé Publique","Gériatrie"],356:["Anesthésie Réanimation"]};

  const CFG = {
    fontFamily: 'Inter', fontWeights: [400, 500, 600, 700, 800],
    fsBase:16, fsSmall:14, fsTiny:12, fsTitle:26, fsH1:24, fsH2:22, fsH3:20, fsH4:18,
    fsRow:16, fsRowNum:13, fsChip:14, fsTable:15, fsNotes:13,
    fwBase:400, fwMedium:500, fwSemibold:600, fwBold:700, fwHeavy:800,
    notesColWidth:420, notesColMin:260, notesColMax:700,
    railsMin:14, railsMax:48, breakpointOneCol:980, stickyTop:14,
    cacheTTLms: 48 * 60 * 60 * 1000,
    ecosCacheTTLms: 6 * 60 * 60 * 1000,
    autosaveDelay: 4000, indentSpaces: 2,
    ecos: {
      maxFileSizeMB: 50,
      allowedTypes: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'],
      allowedExt: ['.pdf', '.png', '.jpg', '.jpeg'],
      storageBucket: 'uneisa-26e34.firebasestorage.app',
    },
    cloud: {
      enabled: true, usernameKey: 'uness_cloud_user_v1', pinKey: 'uness_cloud_pin_v1',
      apiKey: 'AIzaSyAHyhowmrjXjGyJKbPibpeevBluc0qFtzg', projectId: 'uneisa-26e34', pushDebounceMs: 900,
    },
    community: { adminUid: 'LjUIKPPNONS9ar4WdPhVWYDM1CG3', summaryTTLms: 24*60*60*1000, minNotes: 1, openaiModel: 'gpt-4o-mini' },
  };

  const BASE      = 'https://livret.uness.fr';
  const CACHE_KEY = 'uness_sdd_v5';
  const CACHE_TS  = 'uness_sdd_ts_v5';
  const CACHE_TTL = CFG.cacheTTLms;

  // ══════════════════════════════════════════════════════════════════════════
  // STOCKAGE LOCAL
  // ══════════════════════════════════════════════════════════════════════════
  const DONE_PREFIX        = 'uness_sdd_done_v1_';
  const NOTES_PREFIX       = 'uness_sdd_notes_v1_';
  const COLLAPSE_PREFIX    = 'uness_sdd_collapse_v1_';
  const STATUS_PREFIX      = 'uness_sdd_status_v1_';
  const DONE_DATE_PREFIX   = 'uness_sdd_donedate_v1_';
  const REVIEW_PREFIX      = 'uness_sdd_review_v1_';
  const ECOS_PRESENCE_KEY    = 'uness_ecos_presence_v1';
  const ECOS_PRESENCE_TS_KEY = 'uness_ecos_presence_ts_v1';
  const ECOS_DONE_PREFIX     = 'uness_ecos_done_v1_';
  const ECOS_SCORES_PREFIX   = 'uness_ecos_scores_v1_';

  // ── ECOS Scoring — Firestore persistence ──
  async function saveEcosScore(sddN, fileId, scoreData) {
    // scoreData: { gridScore, gridTotal, performance, finalScore, matiere, sddName, fileName, date }
    const tok = await cloudEnsureSession(); if (!tok) throw new Error('Non authentifié');
    const docId = `${sddN}_${fileId}`;
    const url = `${firestoreBase()}/users/${encodeURIComponent(tok.uid)}/ecosScores/${docId}`;
    const fields = {};
    for (const [k, v] of Object.entries(scoreData)) {
      if (typeof v === 'number') fields[k] = { doubleValue: v };
      else if (typeof v === 'string') fields[k] = { stringValue: v };
    }
    fields.sddN = { integerValue: String(sddN) };
    fields.fileId = { stringValue: fileId };
    fields.updatedAt = { integerValue: String(Date.now()) };
    const r = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok.idToken}` },
      body: JSON.stringify({ fields }),
    });
    if (!r.ok) throw new Error(`Score save HTTP ${r.status}`);
  }

  async function loadEcosScore(sddN, fileId) {
    const tok = await cloudEnsureSession(); if (!tok) return null;
    const docId = `${sddN}_${fileId}`;
    const url = `${firestoreBase()}/users/${encodeURIComponent(tok.uid)}/ecosScores/${docId}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${tok.idToken}` } });
    if (r.status === 404) return null;
    if (!r.ok) return null;
    const doc = await r.json().catch(() => ({}));
    const f = doc?.fields || {};
    const out = {};
    for (const [k, fv] of Object.entries(f)) {
      if (fv.doubleValue != null) out[k] = Number(fv.doubleValue);
      else if (fv.integerValue != null) out[k] = Number(fv.integerValue);
      else if (fv.stringValue != null) out[k] = fv.stringValue;
    }
    return out;
  }

  async function loadAllEcosScores() {
    const tok = await cloudEnsureSession(); if (!tok) return [];
    const url = `${firestoreBase()}/users/${encodeURIComponent(tok.uid)}/ecosScores`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${tok.idToken}` } });
    if (!r.ok) return [];
    const json = await r.json().catch(() => ({}));
    const docs = json.documents || [];
    return docs.map(doc => {
      const f = doc?.fields || {};
      const out = {};
      for (const [k, fv] of Object.entries(f)) {
        if (fv.doubleValue != null) out[k] = Number(fv.doubleValue);
        else if (fv.integerValue != null) out[k] = Number(fv.integerValue);
        else if (fv.stringValue != null) out[k] = fv.stringValue;
      }
      return out;
    });
  }

  const pad3        = (n) => String(parseInt(n, 10)).padStart(3, '0');
  const doneKey     = (n) => DONE_PREFIX      + pad3(n);
  const notesKey    = (n) => NOTES_PREFIX     + pad3(n);
  const statusKey   = (n) => STATUS_PREFIX    + pad3(n);
  const doneDateKey = (n) => DONE_DATE_PREFIX + pad3(n);
  const reviewKey   = (n) => REVIEW_PREFIX    + pad3(n);
  const REVIEW_STEPS = [1, 3, 7, 30];

  function getEcosStationDone(sddN, fileId) { return !!GM_getValue(`${ECOS_DONE_PREFIX}${sddN}_${fileId}`, false); }
  function setEcosStationDone(sddN, fileId, val) { GM_setValue(`${ECOS_DONE_PREFIX}${sddN}_${fileId}`, !!val); cloudSchedulePush(); }

  const _ratingsCache    = new Map();
  const _ratingsFetching = new Set();

  function gsParse(gsUrl) {
    const m = String(gsUrl || '').match(/^gs:\/\/([^/]+)\/(.+)$/);
    if (!m) return null;
    return { bucket: m[1], path: m[2] };
  }
  function normalizeToFirebaseEndpoint(u) {
    const s = String(u || '').trim();
    let m = s.match(/^gs:\/\/([^/]+)\/(.+)$/);
    if (m) return `https://firebasestorage.googleapis.com/v0/b/${m[1]}/o/${encodeURIComponent(m[2])}?alt=media`;
    m = s.match(/^https:\/\/storage\.googleapis\.com\/([^/]+)\/(.+)$/);
    if (m) return `https://firebasestorage.googleapis.com/v0/b/${m[1]}/o/${encodeURIComponent(m[2])}?alt=media`;
    return s;
  }
  function makePublicHttpUrl(bucket, path) {
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media`;
  }
  async function resolvePublicEcosUrl(gsUrl) {
    const p = gsParse(gsUrl); if (!p) return '';
    const candidates = [p.bucket, `${CFG.cloud.projectId}.appspot.com`];
    for (const b of candidates) {
      const u = makePublicHttpUrl(b, p.path);
      try {
        let r = await fetch(u, { method: 'HEAD', mode: 'cors' });
        if (r.status === 405 || r.status === 400) r = await fetch(u, { method: 'GET', mode: 'cors' });
        if (r.ok || r.status === 302 || r.status === 304) return u;
      } catch (_) {}
    }
    return makePublicHttpUrl(candidates[0], p.path);
  }
  function gsToPublicHttp(gsUrl) {
    const m = String(gsUrl || '').match(/^gs:\/\/([^/]+)\/(.+)$/);
    if (!m) return '';
    return `https://firebasestorage.googleapis.com/v0/b/${m[1]}/o/${encodeURIComponent(m[2])}?alt=media`;
  }

  function getReview(n) { try { return JSON.parse(GM_getValue(reviewKey(n), 'null')) || null; } catch { return null; } }
  function setReview(n, obj) { GM_setValue(reviewKey(n), JSON.stringify(obj)); cloudSchedulePush(); }
  function isDueForReview(n) {
    const r = getReview(n);
    if (!r || !r.lastReview) return false;
    const daysSince = (Date.now() - new Date(r.lastReview).getTime()) / 86400000;
    return daysSince >= REVIEW_STEPS[Math.min(r.step, REVIEW_STEPS.length - 1)];
  }
  function markReviewed(n) {
    const r = getReview(n) || { step: 0 };
    setReview(n, { lastReview: new Date().toISOString(), step: Math.min((r.step || 0) + 1, REVIEW_STEPS.length - 1) });
  }
  function initReview(n) { if (!getReview(n)) setReview(n, { lastReview: new Date().toISOString(), step: 0 }); }

  function getStatus(n) {
    const v = GM_getValue(statusKey(n), '');
    if (v === 'inprogress' || v === 'done') return v;
    if (GM_getValue(doneKey(n), false)) return 'done';
    return 'todo';
  }
  function setStatus(n, status) {
    GM_setValue(statusKey(n), status);
    GM_setValue(doneKey(n), status === 'done');
    if (status === 'done') {
      if (!GM_getValue(doneDateKey(n), '')) GM_setValue(doneDateKey(n), new Date().toISOString());
      initReview(n);
    } else {
      GM_setValue(doneDateKey(n), '');
    }
    cloudSchedulePush();
  }
  const getDoneDate = (n) => GM_getValue(doneDateKey(n), '');
  function formatDoneDate(iso, includeYear = false) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const opts = { day: 'numeric', month: 'short' };
      if (includeYear) opts.year = 'numeric';
      return d.toLocaleDateString('fr-FR', opts).replace('.', '');
    } catch { return ''; }
  }
  const isDone   = (n)    => getStatus(n) === 'done';
  const setDone  = (n, v) => setStatus(n, v ? 'done' : 'todo');
  const getNotes = (n)      => GM_getValue(notesKey(n), '');
  const setNotes = (n, md)  => { GM_setValue(notesKey(n), String(md ?? '')); cloudSchedulePush(); };
  const isCollapsedKey  = (k)    => !!GM_getValue(COLLAPSE_PREFIX + k, false);
  const setCollapsedKey = (k, v) => { GM_setValue(COLLAPSE_PREFIX + k, !!v); cloudSchedulePush(); };

  // ══════════════════════════════════════════════════════════════════════════
  // ECOS PRESENCE CACHE (1 requête Firestore, cache 6h)
  // ══════════════════════════════════════════════════════════════════════════
  async function loadEcosPresence() {
    const ts = GM_getValue(ECOS_PRESENCE_TS_KEY, 0);
    if (Date.now() - ts < CFG.ecosCacheTTLms) {
      try {
        const c = JSON.parse(GM_getValue(ECOS_PRESENCE_KEY, '[]'));
        if (Array.isArray(c) && c.length > 0) return new Set(c);
      } catch (_) {}
    }
    if (!cloudEnabled()) return new Set();
    try {
      const tok = await cloudEnsureSession();
      if (!tok) return new Set();
      // Collection group query sur toutes les sous-collections "files" sous ecos/
      const queryUrl = `https://firestore.googleapis.com/v1/projects/${CFG.cloud.projectId}/databases/(default)/documents:runQuery`;
      const r = await fetch(queryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok.idToken}` },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: 'files', allDescendants: true }],
            select: { fields: [] },
            limit: 1000,
          }
        })
      });
      if (!r.ok) return new Set();
      const results = await r.json().catch(() => []);
      const nums = new Set();
      for (const row of (Array.isArray(results) ? results : [])) {
        if (!row.document?.name) continue;
        const m = row.document.name.match(/\/ecos\/(\d+)\/files\//);
        if (m) nums.add(parseInt(m[1], 10));
      }
      GM_setValue(ECOS_PRESENCE_KEY, JSON.stringify([...nums]));
      GM_setValue(ECOS_PRESENCE_TS_KEY, Date.now());
      return nums;
    } catch (_) { return new Set(); }
  }

  function invalidateEcosPresenceCache() { GM_setValue(ECOS_PRESENCE_TS_KEY, 0); }

  // ══════════════════════════════════════════════════════════════════════════
  // RATINGS COMMUNAUTAIRES
  // ══════════════════════════════════════════════════════════════════════════
  async function loadFileRating(sddN, fileId) {
    const ck = `${sddN}_${fileId}`;
    if (_ratingsCache.has(ck)) return _ratingsCache.get(ck);
    if (_ratingsFetching.has(ck)) return null;
    _ratingsFetching.add(ck);
    try {
      const tok = await cloudEnsureSession();
      if (!tok) return null;
      const r = await fetch(`${firestoreBase()}/ecos/${sddN}/ratings/${fileId}`, { headers: { Authorization: `Bearer ${tok.idToken}` } });
      if (r.status === 404) {
        const res = { avg: 0, count: 0, myRating: 0 };
        _ratingsCache.set(ck, res);
        return res;
      }
      if (!r.ok) return null;
      const doc = await r.json().catch(() => ({}));
      const votes = doc.fields?.votes?.mapValue?.fields || {};
      let sum = 0, count = 0;
      for (const [, fv] of Object.entries(votes)) {
        const v = parseInt(fv.integerValue || 0, 10);
        if (v >= 1 && v <= 5) { sum += v; count++; }
      }
      const myRating = parseInt(votes[tok.uid]?.integerValue || 0, 10);
      const res = { avg: count > 0 ? Math.round(sum / count * 10) / 10 : 0, count, myRating };
      _ratingsCache.set(ck, res);
      return res;
    } catch (_) { return null; }
    finally { _ratingsFetching.delete(ck); }
  }

  async function submitFileRating(sddN, fileId, rating) {
    const tok = await cloudEnsureSession();
    if (!tok) throw new Error('Non authentifié');
    const ck  = `${sddN}_${fileId}`;
    const url = `${firestoreBase()}/ecos/${sddN}/ratings/${fileId}`;
    let existingVotes = {};
    try {
      const rGet = await fetch(url, { headers: { Authorization: `Bearer ${tok.idToken}` } });
      if (rGet.ok) existingVotes = (await rGet.json().catch(() => ({}))).fields?.votes?.mapValue?.fields || {};
    } catch (_) {}
    existingVotes[tok.uid] = { integerValue: String(rating) };
    const r = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok.idToken}` },
      body: JSON.stringify({ fields: { votes: { mapValue: { fields: existingVotes } }, updatedAt: { integerValue: String(Date.now()) } } }),
    });
    if (!r.ok) throw new Error(`Rating HTTP ${r.status}`);
    let sum = 0, count = 0;
    for (const [, fv] of Object.entries(existingVotes)) {
      const v = parseInt(fv.integerValue || 0, 10);
      if (v >= 1 && v <= 5) { sum += v; count++; }
    }
    const res = { avg: count > 0 ? Math.round(sum / count * 10) / 10 : 0, count, myRating: rating };
    _ratingsCache.set(ck, res);
    return res;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // COULEURS
  // ══════════════════════════════════════════════════════════════════════════
  const PALETTE = [
    { pill: '#e0e7ff', text: '#4338ca', dot: '#6366f1' }, { pill: '#fce7f3', text: '#be185d', dot: '#ec4899' },
    { pill: '#d1fae5', text: '#065f46', dot: '#10b981' }, { pill: '#fff7ed', text: '#9a3412', dot: '#f97316' },
    { pill: '#ede9fe', text: '#5b21b6', dot: '#8b5cf6' }, { pill: '#cffafe', text: '#155e75', dot: '#06b6d4' },
    { pill: '#fef9c3', text: '#713f12', dot: '#d97706' }, { pill: '#fee2e2', text: '#991b1b', dot: '#ef4444' },
    { pill: '#f0fdf4', text: '#14532d', dot: '#22c55e' }, { pill: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
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
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
        --inprogress:#fb923c; --inprogress-light:#fff7ed;
        --r:8px; --r-sm:8px; --sh:none; --sh2:none; --sh-focus:0 0 0 2px rgba(79,70,229,.15);
        --ff:'${escapeHtml(CFG.fontFamily)}',system-ui,sans-serif;
        --fs-base:${CFG.fsBase}px; --fs-small:${CFG.fsSmall}px; --fs-tiny:${CFG.fsTiny}px;
        --fs-title:${CFG.fsTitle}px; --fs-h1:${CFG.fsH1}px; --fs-h2:${CFG.fsH2}px;
        --fs-h3:${CFG.fsH3}px; --fs-h4:${CFG.fsH4}px; --fs-row:${CFG.fsRow}px;
        --fs-rownum:${CFG.fsRowNum}px; --fs-chip:${CFG.fsChip}px;
        --fs-table:${CFG.fsTable}px; --fs-notes:${CFG.fsNotes}px;
        --fw-base:${CFG.fwBase}; --fw-med:${CFG.fwMedium}; --fw-semi:${CFG.fwSemibold};
        --fw-bold:${CFG.fwBold}; --fw-heavy:${CFG.fwHeavy};
        --notes-col:${CFG.notesColWidth}px;
        --rails-min:${CFG.railsMin}px; --rails-max:${CFG.railsMax}px;
        --transition:.15s ease;
      }`;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MARKDOWN
  // ══════════════════════════════════════════════════════════════════════════
  function mdToHtml(md) {
    let s = escapeHtml(md || '');
    s = s.replace(/__([^_\n]+)__/g, '<u>$1</u>');
    s = s.replace(/`([^`\n]+)`/g, '<code style="background:#f1f5f9;padding:2px 6px;border-radius:6px;border:1px solid #e2e8f0;font-size:.9em">$1</code>');
    s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--ac);text-decoration:none;font-weight:var(--fw-semi)">$1</a>');
    s = s.replace(/^######\s(.+)$/gm, '<h6 style="margin:.1em 0;font-size:11px;font-weight:600">$1</h6>');
    s = s.replace(/^#####\s(.+)$/gm,  '<h5 style="margin:.1em 0;font-size:11px;font-weight:700">$1</h5>');
    s = s.replace(/^####\s(.+)$/gm,   '<h4 style="margin:.1em 0;font-size:12px;font-weight:700">$1</h4>');
    s = s.replace(/^###\s(.+)$/gm,    '<h3 style="margin:.1em 0;font-size:12px;font-weight:700;color:var(--ac)">$1</h3>');
    s = s.replace(/^##\s(.+)$/gm,     '<h2 style="margin:.1em 0;font-size:13px;font-weight:700">$1</h2>');
    s = s.replace(/^#\s(.+)$/gm,      '<h1 style="margin:.15em 0;font-size:14px;font-weight:800">$1</h1>');
    s = s.replace(/^(?:- |\* )(.*)$/gm, '<li>$1</li>');
      s = s.replace(/(<li>.*<\/li>\n?)+/g, m => `<ul style="margin:.1em 0;padding-left:1.1em;list-style:disc;color:var(--text2);font-size:12px">${m.replace(/<\/li>\n<li>/g, '</li><li>')}</ul>`);
    s = s.replace(/\n(?!\n)/g, '<br>');
    s = s.split(/\n+/).map(block => {
      const t = block.trim();
      if (!t) return '';
      if (t.startsWith('<h') || t.startsWith('<ul')) return block;
      return `<p style="margin:.25em 0;color:var(--text2);line-height:1.6;font-size:12px">${block}</p>`;
    }).join('');
    return s || '<p style="color:var(--muted);margin:0;font-style:italic">Aucune note.</p>';
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CLOUD SYNC — Firebase Auth + Firestore REST
  // ══════════════════════════════════════════════════════════════════════════
  const TOKEN_KEY = 'uness_cloud_token_v1';

  function cloudEnabled() {
    const { cloud: c } = CFG;
    return !!(c?.enabled && c?.apiKey && c?.projectId && !c.apiKey.includes('PASTE_') && !c.projectId.includes('PASTE_'));
  }
  const getCloudUsername = ()    => (GM_getValue(CFG.cloud.usernameKey, '') || '').trim();
  const setCloudUsername = (u)   => GM_setValue(CFG.cloud.usernameKey, (u || '').trim());
  const getCloudPin      = ()    => (GM_getValue(CFG.cloud.pinKey, '') || '').trim();
  const setCloudPin      = (p)   => GM_setValue(CFG.cloud.pinKey, (p || '').trim());
  const cloudEmail = (username) => `${(username || '').trim().toLowerCase()}@uness.local`;
  const loadToken  = () => { try { return JSON.parse(GM_getValue(TOKEN_KEY, '') || ''); } catch { return {}; } };
  const saveToken  = (obj) => GM_setValue(TOKEN_KEY, JSON.stringify(obj || {}));

  const IDENTITY_URL     = `https://identitytoolkit.googleapis.com/v1`;
  const SECURE_TOKEN_URL = `https://securetoken.googleapis.com/v1`;
  const firestoreBase    = () => `https://firestore.googleapis.com/v1/projects/${CFG.cloud.projectId}/databases/(default)/documents`;

  async function firebasePost(url, body) {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { const err = new Error(j?.error?.message || `HTTP ${r.status}`); err._firebase = j; throw err; }
    return j;
  }
  async function cloudSignInOrSignUp(username, pin) {
    const email = cloudEmail(username), apiKey = CFG.cloud.apiKey;
    const storeToken = (j) => {
      const expiresAt = Date.now() + Number(j.expiresIn) * 1000 - 30_000;
      saveToken({ idToken: j.idToken, refreshToken: j.refreshToken, expiresAt, uid: j.localId });
      return { uid: j.localId, idToken: j.idToken };
    };
    try {
      return storeToken(await firebasePost(`${IDENTITY_URL}/accounts:signUp?key=${encodeURIComponent(apiKey)}`, { email, password: pin, returnSecureToken: true }));
    } catch (signUpErr) {
      const msg = signUpErr.message || '';
      if (msg.includes('EMAIL_EXISTS') || msg.includes('DUPLICATE')) {
        return storeToken(await firebasePost(`${IDENTITY_URL}/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`, { email, password: pin, returnSecureToken: true }));
      }
      throw signUpErr;
    }
  }
  async function cloudRefreshIfNeeded() {
    const t = loadToken();
    if (t?.idToken && t?.expiresAt && Date.now() < t.expiresAt) return t;
    if (!t?.refreshToken) return {};
    const r = await fetch(`${SECURE_TOKEN_URL}/token?key=${encodeURIComponent(CFG.cloud.apiKey)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: t.refreshToken }).toString(),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { saveToken({}); return {}; }
    const out = { idToken: j.id_token, refreshToken: j.refresh_token || t.refreshToken, expiresAt: Date.now() + Number(j.expires_in) * 1000 - 30_000, uid: j.user_id || t.uid };
    saveToken(out); return out;
  }
  async function cloudEnsureSession() {
    if (!cloudEnabled()) return null;
    let username = getCloudUsername(), pin = getCloudPin();
    if (!username) { username = (prompt('Cloud — nom d\'utilisateur :') || '').trim(); if (!username) return null; setCloudUsername(username); }
    if (!pin) {
      let pinOk = false;
      while (!pinOk) { pin = (prompt('Cloud — PIN (min. 6 caractères, stocké localement) :') || '').trim(); if (!pin) return null; if (pin.length >= 6) pinOk = true; else alert('⚠️ PIN trop court — minimum 6 caractères requis par Firebase.'); }
      setCloudPin(pin);
    } else if (pin.length < 6) { setCloudPin(''); pin = ''; alert('⚠️ Ton PIN stocké est trop court (min. 6 car.). Saisis-en un nouveau.'); return cloudEnsureSession(); }
    let tok = await cloudRefreshIfNeeded();
    if (!tok?.idToken) { await cloudSignInOrSignUp(username, pin); tok = await cloudRefreshIfNeeded(); }
    return tok?.idToken ? tok : null;
  }

  function exportLocalState() {
    const prefixes = [DONE_PREFIX, NOTES_PREFIX, COLLAPSE_PREFIX, STATUS_PREFIX, DONE_DATE_PREFIX, REVIEW_PREFIX, ECOS_DONE_PREFIX];
    const out = {};
    GM_listValues().forEach(k => { if (prefixes.some(p => k.startsWith(p))) out[k] = GM_getValue(k, null); });
    return out;
  }
  function importLocalState(obj) {
    if (!obj || typeof obj !== 'object') return;
    const prefixes = [DONE_PREFIX, NOTES_PREFIX, COLLAPSE_PREFIX, STATUS_PREFIX, DONE_DATE_PREFIX, REVIEW_PREFIX, ECOS_DONE_PREFIX];
    Object.entries(obj).forEach(([k, v]) => { if (prefixes.some(p => k.startsWith(p))) GM_setValue(k, v); });
  }
  function fsValueToJS(fv) { if (fv == null) return null; if (fv.stringValue != null) return fv.stringValue; if (fv.booleanValue != null) return fv.booleanValue; if (fv.integerValue != null) return Number(fv.integerValue); return null; }
  function jsToFsValue(v) { if (typeof v === 'boolean') return { booleanValue: v }; if (typeof v === 'number' && Number.isFinite(v)) return { integerValue: String(Math.trunc(v)) }; if (v == null) return { nullValue: null }; return { stringValue: String(v) }; }

  async function cloudPull() {
    const tok = await cloudEnsureSession(); if (!tok) return null;
    const r = await fetch(`${firestoreBase()}/users/${encodeURIComponent(tok.uid)}/state/main`, { headers: { Authorization: `Bearer ${tok.idToken}` } });
    if (r.status === 404) return null; if (!r.ok) throw new Error(`Cloud pull: HTTP ${r.status}`);
    const doc = await r.json().catch(() => ({}));
    const fields = doc?.fields?.payload?.mapValue?.fields || {};
    const out = {}; for (const [k, fv] of Object.entries(fields)) out[k] = fsValueToJS(fv);
    return out;
  }
  async function cloudPush(obj) {
    const tok = await cloudEnsureSession(); if (!tok) return;
    const fields = {}; for (const [k, v] of Object.entries(obj || {})) fields[k] = jsToFsValue(v);
    const r = await fetch(`${firestoreBase()}/users/${encodeURIComponent(tok.uid)}/state/main`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok.idToken}` },
      body: JSON.stringify({ fields: { payload: { mapValue: { fields } }, updatedAt: { integerValue: String(Date.now()) } } }),
    });
    if (!r.ok) throw new Error(`Cloud push: HTTP ${r.status}`);
  }
  let _pushTimer = null;
  function cloudSchedulePush() { if (!cloudEnabled()) return; clearTimeout(_pushTimer); _pushTimer = setTimeout(async () => { try { await cloudPush(exportLocalState()); } catch (_) {} }, CFG.cloud.pushDebounceMs || 900); }

  // ══════════════════════════════════════════════════════════════════════════
  // COMMUNITY NOTES
  // ══════════════════════════════════════════════════════════════════════════
  const FUNCTIONS_BASE = `https://europe-west1-${CFG.cloud.projectId}.cloudfunctions.net`;
  const MIGRATE_KEY    = 'uness_community_migrated_v1';

  async function callFunction(name, payload) {
    const tok = await cloudEnsureSession(); if (!tok) throw new Error('Non authentifié');
    const r = await fetch(`${FUNCTIONS_BASE}/${name}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tok.idToken}` },
      body: JSON.stringify({ data: payload }),
    });
    const text = await r.text().catch(() => '{}'); let json; try { json = JSON.parse(text); } catch { json = {}; }
    if (!r.ok || json?.error) throw new Error(json?.error?.message || json?.error?.status || 'HTTP ' + r.status);
    return json?.result ?? json;
  }
  async function communityMigrateIfNeeded() {
    if (!cloudEnabled() || GM_getValue(MIGRATE_KEY, false)) return;
    try {
      const notes = {};
      GM_listValues().forEach(k => { if (!k.startsWith(NOTES_PREFIX)) return; const val = GM_getValue(k, '').trim(); if (!val) return; notes[k.replace(NOTES_PREFIX, '')] = val; });
      if (Object.keys(notes).length === 0) { GM_setValue(MIGRATE_KEY, true); return; }
      await callFunction('migrateAllNotes', { notes }); GM_setValue(MIGRATE_KEY, true);
    } catch (e) { console.warn('[UNESS-COMMUNITY] Migration échouée:', e.message); }
  }
  async function publicNoteMirrorPush(sddN, md) { if (!cloudEnabled() || !sddN) return; try { await callFunction('mirrorPublicNote', { sddN, note: md || '' }); } catch (_) {} }
  async function communityNotesLoad(sddN, sddName, containerEl, forceRefresh = false) {
    if (!cloudEnabled() || !sddN) return; containerEl.innerHTML = communityLoadingHTML();
    try {
      const result = await callFunction('generateCommunitySummary', { sddN, sddName, forceRefresh });
      const { summary, noteCount, updatedAt } = result;
      if (!summary) { containerEl.innerHTML = communityEmptyHTML(); return; }
      containerEl.innerHTML = communitySummaryHTML(summary, noteCount, updatedAt);
      const regenBtn = containerEl.querySelector('#community-regen-btn');
      if (regenBtn) regenBtn.addEventListener('click', () => communityNotesLoad(sddN, sddName, containerEl, true));
    } catch (e) { containerEl.innerHTML = communityErrorHTML(e.message); }
  }
  function communitySummaryHTML(summary, noteCount, updatedAt) {
    if (!summary || !summary.trim()) return communityEmptyHTML();
    const date = new Date(updatedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return '<div style="display:flex;align-items:center;justify-content:space-between;font-size:var(--fs-tiny);color:var(--muted);margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--border)">'
      + '<span>Synthèse de <strong style="color:var(--text)">' + noteCount + '</strong> note(s) · Générée le ' + date + '</span>'
      + '<button id="community-regen-btn" style="background:none;border:1px solid var(--border);color:var(--muted);font-size:var(--fs-tiny);font-family:inherit;padding:2px 8px;cursor:pointer;border-radius:3px;line-height:1.4" title="Forcer la regénération">↻ Regénérer</button>'
      + '</div>'
      + communityMarkdownToHtml(summary);
  }
  function communityMarkdownToHtml(md) {
    if (!md) return '';
    const lines = md.split('\n'); let html = '', inList = false;
    lines.forEach(function(line) {
      if (line.startsWith('### ')) { if (inList) { html += '</ul>'; inList = false; } html += '<div style="font-size:var(--fs-small);font-weight:var(--fw-bold);color:var(--ac);margin:16px 0 6px;letter-spacing:.3px">' + inlineMarkdown(line.slice(4)) + '</div>'; return; }
      if (line.startsWith('## ')) { if (inList) { html += '</ul>'; inList = false; } html += '<div style="font-size:var(--fs-base);font-weight:var(--fw-bold);color:var(--text);margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid var(--border)">' + inlineMarkdown(line.slice(3)) + '</div>'; return; }
      if (line.startsWith('# ')) { if (inList) { html += '</ul>'; inList = false; } html += '<div style="font-size:var(--fs-h4);font-weight:var(--fw-heavy);color:var(--text);margin:22px 0 10px">' + inlineMarkdown(line.slice(2)) + '</div>'; return; }
      var bulletMatch = line.match(/^(\s*)[-*] (.+)$/);
      if (bulletMatch) {
        if (!inList) { html += '<ul style="margin:4px 0 10px 18px;padding:0;list-style:disc">'; inList = true; }
        var indent = bulletMatch[1].length > 0 ? 'margin-left:16px;' : '';
        html += '<li style="' + indent + 'margin-bottom:4px;color:var(--text2);font-size:var(--fs-small);line-height:1.6">' + inlineMarkdown(bulletMatch[2]) + '</li>'; return;
      }
      if (!line.trim()) { if (inList) { html += '</ul>'; inList = false; } return; }
      if (/^\|[-:| ]+\|$/.test(line.trim())) return;
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        if (inList) { html += '</ul>'; inList = false; }
        var cells = line.trim().slice(1, -1).split('|');
        html += '<tr>' + cells.map(function(c) { return '<td style="padding:6px 10px;border:1px solid var(--border);font-size:var(--fs-small);color:var(--text2)">' + inlineMarkdown(c.trim()) + '</td>'; }).join('') + '</tr>'; return;
      }
      if (inList) { html += '</ul>'; inList = false; }
      html += '<p style="margin:6px 0;color:var(--text2);font-size:var(--fs-small);line-height:1.65">' + inlineMarkdown(line) + '</p>';
    });
    if (inList) html += '</ul>';
    html = html.replace(/(<tr>.*?<\/tr>)+/gs, function(match) { return '<div style="overflow-x:auto;margin:10px 0"><table style="width:100%;border-collapse:collapse">' + match + '</table></div>'; });
    return html;
  }
  function inlineMarkdown(s) {
    if (!s) return '';
    return s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>').replace(/`(.+?)`/g, '<code style="background:#f1f5f9;padding:1px 5px;border-radius:4px;font-size:.9em">$1</code>');
  }
  function communityLoadingHTML() { return `<div style="display:flex;align-items:center;gap:10px;color:var(--muted);font-size:var(--fs-small)"><div style="width:16px;height:16px;border:2px solid var(--border);border-top-color:var(--ac);border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0"></div>Chargement de la synthèse communautaire…</div>`; }
  function communityEmptyHTML() { return `<p style="color:var(--muted);font-size:var(--fs-small);font-style:italic;margin:0">Pas encore assez de notes pour générer une synthèse.</p>`; }
  function communityErrorHTML(msg) { return `<p style="color:var(--danger);font-size:var(--fs-small);margin:0">⚠ Erreur : ${escapeHtml(msg)}</p>`; }

  // ══════════════════════════════════════════════════════════════════════════
  // DEBUG
  // ══════════════════════════════════════════════════════════════════════════
  window.debugCloud = async function () {
    const log = (emoji, msg, data) => console.log(`${emoji} [UNESS-CLOUD] ${msg}`, data ?? '');
    log('🔍', '=== DEBUG FIREBASE START ==='); log('✅', 'cloudEnabled():', cloudEnabled());
    const tok = loadToken(); log('🎟️ ', 'Token actuel:', { uid: tok?.uid || '(aucun)', hasToken: !!tok?.idToken });
    try { const r = await cloudRefreshIfNeeded(); log('✅', 'Refresh OK — uid:', r.uid); } catch (e) { console.error('Refresh échoué:', e); }
    try { const d = await cloudPull(); log('✅', `Pull OK — ${Object.keys(d || {}).length} clés`); } catch (e) { console.error('cloudPull() échoué:', e); }
    try { await cloudPush(exportLocalState()); log('✅', 'Push OK'); } catch (e) { console.error('cloudPush() échoué:', e); }
    log('🏁', '=== DEBUG FIREBASE END ==='); return '✅ Debug terminé — voir les logs';
  };
  window.debugCloudReset = function () { setCloudUsername(''); setCloudPin(''); saveToken({}); console.log('🔄 Credentials réinitialisés.'); };
  window.debugLocalState = function () { const s = exportLocalState(); console.table(Object.entries(s).map(([k, v]) => ({ clé: k, valeur: String(v).slice(0, 60) }))); return s; };
  window.cloudDisconnect = function () { setCloudUsername(''); setCloudPin(''); saveToken({}); location.reload(); };

  const LOGOUT_BTN_CSS = `
    .btn-logout { padding:4px 8px; background:transparent; border:1px solid var(--border); border-radius:var(--r-sm); color:var(--muted); font-size:var(--fs-tiny); font-family:inherit; cursor:pointer; opacity:.45; transition:all var(--transition); line-height:1; flex-shrink:0; }
    .btn-logout:hover { opacity:1; color:var(--danger); border-color:#fca5a5; background:var(--danger-light) }
  `;

  // ══════════════════════════════════════════════════════════════════════════
  // ROUTING
  // ══════════════════════════════════════════════════════════════════════════
  const path     = decodeURIComponent(window.location.pathname);
  const fullHref = decodeURIComponent(window.location.href);
  const isList = (path.includes('Cat') || fullHref.includes('Cat')) && (path.includes('Situation_de_d') || fullHref.includes('Situation_de_d'));
  const isSDD  = /SDD-\d+/i.test(path) && !isList;

  if (isList) {
    showLoading();
    try {
      if (cloudEnabled()) { try { const r = await cloudPull(); if (r) importLocalState(r); } catch (_) {} }
      buildListUI(await getData());
    } catch (e) { showError(e); }
  } else if (isSDD) {
    redesignSDDPage();
  } else {
    console.warn('[UNESS-SDD] Page non reconnue, aucune action.');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DONNÉES
  // ══════════════════════════════════════════════════════════════════════════
  async function getData() {
    let pageItems;
    if (Date.now() - GM_getValue(CACHE_TS, 0) < CACHE_TTL) { try { const c = GM_getValue(CACHE_KEY, null); if (c) pageItems = JSON.parse(c); } catch (_) {} }
    if (!pageItems) { pageItems = await fetchPageItems(); GM_setValue(CACHE_KEY, JSON.stringify(pageItems)); GM_setValue(CACHE_TS, Date.now()); }
    return pageItems.map(item => { const tags = tagsForNum(item.num); return { ...item, tags, family: tags[0] || '', status: 'todo', done: false }; });
  }
  function tagsForNum(n) { try { if (typeof SDD_TAGS !== 'undefined' && SDD_TAGS?.[n]) return SDD_TAGS[n]; } catch (_) {} return []; }
  async function fetchPageItems() {
    async function getPage(url, ref) {
      const r = await fetch(url, { credentials: 'include', headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' }, referrer: ref, method: 'GET', mode: 'cors' });
      return r.text();
    }
    function parse(html) {
      const doc = new DOMParser().parseFromString(html, 'text/html'); const out = [];
      doc.querySelectorAll('#mw-pages li a').forEach(a => {
        const title = a.getAttribute('title') || a.textContent.trim();
        const m = title.match(/SDD-(\d+)/i); if (!m) return;
        out.push({ title, href: BASE + a.getAttribute('href'), num: parseInt(m[1], 10), name: title.replace(/\s*SDD-\d+\s*/i, '').trim() });
      });
      return out;
    }
    const [h1, h2] = await Promise.all([
      getPage(BASE + '/lisa/2025/Cat%C3%A9gorie:Situation_de_d%C3%A9part', BASE + '/lisa/2025/Accueil'),
      getPage(BASE + '/lisa/2025/index.php?title=Cat%C3%A9gorie:Situation_de_d%C3%A9part&pagefrom=Leucorrh%C3%A9es+SDD-104#mw-pages', BASE + '/lisa/2025/Cat%C3%A9gorie:Situation_de_d%C3%A9part'),
    ]);
    const seen = new Set();
    return [...parse(h1), ...parse(h2)].filter(i => { if (seen.has(i.num)) return false; seen.add(i.num); return true; });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LIST UI
  // ══════════════════════════════════════════════════════════════════════════
  function showLoading() {
    document.head.innerHTML = '<meta charset="UTF-8"><title>SDD…</title>';
    document.body.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;flex-direction:column;gap:14px;font-family:sans-serif;"><div style="width:36px;height:36px;border:3px solid #e2e8f0;border-top-color:#6366f1;border-radius:50%;animation:spin .7s linear infinite;"></div><p style="color:#94a3b8;font-size:14px;letter-spacing:.3px;">Chargement…</p><style>@keyframes spin{to{transform:rotate(360deg)}}</style></div>`;
  }
  function showError(e) {
    document.body.innerHTML = `<div style="padding:40px;font-family:sans-serif;background:#f8fafc;min-height:100vh;max-width:600px;margin:0 auto"><div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;padding:20px;margin-top:40px"><h2 style="color:#991b1b;font-size:16px;font-weight:600;margin-bottom:8px">⚠ Erreur de chargement</h2><p style="color:#7f1d1d;font-size:14px;">${escapeHtml(e?.message || String(e))}</p></div><p style="margin-top:16px;color:#64748b;font-size:13px;">Vérifiez que vous êtes connecté à LISA, puis rechargez la page.</p></div>`;
  }

  async function buildListUI(items) {
    const allTags   = new Set(items.flatMap(i => i.tags || []));
    const families  = [...allTags].sort((a, b) => a.localeCompare(b, 'fr'));
    const hasFamilies = families.length > 0;

    // Charger présence ECOS en arrière-plan
    let ecosPresence = new Set();
    if (cloudEnabled()) {
      loadEcosPresence().then(s => {
        ecosPresence = s;
        document.querySelectorAll('.row-ecos-dot').forEach(dot => {
          dot.style.display = ecosPresence.has(parseInt(dot.dataset.sddNum, 10)) ? 'inline-block' : 'none';
        });
        // Si le filtre ECOS était déjà sélectionné avant la fin du chargement, re-rendre
        if (status === 'ecos') render();
      }).catch(() => {});
    }

    document.title = 'SDD · LISA 2025';
    document.head.innerHTML = `
      <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      <title>SDD · LISA 2025</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link href="${googleFontLink(CFG.fontFamily, CFG.fontWeights)}" rel="stylesheet">
      <style>
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      ${cssVarsRoot()}
      html,body{background:var(--bg);color:var(--text);height:100%;font-family:var(--ff);font-size:var(--fs-base);font-weight:var(--fw-base);overflow-x:hidden;scrollbar-width:none}
      html::-webkit-scrollbar,body::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}
      *{scrollbar-width:none!important}
      *::-webkit-scrollbar{display:none!important;width:0!important;height:0!important}
      header{background:var(--surface);border-bottom:1px solid var(--border);padding:16px 40px;display:flex;align-items:center;gap:14px}
      .h-badge{background:var(--ac);color:#fff;font-size:var(--fs-tiny);font-weight:var(--fw-bold);letter-spacing:.9px;text-transform:uppercase;padding:5px 10px;border-radius:var(--r-sm);flex-shrink:0}
      header h1{font-size:calc(var(--fs-base) + 1px);font-weight:var(--fw-semi);color:var(--text);letter-spacing:-.2px}
      header h1 span{font-size:var(--fs-small);color:var(--muted);margin-left:10px;font-weight:var(--fw-med)}
      .h-back{margin-left:auto;color:var(--muted);text-decoration:none;font-size:var(--fs-small);padding:8px 14px;border:1px solid var(--border);border-radius:var(--r);transition:all var(--transition);background:var(--surface2);font-weight:var(--fw-med);white-space:nowrap}
      .h-back:hover{color:var(--text);border-color:var(--border2);background:#fff}
      .ctrl{position:sticky;top:0;z-index:200;background:rgba(241,245,249,.97);backdrop-filter:blur(10px);border-bottom:1px solid var(--border);padding:10px 40px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
      .search-wrap{position:relative;flex:1;min-width:220px;max-width:400px}
      .search-wrap svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none}
      #search{width:100%;padding:9px 11px 9px 34px;background:#fff;border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-size:var(--fs-small);font-family:inherit;outline:none;transition:border-color var(--transition)}
      #search::placeholder{color:var(--muted)} #search:focus{border-color:var(--ac)}
      select{padding:9px 12px;background:#fff;border:1px solid var(--border);border-radius:var(--r);color:var(--text2);font-size:var(--fs-small);font-family:inherit;outline:none;cursor:pointer;transition:border-color var(--transition)}
      select:focus{border-color:var(--ac)}
      .sort-btns{display:flex;gap:6px}
      .sort-btns button{padding:8px 12px;background:#fff;border:1px solid var(--border);border-radius:var(--r);color:var(--muted);font-size:var(--fs-small);font-family:inherit;font-weight:var(--fw-med);cursor:pointer;transition:all var(--transition);white-space:nowrap}
      .sort-btns button:hover{color:var(--text);border-color:var(--border2)} .sort-btns button.on{background:var(--ac);color:#fff;border-color:var(--ac)}
      #stats{font-size:var(--fs-small);color:var(--muted);white-space:nowrap;margin-left:auto;font-weight:var(--fw-med)}
      #btn-rf{padding:8px 12px;background:transparent;border:1px solid var(--border);border-radius:var(--r);color:var(--muted);font-size:var(--fs-small);font-family:inherit;font-weight:var(--fw-med);cursor:pointer;transition:all var(--transition)}
      #btn-rf:hover{color:var(--danger);border-color:#fca5a5;background:var(--danger-light)}
      main{padding:20px 40px 70px} #list{display:flex;flex-direction:column;gap:6px}
      .row{display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);text-decoration:none;color:var(--text)}
      .row:hover{border-color:var(--border2);background:#fafcff}
      .row-num{font-size:var(--fs-rownum);font-weight:var(--fw-bold);color:var(--muted);font-variant-numeric:tabular-nums;display:flex;align-items:center;gap:5px;flex-shrink:0;width:90px}
      .row-num::before{content:'';display:inline-block;width:7px;height:7px;border-radius:50%;flex-shrink:0;background:#cbd5e1}
      .row-inprogress .row-num::before{background:#fb923c} .row-done .row-num::before{background:#34d399}
      .row-name{font-size:var(--fs-row);font-weight:var(--fw-med);color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1}
      .row:hover .row-name{color:var(--ac)}
      .row-tags{display:flex;gap:6px;flex-wrap:nowrap;overflow:hidden;flex-shrink:0}
      .row-pill{font-size:var(--fs-tiny);font-weight:var(--fw-semi);padding:3px 9px;border-radius:999px;white-space:nowrap;flex-shrink:0}
      .row-ecos-dot{width:7px;height:7px;border-radius:50%;background:#dc2626;flex-shrink:0;display:none;cursor:help;margin-left:5px;vertical-align:middle;position:relative}
      .row-ecos-dot::after{content:attr(data-tooltip);display:none;position:absolute;bottom:calc(100% + 6px);left:50%;transform:translateX(-50%);background:rgba(15,23,42,.88);color:#fff;font-size:10px;font-weight:500;white-space:nowrap;padding:3px 8px;border-radius:4px;pointer-events:none;z-index:50}
      .row-ecos-dot:hover::after{display:block}
      .row-arr{color:var(--border2);font-size:17px;flex-shrink:0} .row:hover .row-arr{color:var(--ac)}
      .row-actions{display:flex;align-items:center;gap:5px;flex-shrink:0;justify-content:flex-end}
      .row-ck{width:26px;height:26px;border-radius:var(--r-sm);border:1.5px solid var(--border2);display:grid;place-items:center;color:transparent;background:#fff;cursor:pointer;user-select:none;font-size:15px;font-weight:var(--fw-bold);flex-shrink:0}
      .row-ck:hover{border-color:var(--ac)} .row-ck.on{background:var(--ac);border-color:var(--ac);color:#fff}
      .row-done .row-name{color:var(--muted);text-decoration:line-through} .row-done .row-num{opacity:.55}
      .no-results{text-align:center;padding:70px 20px;color:var(--muted);font-size:var(--fs-base)} .no-results span{font-size:32px;display:block;margin-bottom:12px}
      .row-review{font-size:10px;font-weight:var(--fw-bold);padding:2px 6px;border-radius:999px;background:#fef3c7;color:#d97706;cursor:pointer;flex-shrink:0;border:none;font-family:inherit;line-height:1.4}
      .row-review:hover{background:#fde68a}
      #btn-stats{padding:8px 12px;background:transparent;border:1px solid var(--border);border-radius:var(--r);color:var(--muted);font-size:var(--fs-small);font-family:inherit;font-weight:var(--fw-med);cursor:pointer;transition:color var(--transition),border-color var(--transition)}
      #btn-stats:hover{color:var(--ac);border-color:var(--ac)}
      #stats-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:900;display:flex;align-items:flex-end;justify-content:flex-end}
      #stats-panel{width:min(520px,96vw);height:100vh;background:var(--surface);border-left:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;box-shadow:-2px 0 8px rgba(0,0,0,.06)}
      #stats-panel-head{padding:18px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;font-size:var(--fs-small);font-weight:var(--fw-bold);color:var(--text);flex-shrink:0}
      #stats-panel-head button{margin-left:auto;background:none;border:none;cursor:pointer;font-size:18px;color:var(--muted);line-height:1;padding:4px}
      #stats-panel-body{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:20px}
      .stats-counters{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
      .stat-box{background:var(--surface2);border:1px solid var(--border);border-radius:var(--r-sm);padding:12px 14px;text-align:center}
      .stat-box-val{font-size:26px;font-weight:var(--fw-heavy);color:var(--text);line-height:1.1} .stat-box-lbl{font-size:var(--fs-tiny);color:var(--muted);margin-top:3px;font-weight:var(--fw-med)}
      .stats-streak{background:var(--ac-light);border:1px solid var(--border);border-radius:var(--r-sm);padding:14px 16px;display:flex;align-items:center;gap:14px}
      .streak-fire{font-size:28px;line-height:1} .streak-val{font-size:22px;font-weight:var(--fw-heavy);color:var(--ac)} .streak-lbl{font-size:var(--fs-tiny);color:var(--muted);font-weight:var(--fw-med)}
      .stats-section-title{font-size:var(--fs-tiny);font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:.7px;color:var(--muted);margin-bottom:8px}
      .spec-bar-row{display:flex;align-items:center;gap:8px;margin-bottom:7px} .spec-bar-name{font-size:11px;color:var(--text2);width:140px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .spec-bar-track{flex:1;height:8px;background:var(--border);border-radius:999px;overflow:hidden} .spec-bar-fill{height:100%;border-radius:999px;background:var(--ac);transition:width .4s ease} .spec-bar-count{font-size:11px;color:var(--muted);width:36px;text-align:right;flex-shrink:0}
      .heatmap-grid{display:flex;gap:2px;align-items:flex-end;overflow-x:auto;padding-bottom:4px} .heatmap-col{display:flex;flex-direction:column;gap:2px}
      .heatmap-cell{width:11px;height:11px;border-radius:2px;background:var(--border);flex-shrink:0}
      .heatmap-cell.l1{background:#c7d2fe}.heatmap-cell.l2{background:#818cf8}.heatmap-cell.l3{background:#6366f1}.heatmap-cell.l4{background:#4338ca}
      .heatmap-months{display:flex;gap:2px;font-size:10px;color:var(--muted);margin-bottom:3px;overflow-x:auto}
      ${LOGOUT_BTN_CSS}
      @media(max-width:640px){header,.ctrl,main{padding-left:14px;padding-right:14px}.row-tags{display:none}select{max-width:200px}}
      @keyframes spin{to{transform:rotate(360deg)}}
      #btn-ecos-random{padding:8px 12px;background:transparent;border:1px solid var(--border);border-radius:var(--r);color:var(--muted);font-size:var(--fs-small);font-family:inherit;font-weight:var(--fw-med);cursor:pointer;transition:color var(--transition),border-color var(--transition)}
      #btn-ecos-random:hover{color:#7c3aed;border-color:#7c3aed}
      #ecos-preview-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.7);z-index:2000;display:flex;align-items:center;justify-content:center;padding:20px}
      #ecos-preview-panel{width:min(1200px,96vw);height:92vh;background:#fff;border-radius:var(--r);overflow:hidden;display:flex;flex-direction:column}
      #ecos-preview-head{padding:10px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;font-size:var(--fs-small);font-weight:var(--fw-semi);color:var(--text);flex-shrink:0;background:#fff;flex-wrap:wrap}
      #ecos-preview-head .pv-title{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
      #ecos-preview-head a.pv-btn{font-size:var(--fs-tiny);color:var(--text2);font-weight:var(--fw-semi);text-decoration:none;padding:4px 8px;border:1px solid var(--border);border-radius:var(--r-sm);white-space:nowrap;transition:border-color var(--transition),color var(--transition);background:var(--surface2)} #ecos-preview-head a.pv-btn:hover{border-color:var(--ac);color:var(--ac)}
      #ecos-preview-head button.pv-close{background:none;border:none;cursor:pointer;font-size:18px;color:var(--muted);padding:2px 6px;border-radius:4px;flex-shrink:0} #ecos-preview-head button.pv-close:hover{color:var(--text);background:var(--surface2)}
      #ecos-preview-rating{display:flex;align-items:center;gap:2px;padding:3px 8px;border:1px solid var(--border);border-radius:var(--r-sm);background:var(--surface2);flex-shrink:0}
      #ecos-preview-rating .pr-star{font-size:15px;cursor:pointer;color:var(--border2);transition:color .1s,transform .1s;line-height:1;user-select:none} #ecos-preview-rating .pr-star:hover,#ecos-preview-rating .pr-star.filled{color:#f59e0b;transform:scale(1.15)}
      #ecos-preview-rating .pr-info{font-size:10px;color:var(--muted);margin-left:4px;white-space:nowrap}
      /* Split layout */
      #ecos-preview-split{flex:1;display:flex;overflow:hidden}
      #ecos-preview-iframe{flex:1;border:none;min-width:0}
      #ecos-scoring-panel{width:320px;flex-shrink:0;border-left:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto;background:var(--surface2)}
      /* Timer */
      .ecos-timer-wrap{padding:14px 16px;border-bottom:1px solid var(--border);background:#fff}
      .ecos-timer-phase{font-size:10px;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:6px;display:flex;align-items:center;gap:6px}
      .ecos-timer-phase .phase-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
      .ecos-timer-phase .phase-dot.active{background:var(--success);animation:pulse-dot 1.5s ease infinite}
      .ecos-timer-phase .phase-dot.idle{background:var(--border2)}
      @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.3}}
      .ecos-timer-display{font-size:36px;font-weight:var(--fw-heavy);font-variant-numeric:tabular-nums;letter-spacing:-1px;line-height:1;color:var(--text)}
      .ecos-timer-display.warning{color:var(--warning)}
      .ecos-timer-display.danger{color:var(--danger)}
      .ecos-timer-bar{height:3px;background:var(--border);border-radius:999px;margin-top:8px;overflow:hidden}
      .ecos-timer-bar-fill{height:100%;border-radius:999px;background:var(--ac);transition:width .3s linear}
      .ecos-timer-bar-fill.warning{background:var(--warning)}
      .ecos-timer-bar-fill.danger{background:var(--danger)}
      .ecos-timer-controls{display:flex;gap:6px;margin-top:10px}
      .ecos-timer-btn{flex:1;padding:6px 0;border:1px solid var(--border);border-radius:var(--r-sm);background:#fff;font-family:inherit;font-size:var(--fs-tiny);font-weight:var(--fw-semi);cursor:pointer;color:var(--text2);transition:all var(--transition)}
      .ecos-timer-btn:hover{border-color:var(--ac);color:var(--ac)}
      .ecos-timer-btn.primary{background:var(--ac);border-color:var(--ac);color:#fff}
      .ecos-timer-btn.primary:hover{background:var(--ac-dark)}
      /* Scoring */
      .ecos-scoring-section{padding:14px 16px;border-bottom:1px solid var(--border);background:#fff}
      .ecos-scoring-title{font-size:10px;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:10px}
      .ecos-grid-config{display:flex;align-items:center;gap:8px;margin-bottom:10px}
      .ecos-grid-config label{font-size:var(--fs-tiny);color:var(--text2);font-weight:var(--fw-semi)}
      .ecos-grid-config input{width:50px;padding:4px 6px;border:1px solid var(--border);border-radius:var(--r-sm);font-size:var(--fs-tiny);font-family:inherit;text-align:center;color:var(--text);outline:none}
      .ecos-grid-config input:focus{border-color:var(--ac)}
      .ecos-grid-points{display:flex;flex-wrap:wrap;gap:5px}
      .ecos-point-btn{width:32px;height:32px;border-radius:var(--r-sm);border:1.5px solid var(--border);background:#fff;color:var(--muted);font-size:var(--fs-tiny);font-weight:var(--fw-bold);font-family:inherit;cursor:pointer;display:grid;place-items:center;transition:all .12s ease}
      .ecos-point-btn:hover{border-color:var(--ac);color:var(--ac)}
      .ecos-point-btn.earned{background:var(--ac);border-color:var(--ac);color:#fff}
      .ecos-grid-score{margin-top:10px;display:flex;align-items:baseline;gap:4px}
      .ecos-grid-score-val{font-size:22px;font-weight:var(--fw-heavy);color:var(--text)}
      .ecos-grid-score-total{font-size:var(--fs-small);color:var(--muted);font-weight:var(--fw-med)}
      /* Final score */
      .ecos-final-score{padding:16px;background:#fff;border-top:1px solid var(--border);margin-top:auto}
      .ecos-final-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:var(--fs-tiny);color:var(--text2)}
      .ecos-final-row-val{font-weight:var(--fw-bold);color:var(--text)}
      .ecos-final-divider{height:1px;background:var(--border);margin:10px 0}
      .ecos-final-total{display:flex;justify-content:space-between;align-items:center;font-size:var(--fs-base);font-weight:var(--fw-heavy);color:var(--text)}
      .ecos-final-total-val{font-size:22px;color:var(--ac)}
      .ecos-final-save{width:100%;margin-top:12px;padding:8px;border:none;border-radius:var(--r-sm);background:var(--ac);color:#fff;font-family:inherit;font-size:var(--fs-tiny);font-weight:var(--fw-bold);cursor:pointer;transition:background var(--transition)}
      .ecos-final-save:hover{background:var(--ac-dark)}
      .ecos-final-save:disabled{opacity:.4;pointer-events:none}
      .ecos-final-save.saved{background:var(--success)}
      /* SDD link */
      .ecos-sdd-link{display:flex;align-items:center;gap:6px;padding:10px 16px;border-bottom:1px solid var(--border);background:#fff;font-size:var(--fs-tiny);text-decoration:none;color:var(--ac);font-weight:var(--fw-semi);transition:background var(--transition)}
      .ecos-sdd-link:hover{background:var(--ac-light)}
      .ecos-notes-section{padding:14px 16px;border-bottom:1px solid var(--border);background:#fff}
      .ecos-notes-section textarea{width:100%;min-height:120px;max-height:300px;resize:vertical;border:1.5px solid var(--border);border-radius:var(--r-sm);padding:8px 10px;font-family:inherit;font-size:var(--fs-tiny);color:var(--text);background:#fff;outline:none;line-height:1.5;transition:border-color var(--transition)}
      .ecos-notes-section textarea:focus{border-color:var(--ac)}
      .ecos-notes-section textarea::placeholder{color:var(--muted)}
      @media(max-width:800px){#ecos-scoring-panel{width:260px}}
      @media(max-width:640px){#ecos-preview-split{flex-direction:column}#ecos-scoring-panel{width:100%;max-height:50vh;border-left:none;border-top:1px solid var(--border)}}
      </style>`;

    document.body.innerHTML = '';

    const hdr = document.createElement('header');
    hdr.innerHTML = `<div class="h-badge">LISA 2025</div><h1>Situations de Départ <span id="hdr-total">${items.length} SDD</span></h1><button id="btn-stats" title="Statistiques &amp; progression">📊 Stats</button>${cloudEnabled() ? '<button id="btn-ecos-random" title="Station ECOS aléatoire parmi les SDD visibles">🎲 ECOS</button>' : ''}<a class="h-back" href="/lisa/2025/Accueil">← Accueil</a>${cloudEnabled() ? '<button class="btn-logout" id="btn-logout" title="Se déconnecter du cloud sync">⊗</button>' : ''}`;
    document.body.appendChild(hdr);

    const ctrl = document.createElement('div');
    ctrl.className = 'ctrl';
    ctrl.innerHTML = `
      <div class="search-wrap"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input id="search" type="text" placeholder="Rechercher…" autocomplete="off" spellcheck="false"></div>
      ${hasFamilies ? `<select id="ff" title="Filtrer par spécialité"><option value="">Toutes les spécialités</option>${families.map(f => `<option value="${escapeHtml(f)}">${escapeHtml(f)}</option>`).join('')}</select>` : ''}
      <select id="st" title="Filtrer par statut">
        <option value="all">Toutes</option>
        <option value="todo">À faire</option>
        <option value="inprogress">En cours</option>
        <option value="done">Faites ✓</option>
        <option value="review">🔔 À réviser</option>
        <option value="ecos">🔴 Avec ECOS</option>
      </select>
      <div class="sort-btns">
        <button class="on" data-s="num">N° ↑</button>
        <button data-s="alpha">A – Z</button>
        ${hasFamilies ? `<button data-s="family">Spécialité</button>` : ''}
        <button data-s="chrono">Récent</button>
      </div>
      <span id="stats"></span>
      <button id="btn-rf" title="Vider le cache et recharger la liste">↺</button>`;
    document.body.appendChild(ctrl);

    const main = document.createElement('main');
    const list = document.createElement('div');
    list.id = 'list';
    main.appendChild(list);
    document.body.appendChild(main);

    let sort = 'num', query = '', status = 'all', family = '';
    let _lastFiltered = [];

    const _st = new Map(), _dd = new Map(), _rv = new Map();
    for (const item of items) {
      const s = getStatus(item.num);
      _st.set(item.num, s);
      _dd.set(item.num, s !== 'todo' ? (getDoneDate(item.num) || '') : '');
      _rv.set(item.num, s === 'done' ? isDueForReview(item.num) : false);
    }
    const snapStatus    = (n) => _st.get(n) || 'todo';
    const snapDoneDate  = (n) => _dd.get(n) || '';
    const snapDueReview = (n) => !!_rv.get(n);
    function commitStatus(n, next) { setStatus(n, next); _st.set(n, next); _dd.set(n, next === 'done' ? (getDoneDate(n) || '') : ''); _rv.set(n, next === 'done' ? isDueForReview(n) : false); }
    function commitReview(n) { markReviewed(n); _rv.set(n, false); }

    const _pillsCache = new Map();
    function pillsHTML(item) {
      if (_pillsCache.has(item.num)) return _pillsCache.get(item.num);
      const tags = item.tags || []; let html = '';
      for (let i = 0; i < Math.min(tags.length, 2); i++) {
        const tc = getFamilyColor(tags[i]);
        html += `<span class="row-pill" style="background:${tc.pill};color:${tc.text}">${escapeHtml(tags[i])}</span>`;
      }
      _pillsCache.set(item.num, html); return html;
    }

    const _numStr = new Map(), _nameLower = new Map(), _tagsLower = new Map(), _rowStableHTML = new Map();
    for (const item of items) {
      _numStr.set(item.num, `SDD-${pad3(item.num)}`);
      _nameLower.set(item.num, item.name.toLowerCase());
      _tagsLower.set(item.num, (item.tags || []).map(t => t.toLowerCase()));
      _rowStableHTML.set(item.num,
        `<span class="row-num">${_numStr.get(item.num)}<span class="row-ecos-dot" data-sdd-num="${item.num}" data-tooltip="ECOS"></span></span>` +
        `<span class="row-name">${escapeHtml(item.name)}</span>` +
        `<span class="row-tags">${pillsHTML(item)}</span>`
      );
    }

    let _searchTimer = null;
    function scheduleRender() { clearTimeout(_searchTimer); _searchTimer = setTimeout(render, 200); }

    function render() {
      const q = query.toLowerCase();
      // Si filtre ECOS sélectionné mais données pas encore chargées
      if (status === 'ecos' && ecosPresence.size === 0 && cloudEnabled()) {
        list.innerHTML = '<div class="no-results"><span style="font-size:24px;animation:spin .7s linear infinite;display:inline-block">↻</span><br>Chargement des données ECOS…</div>';
        statsEl.textContent = '…';
        return;
      }
      const filtered = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i]; const st = snapStatus(item.num); item.status = st;
        if      (status === 'review') { if (!snapDueReview(item.num)) continue; }
        else if (status === 'ecos')   { if (!ecosPresence.has(item.num)) continue; }
        else if (status !== 'all' && st !== status) continue;
        if (family && !(item.tags || []).includes(family)) continue;
        if (q && !_nameLower.get(item.num).includes(q) && !String(item.num).includes(q) && !_tagsLower.get(item.num).some(t => t.includes(q))) continue;
        filtered.push(item);
      }

      if (sort === 'num')    filtered.sort((a, b) => a.num - b.num);
      if (sort === 'alpha')  filtered.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
      if (sort === 'family') filtered.sort((a, b) => (a.family || 'zzz').localeCompare(b.family || 'zzz', 'fr') || a.num - b.num);
      if (sort === 'chrono') {
        const rank = s => s === 'inprogress' ? 0 : s === 'done' ? 1 : 2;
        filtered.sort((a, b) => {
          const ra = rank(a.status), rb = rank(b.status); if (ra !== rb) return ra - rb; if (ra === 2) return a.num - b.num;
          const da = snapDoneDate(a.num), db = snapDoneDate(b.num);
          if (da && db) return db < da ? -1 : db > da ? 1 : 0; if (da) return -1; if (db) return 1; return a.num - b.num;
        });
      }
      _lastFiltered = filtered.slice();
      statsEl.textContent = `${filtered.length} / ${items.length}`;
      try { localStorage.setItem('uness_sdd_nav_order', JSON.stringify(filtered.map(i => i.num))); localStorage.setItem('uness_sdd_nav_items', JSON.stringify(items.map(i => ({ num: i.num, name: i.name, href: i.href })))); } catch (_) {}

      if (!filtered.length) { list.innerHTML = '<div class="no-results"><span>🔍</span>Aucune situation trouvée.</div>'; return; }

      let html = ''; const itemsRef = [];
      for (let i = 0; i < filtered.length; i++) {
        const item = filtered[i], st = item.status, dd = snapDoneDate(item.num);
        const tip = dd ? `Fait le ${formatDoneDate(dd, true)}` : (st === 'done' ? 'Marquer comme à faire' : 'Marquer comme faite');
        const cls = st === 'done' ? 'row row-done' : st === 'inprogress' ? 'row row-inprogress' : 'row';
        itemsRef.push(item);
        html += `<a class="${cls}" href="${escapeHtml(item.href)}" data-i="${i}">` +
          _rowStableHTML.get(item.num) +
          `<span class="row-actions">${snapDueReview(item.num) ? `<button class="row-review" data-rv="${item.num}" title="Marquer comme révisée">🔔</button>` : ''}<span class="row-ck${st === 'done' ? ' on' : ''}" title="${escapeHtml(tip)}">${st === 'done' ? '✓' : ''}</span></span>` +
          `<span class="row-arr">›</span></a>`;
      }
      list.innerHTML = html;

      // Afficher les dots ECOS déjà chargés
      list.querySelectorAll('.row-ecos-dot').forEach(dot => {
        if (ecosPresence.has(parseInt(dot.dataset.sddNum, 10))) dot.style.display = 'inline-block';
      });

      list.onclick = function(ev) {
        if (ev.target.classList.contains('row-review') || ev.target.dataset.rv) {
          ev.preventDefault(); ev.stopPropagation();
          const btn = ev.target.closest('[data-rv]') || ev.target; const n = parseInt(btn.dataset.rv, 10); if (!n) return;
          haptic('medium');
          commitReview(n); if (status === 'review') { render(); return; } btn.remove(); return;
        }
        if (!ev.target.classList.contains('row-ck')) return;
        ev.preventDefault(); ev.stopPropagation();
        const a = ev.target.closest('a'); if (!a) return;
        const i = parseInt(a.dataset.i, 10), item = itemsRef[i];
        const cur = snapStatus(item.num), next = cur === 'done' ? 'todo' : 'done';
        haptic(next === 'done' ? 'success' : 'light');
        commitStatus(item.num, next); item.status = next;
        if (status !== 'all') { render(); return; }
        const ck = ev.target, newDd = snapDoneDate(item.num);
        const newTip = newDd ? `Fait le ${formatDoneDate(newDd, true)}` : (next === 'done' ? 'Marquer comme à faire' : 'Marquer comme faite');
        ck.className = next === 'done' ? 'row-ck on' : 'row-ck'; ck.textContent = next === 'done' ? '✓' : ''; ck.title = newTip;
        a.className = next === 'done' ? 'row row-done' : 'row';
      };
    }

    const statsEl = document.getElementById('stats');
    document.getElementById('search').addEventListener('input', e => { query = e.target.value; scheduleRender(); });
    document.getElementById('st').addEventListener('change', e => { status = e.target.value; render(); });
    if (hasFamilies) document.getElementById('ff').addEventListener('change', e => { family = e.target.value; render(); });
    ctrl.querySelectorAll('.sort-btns button').forEach(btn => {
      btn.addEventListener('click', () => { ctrl.querySelectorAll('.sort-btns button').forEach(b => b.classList.remove('on')); btn.classList.add('on'); sort = btn.dataset.s; render(); });
    });
    document.getElementById('btn-rf').addEventListener('click', () => { GM_setValue(CACHE_TS, 0); location.reload(); });
    document.getElementById('btn-logout')?.addEventListener('click', () => { if (confirm('Se déconnecter du cloud sync ?')) window.cloudDisconnect(); });
    document.addEventListener('keydown', e => { if (e.key === '/' && document.activeElement?.id !== 'search') { e.preventDefault(); document.getElementById('search').focus(); } });

    function buildStatsModal() {
      const total = items.length, doneItems = items.filter(i => snapStatus(i.num) === 'done'), inpItems = items.filter(i => snapStatus(i.num) === 'inprogress');
      const doneCount = doneItems.length, inpCount = inpItems.length, reviewDue = items.filter(i => snapDueReview(i.num)).length;
      const dayMap = new Set(); for (const item of doneItems) { const d = snapDoneDate(item.num); if (d) dayMap.add(new Date(d).toDateString()); }
      let streak = 0; const today = new Date();
      for (let d = 0; d < 365; d++) { const day = new Date(today); day.setDate(today.getDate() - d); if (dayMap.has(day.toDateString())) streak++; else if (d > 0) break; }
      const specMap = {};
      for (const item of items) { for (const tag of (item.tags || [])) { if (!specMap[tag]) specMap[tag] = { total: 0, done: 0 }; specMap[tag].total++; if (snapStatus(item.num) === 'done') specMap[tag].done++; } }
      const specs = Object.entries(specMap).sort((a, b) => b[1].done / b[1].total - a[1].done / a[1].total || b[1].total - a[1].total);
      const heatDayMap = {};
      for (const item of doneItems) { const d = snapDoneDate(item.num); if (!d) continue; const key = new Date(d).toDateString(); heatDayMap[key] = (heatDayMap[key] || 0) + 1; }
      const maxPerDay = Math.max(...Object.values(heatDayMap), 1);
      function heatLevel(n) { if (!n) return ''; const r = n / maxPerDay; return r < .25 ? 'l1' : r < .5 ? 'l2' : r < .75 ? 'l3' : 'l4'; }
      const weekStart = new Date(today); weekStart.setDate(today.getDate() - 7 * 51 - today.getDay());
      const months = []; let prevMonth = -1;
      for (let w = 0; w < 52; w++) { const d = new Date(weekStart); d.setDate(weekStart.getDate() + w * 7); const m = d.getMonth(); if (m !== prevMonth) { months.push({ w, label: d.toLocaleDateString('fr-FR', { month: 'short' }) }); prevMonth = m; } }
      let heatHTML = '<div class="heatmap-months">';
      for (let w = 0; w < 52; w++) { const mo = months.find(m => m.w === w); heatHTML += `<span style="width:13px;flex-shrink:0">${mo ? mo.label.slice(0, 3) : ''}</span>`; }
      heatHTML += '</div><div class="heatmap-grid">';
      for (let w = 0; w < 52; w++) {
        heatHTML += '<div class="heatmap-col">';
        for (let d2 = 0; d2 < 7; d2++) {
          const day = new Date(weekStart); day.setDate(weekStart.getDate() + w * 7 + d2);
          if (day > today) { heatHTML += '<div class="heatmap-cell"></div>'; continue; }
          const n2 = heatDayMap[day.toDateString()] || 0;
          heatHTML += `<div class="heatmap-cell${heatLevel(n2) ? ' ' + heatLevel(n2) : ''}" title="${day.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}${n2 ? ` · ${n2} SDD` : ''}"></div>`;
        }
        heatHTML += '</div>';
      }
      heatHTML += '</div>';
      let barsHTML = '';
      for (const [name, { total: tot, done: dn }] of specs) {
        const pct = Math.round(dn / tot * 100);
        barsHTML += `<div class="spec-bar-row"><div class="spec-bar-name" title="${escapeHtml(name)}">${escapeHtml(name)}</div><div class="spec-bar-track"><div class="spec-bar-fill" style="width:${pct}%"></div></div><div class="spec-bar-count">${dn}/${tot}</div></div>`;
      }
      const backdrop = document.createElement('div');
      backdrop.id = 'stats-backdrop';
      backdrop.innerHTML = `<div id="stats-panel"><div id="stats-panel-head">📊 Statistiques &amp; Progression<button id="stats-close" title="Fermer">✕</button></div><div id="stats-panel-body"><div class="stats-counters"><div class="stat-box"><div class="stat-box-val" style="color:var(--success)">${doneCount}</div><div class="stat-box-lbl">Faites</div></div><div class="stat-box"><div class="stat-box-val" style="color:#fb923c">${inpCount}</div><div class="stat-box-lbl">En cours</div></div><div class="stat-box"><div class="stat-box-val" style="color:var(--muted)">${total - doneCount - inpCount}</div><div class="stat-box-lbl">À faire</div></div><div class="stat-box"><div class="stat-box-val">${Math.round(doneCount / total * 100)}%</div><div class="stat-box-lbl">Progression</div></div><div class="stat-box"><div class="stat-box-val" style="color:#d97706">${reviewDue}</div><div class="stat-box-lbl">À réviser</div></div><div class="stat-box"><div class="stat-box-val" style="color:var(--ac)">${total}</div><div class="stat-box-lbl">Total SDD</div></div></div><div class="stats-streak"><div class="streak-fire">🔥</div><div><div class="streak-val">${streak} jour${streak !== 1 ? 's' : ''}</div><div class="streak-lbl">Streak actuel</div></div></div><div><div class="stats-section-title">Heatmap — 12 derniers mois</div>${heatHTML}</div><div><div class="stats-section-title">Progression par spécialité</div>${barsHTML}</div><div id="ecos-scores-section"><div class="stats-section-title">Notes ECOS par matière</div><div id="ecos-scores-content" style="color:var(--muted);font-size:12px;display:flex;align-items:center;gap:8px"><div style="width:14px;height:14px;border:2px solid var(--border);border-top-color:var(--ac);border-radius:50%;animation:spin .7s linear infinite"></div>Chargement…</div></div></div></div>`;
      document.body.appendChild(backdrop);
      backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });
      backdrop.querySelector('#stats-close').addEventListener('click', () => backdrop.remove());
      document.addEventListener('keydown', function onEsc(e) { if (e.key === 'Escape') { backdrop.remove(); document.removeEventListener('keydown', onEsc); } });

      // Load ECOS scores
      if (cloudEnabled()) {
        loadAllEcosScores().then(scores => {
          const container = backdrop.querySelector('#ecos-scores-content');
          if (!container) return;
          if (!scores.length) { container.innerHTML = '<p style="color:var(--muted);font-size:12px;font-style:italic">Aucune note ECOS enregistrée.</p>'; return; }
          // Group by matière
          const byMat = {};
          for (const s of scores) {
            const mat = s.matiere || 'Non classée';
            if (!byMat[mat]) byMat[mat] = [];
            byMat[mat].push(s);
          }
          let html = '';
          const sortedMats = Object.entries(byMat).sort((a, b) => a[0].localeCompare(b[0], 'fr'));
          for (const [mat, matScores] of sortedMats) {
            const avg = matScores.reduce((sum, s) => sum + (s.finalScore || 0), 0) / matScores.length;
            const tc = getFamilyColor(mat);
            html += `<div style="margin-bottom:12px">`;
            html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="display:inline-block;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:600;background:${tc.pill};color:${tc.text}">${escapeHtml(mat)}</span><span style="font-size:11px;color:var(--muted)">${matScores.length} station${matScores.length > 1 ? 's' : ''} · Moy. <strong style="color:var(--text)">${avg.toFixed(1)}/20</strong></span></div>`;
            html += `<div style="display:flex;flex-direction:column;gap:3px">`;
            matScores.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
            for (const s of matScores) {
              const dateStr = s.date ? new Date(s.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
              const barPct = Math.round(((s.finalScore || 0) / 20) * 100);
              const barColor = barPct >= 75 ? 'var(--success)' : barPct >= 50 ? 'var(--warning)' : 'var(--danger)';
              html += `<div style="display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text2)">`;
              html += `<span style="width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex-shrink:0" title="${escapeHtml(s.fileName || s.sddName || '')}">${escapeHtml(s.sddName || s.fileName || '—')}</span>`;
              html += `<div style="flex:1;height:6px;background:var(--border);border-radius:999px;overflow:hidden"><div style="height:100%;width:${barPct}%;border-radius:999px;background:${barColor};transition:width .3s"></div></div>`;
              html += `<span style="width:44px;text-align:right;font-weight:600;flex-shrink:0">${(s.finalScore || 0).toFixed(1)}</span>`;
              html += `<span style="width:50px;text-align:right;color:var(--muted);flex-shrink:0">${dateStr}</span>`;
              html += `</div>`;
            }
            html += `</div></div>`;
          }
          container.innerHTML = html;
        }).catch(() => {
          const container = backdrop.querySelector('#ecos-scores-content');
          if (container) container.innerHTML = '<p style="color:var(--danger);font-size:12px">⚠ Erreur de chargement</p>';
        });
      } else {
        const container = backdrop.querySelector('#ecos-scores-content');
        if (container) container.innerHTML = '<p style="color:var(--muted);font-size:12px;font-style:italic">Connectez le cloud pour voir les notes ECOS.</p>';
      }
    }

    document.getElementById('btn-stats').addEventListener('click', buildStatsModal);

    document.getElementById('btn-ecos-random')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-ecos-random');
      if (!cloudEnabled()) return;
      // Attendre que ecosPresence soit chargée si nécessaire
      const pool = _lastFiltered.length
        ? _lastFiltered.filter(item => ecosPresence.has(item.num))
        : items.filter(item => ecosPresence.has(item.num));
      if (!pool.length) { alert('Aucune SDD avec ECOS dans la vue actuelle.'); return; }
      const sdd = pool[Math.floor(Math.random() * pool.length)];
      const origText = btn.textContent;
      btn.textContent = '⏳'; btn.disabled = true;
      try {
        const files = await loadEcosFiles(sdd.num);
        if (!files.length) { alert('Aucun fichier ECOS pour ' + sdd.name + '.'); return; }
        const file = files[Math.floor(Math.random() * files.length)];
        openEcosPreviewWithTimer(file, sdd.num, sdd.name);
      } catch (e) { alert('Erreur : ' + e.message); }
      finally { btn.textContent = origText; btn.disabled = false; }
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
      html{overflow-x:clip!important}
      html,body{background:var(--bg)!important;color:var(--text)!important;font-family:var(--ff)!important;font-size:var(--fs-base)!important;font-weight:var(--fw-base)!important}
      #mw-navigation,.p-navbar.not-collapsible,#footer-icons,#footer-places,#footer-info,#catlinks,.printfooter,#jump-to-nav,#siteSub,.contentHeader,#p-tb,.mw-editsection,#mw-head,#mw-panel{display:none!important}
      .flex-fill.container{max-width:100%!important;padding:0!important} .flex-fill.container>.row{flex-direction:column!important} .flex-fill.container>.row>.col{padding:0!important}
      #content{border:none!important;background:transparent!important;padding:0!important;margin:0!important;box-shadow:none!important} .bodyContent{padding:0!important}
      #sdd-bc{background:var(--surface);border-bottom:1px solid var(--border);padding:10px 40px;display:flex;align-items:center;gap:8px;font-size:var(--fs-small);color:var(--muted)}
      #sdd-bc a{color:var(--muted);text-decoration:none;font-weight:var(--fw-med);transition:color var(--transition)} #sdd-bc a:hover{color:var(--ac)}
      #sdd-bc .sep{color:var(--border2);user-select:none} #sdd-bc .bc-spacer{margin-left:auto}
      .sdd-nav-btn{display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border:1px solid var(--border);border-radius:var(--r-sm);background:var(--surface2);color:var(--text2);text-decoration:none;font-size:var(--fs-tiny);font-weight:var(--fw-semi);transition:border-color var(--transition),color var(--transition);white-space:nowrap}
      .sdd-nav-btn:hover{border-color:var(--ac);color:var(--ac)} .sdd-nav-btn.disabled{opacity:.35;pointer-events:none}
      #sdd-nav-pos{font-size:var(--fs-tiny);color:var(--muted);padding:0 6px;font-variant-numeric:tabular-nums}
      #sdd-top{background:var(--surface);border-bottom:1px solid var(--border);padding:22px 40px 24px;display:flex;align-items:flex-start;gap:18px}
      #sdd-top-pill{font-size:var(--fs-tiny);font-weight:var(--fw-bold);letter-spacing:.9px;text-transform:uppercase;padding:6px 12px;border-radius:var(--r-sm);background:var(--ac-light);color:var(--ac);flex-shrink:0;margin-top:5px}
      #sdd-top-info{flex:1;min-width:0} #sdd-top-title{font-size:var(--fs-title);font-weight:var(--fw-heavy);letter-spacing:-.5px;line-height:1.25;color:var(--text)}
      #sdd-top-family{font-size:var(--fs-small);color:var(--muted);margin-top:8px} #sdd-top-family a{color:var(--ac);text-decoration:none;font-weight:var(--fw-semi)}
      #sdd-top-back{padding:10px 16px;background:var(--surface2);border:1px solid var(--border);border-radius:var(--r);color:var(--muted);font-size:var(--fs-small);text-decoration:none;font-family:inherit;font-weight:var(--fw-med);transition:all var(--transition);white-space:nowrap;align-self:flex-start}
      #sdd-top-back:hover{color:var(--text);border-color:var(--border2);background:#fff}
      #sdd-body{padding:24px clamp(${CFG.railsMin}px,3vw,${CFG.railsMax}px) 70px;display:grid;grid-template-columns:var(--notes-col) minmax(0,1fr);gap:16px;align-items:start}
      #sdd-follow{position:sticky;top:${CFG.stickyTop}px;max-height:calc(100vh - ${CFG.stickyTop * 2}px);overflow-y:auto}
      #notes-resize-handle{position:absolute;top:0;right:-5px;width:10px;height:100%;cursor:col-resize;z-index:10;display:flex;align-items:center;justify-content:center}
      #notes-resize-handle::after{content:'';display:block;width:3px;height:40px;border-radius:3px;background:var(--border2);transition:background var(--transition)}
      #notes-resize-handle:hover::after,#notes-resize-handle.dragging::after{background:var(--ac)}
      .sc{background:var(--surface);border:1px solid var(--border);border-radius:var(--r)}
      .sc-head{padding:12px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;font-size:var(--fs-tiny);font-weight:var(--fw-bold);letter-spacing:.8px;text-transform:uppercase;color:var(--muted);background:var(--surface);cursor:pointer;user-select:none;transition:background var(--transition)}
      .sc-head:hover{background:var(--surface2)} .sc-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
      .sc-body{padding:18px;min-width:0} .sc-toggle{margin-left:auto;font-size:15px;color:var(--muted);transition:transform var(--transition)}
      .sc-head-date{font-size:10px;font-weight:var(--fw-med);color:var(--success);letter-spacing:.3px;background:var(--success-light);padding:2px 7px;border-radius:999px;margin-left:4px;text-transform:none}
      .sc.collapsed .sc-toggle{transform:rotate(-90deg)} .sc.collapsed .sc-body{display:none}
      .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
      .chip{display:inline-block;padding:7px 13px;border-radius:999px;font-size:var(--fs-chip);font-weight:var(--fw-med);text-decoration:none;transition:opacity var(--transition)} .chip:hover{opacity:.8}
      .chip-section{font-size:var(--fs-tiny);font-weight:var(--fw-bold);letter-spacing:.6px;text-transform:uppercase;padding:4px 10px;display:inline-block;border-radius:var(--r-sm);margin-bottom:6px}
      .at{width:100%;border-collapse:collapse}
      .at thead th{padding:10px 12px;text-align:left;font-size:var(--fs-tiny);font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:.6px;color:var(--muted);background:var(--surface2);border-bottom:1px solid var(--border)}
      .at tbody tr{border-bottom:1px solid var(--border);transition:background var(--transition)} .at tbody tr:last-child{border-bottom:none} .at tbody tr:hover{background:var(--surface2)}
      .at tbody td{padding:11px 12px;font-size:var(--fs-table);vertical-align:top;min-width:0}
      .at td a{color:var(--text2);text-decoration:none;font-weight:var(--fw-med);line-height:1.45} .at td a:hover{color:var(--ac)}
      .tag{display:inline-block;padding:3px 8px;margin:2px;border-radius:6px;font-size:var(--fs-tiny);font-weight:var(--fw-semi)} .tag-d{background:#eff6ff;color:#1d4ed8} .tag-c{background:#f0fdf4;color:#15803d}
      .att-ai-btn{display:inline;margin-left:6px;padding:0 4px;border:none;border-radius:4px;background:none;color:var(--border2);font-size:11px;line-height:1;cursor:pointer;font-family:inherit;transition:color var(--transition),opacity var(--transition);vertical-align:middle;opacity:0}
      .at tbody tr:hover .att-ai-btn{opacity:1} .att-panel-row:hover{background:transparent!important} .att-ai-btn:hover{color:#4f46e5} .att-ai-btn.active{opacity:1;color:#4f46e5} .att-ai-btn.loading{opacity:.4;pointer-events:none}
      .att-ai-panel{display:block;margin-top:0;padding:12px 14px;border-radius:var(--r-sm);border:1px solid #e0e7ff;background:#f8f9ff;font-size:var(--fs-small);line-height:1.7;color:var(--text2)}
      .att-ai-panel.visible{display:block} .att-ai-panel h2,.att-ai-panel h3{font-size:var(--fs-small);font-weight:var(--fw-bold);color:var(--ac);margin:12px 0 4px}
      .att-ai-panel ul{margin:4px 0 8px 16px;padding:0;list-style:disc} .att-ai-panel li{margin-bottom:3px} .att-ai-panel p{margin:4px 0} .att-ai-panel strong{font-weight:var(--fw-semi);color:var(--text)}
      #wy-save-status{
        font-size:10px;
        color:var(--muted);
        padding:4px 4px 0;
        text-align:right;
        min-height:16px;
      }
      .status-picker{display:flex;gap:0;margin-bottom:14px;border:1px solid var(--border);border-radius:var(--r-sm);overflow:hidden}
      .status-btn{flex:1;padding:9px 6px;border:none;border-right:1px solid var(--border);background:#fff;font-family:inherit;font-size:var(--fs-tiny);font-weight:var(--fw-semi);cursor:pointer;color:var(--muted);transition:background var(--transition),color var(--transition);display:flex;align-items:center;justify-content:center;gap:5px;white-space:nowrap}
      .status-btn:last-child{border-right:none} .status-btn:hover{background:var(--surface2);color:var(--text)}
      .status-btn.active-todo{background:var(--surface2);color:var(--text2)} .status-btn.active-inprogress{background:var(--inprogress-light);color:var(--inprogress);font-weight:var(--fw-bold)} .status-btn.active-done{background:var(--success-light);color:var(--success);font-weight:var(--fw-bold)}
      ${LOGOUT_BTN_CSS}
      /* ── Card ECOS ── */
      .ecos-list{display:flex;flex-direction:column;gap:0}
      .ecos-item{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border);position:relative}
      .ecos-item:last-child{border-bottom:none}
      .ecos-info{flex:1;min-width:0;cursor:pointer}
      .ecos-name{font-size:12px;font-weight:var(--fw-semi);color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color var(--transition)}
      .ecos-info:hover .ecos-name{color:var(--ac)}
      .ecos-meta{font-size:10px;color:var(--muted);margin-top:1px}
      .ecos-actions{display:flex;gap:5px;flex-shrink:0;align-items:center}
      .ecos-btn{padding:4px 9px;border-radius:var(--r-sm);border:1px solid var(--border);background:#fff;color:var(--text2);font-size:11px;font-weight:var(--fw-semi);font-family:inherit;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;gap:3px;transition:border-color var(--transition),color var(--transition)}
      .ecos-btn:hover{border-color:var(--ac);color:var(--ac)} .ecos-btn.primary{background:var(--ac);border-color:var(--ac);color:#fff} .ecos-btn.primary:hover{background:var(--ac-dark);border-color:var(--ac-dark)} .ecos-btn.danger{background:var(--danger-light);border-color:#fca5a5;color:var(--danger)} .ecos-btn.danger:hover{background:#fee2e2;border-color:var(--danger)}
      /* Checkbox station faite */
      .ecos-done-ck{width:20px;height:20px;border-radius:4px;border:1.5px solid var(--border2);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;font-size:11px;background:#fff;color:transparent;transition:background var(--transition),border-color var(--transition),color var(--transition)}
      .ecos-done-ck:hover{border-color:var(--success)} .ecos-done-ck.on{background:var(--success);border-color:var(--success);color:#fff}
      .ecos-item.station-done .ecos-name{text-decoration:line-through;color:var(--muted)}
      /* Notation /5 au hover */
      .ecos-rating{display:none;align-items:center;gap:2px;position:absolute;left:0;bottom:-26px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-sm);padding:4px 9px;box-shadow:0 2px 10px rgba(0,0,0,.1);z-index:30;white-space:nowrap}
      .ecos-item:hover .ecos-rating{display:flex}
      .ecos-rating-star{font-size:15px;cursor:pointer;color:var(--border2);transition:color .1s,transform .1s;line-height:1;user-select:none}
      .ecos-rating-star:hover,.ecos-rating-star.filled{color:#f59e0b;transform:scale(1.2)}
      .ecos-rating-info{font-size:10px;color:var(--muted);margin-left:5px;font-weight:var(--fw-semi)}
      /* Upload ECOS */
      #ecos-upload-input{display:none}
      #ecos-upload-toggle{display:inline-flex;align-items:center;gap:5px;margin-top:10px;padding:4px 10px;border:1px dashed var(--border2);border-radius:var(--r-sm);background:transparent;color:var(--muted);font-size:var(--fs-tiny);font-family:inherit;font-weight:var(--fw-med);cursor:pointer;transition:all var(--transition)}
      #ecos-upload-toggle:hover{color:var(--ac);border-color:var(--ac);background:var(--ac-light)}
      #ecos-upload-panel{margin-top:8px;padding:10px 12px;border:1px solid var(--border);border-radius:var(--r-sm);background:var(--surface2)}
      .ecos-drop-zone{border:1px dashed var(--border2);border-radius:var(--r-sm);padding:10px;text-align:center;cursor:pointer;font-size:var(--fs-tiny);color:var(--muted);transition:border-color var(--transition),background var(--transition)}
      .ecos-drop-zone:hover,.ecos-drop-zone.drag-over{border-color:var(--ac);color:var(--ac);background:var(--ac-light)}
      .ecos-upload-progress{margin-top:8px;display:flex;flex-direction:column;gap:5px}
      .ecos-upload-item{display:flex;align-items:center;gap:6px;font-size:var(--fs-tiny);color:var(--text2)} .ecos-upload-item-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .ecos-upload-bar-wrap{width:60px;height:3px;background:var(--border);border-radius:999px;overflow:hidden;flex-shrink:0} .ecos-upload-bar{height:100%;border-radius:999px;background:var(--ac);transition:width .2s ease;width:0%}
      .ecos-upload-status{font-size:10px;flex-shrink:0;min-width:24px;text-align:right} .ecos-upload-status.done{color:var(--success)} .ecos-upload-status.error{color:var(--danger)}
      .ecos-upload-fields{display:flex;gap:6px;margin-top:8px}
      .ecos-upload-fields input{flex:1;padding:5px 8px;border:1px solid var(--border);border-radius:var(--r-sm);font-size:var(--fs-tiny);font-family:inherit;color:var(--text);background:#fff;outline:none;transition:border-color var(--transition)}
      .ecos-upload-fields input:focus{border-color:var(--ac)} .ecos-upload-fields input::placeholder{color:var(--muted)}
      .ecos-upload-actions{display:flex;gap:6px;margin-top:8px}
      .ecos-upload-btn{flex:1;padding:6px 10px;border-radius:var(--r-sm);border:none;font-family:inherit;font-size:var(--fs-tiny);font-weight:var(--fw-semi);cursor:pointer;transition:all var(--transition)}
      .ecos-upload-btn.submit{background:var(--ac);color:#fff} .ecos-upload-btn.submit:hover{background:var(--ac-dark)} .ecos-upload-btn.submit:disabled{opacity:.4;pointer-events:none}
      .ecos-upload-btn.cancel{background:transparent;color:var(--muted);border:1px solid var(--border)} .ecos-upload-btn.cancel:hover{color:var(--text);border-color:var(--border2)}
      /* Preview PDF */
      #ecos-preview-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.7);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
      #ecos-preview-panel{width:min(1200px,96vw);height:92vh;background:#fff;border-radius:var(--r);overflow:hidden;display:flex;flex-direction:column}
      #ecos-preview-head{padding:10px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;font-size:var(--fs-small);font-weight:var(--fw-semi);color:var(--text);flex-shrink:0;background:#fff;flex-wrap:wrap}
      #ecos-preview-head .pv-title{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
      #ecos-preview-head a.pv-btn{font-size:var(--fs-tiny);color:var(--text2);font-weight:var(--fw-semi);text-decoration:none;padding:4px 8px;border:1px solid var(--border);border-radius:var(--r-sm);white-space:nowrap;transition:border-color var(--transition),color var(--transition);background:var(--surface2)} #ecos-preview-head a.pv-btn:hover{border-color:var(--ac);color:var(--ac)}
      #ecos-preview-head button.pv-close{background:none;border:none;cursor:pointer;font-size:18px;color:var(--muted);padding:2px 6px;border-radius:4px;flex-shrink:0} #ecos-preview-head button.pv-close:hover{color:var(--text);background:var(--surface2)}
      #ecos-preview-head button.pv-del{font-size:var(--fs-tiny);font-weight:var(--fw-semi);font-family:inherit;cursor:pointer;padding:4px 8px;border-radius:var(--r-sm);border:1px solid #fca5a5;background:var(--danger-light);color:var(--danger);transition:background var(--transition)} #ecos-preview-head button.pv-del:hover{background:#fee2e2}
      #ecos-preview-rating{display:flex;align-items:center;gap:2px;padding:3px 8px;border:1px solid var(--border);border-radius:var(--r-sm);background:var(--surface2);flex-shrink:0}
      #ecos-preview-rating .pr-star{font-size:15px;cursor:pointer;color:var(--border2);transition:color .1s,transform .1s;line-height:1;user-select:none} #ecos-preview-rating .pr-star:hover,#ecos-preview-rating .pr-star.filled{color:#f59e0b;transform:scale(1.15)}
      #ecos-preview-rating .pr-info{font-size:10px;color:var(--muted);margin-left:4px;white-space:nowrap}
      #ecos-preview-iframe{flex:1;border:none;width:100%;min-width:0}
      #ecos-preview-split{flex:1;display:flex;overflow:hidden}
      #ecos-scoring-panel{width:320px;flex-shrink:0;border-left:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto;background:var(--surface2)}
      @media(max-width:800px){#ecos-scoring-panel{width:260px}}
      @media(max-width:640px){#ecos-preview-split{flex-direction:column}#ecos-scoring-panel{width:100%;max-height:50vh;border-left:none;border-top:1px solid var(--border)}}
      /* Timer & Scoring for SDD page */
      .ecos-timer-wrap{padding:14px 16px;border-bottom:1px solid var(--border);background:#fff}
      .ecos-timer-phase{font-size:10px;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:6px;display:flex;align-items:center;gap:6px}
      .ecos-timer-phase .phase-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
      .ecos-timer-phase .phase-dot.active{background:var(--success);animation:pulse-dot 1.5s ease infinite}
      .ecos-timer-phase .phase-dot.idle{background:var(--border2)}
      @keyframes pulse-dot{0%,100%{opacity:1}50%{opacity:.3}}
      .ecos-timer-display{font-size:36px;font-weight:var(--fw-heavy);font-variant-numeric:tabular-nums;letter-spacing:-1px;line-height:1;color:var(--text)}
      .ecos-timer-display.warning{color:var(--warning)}.ecos-timer-display.danger{color:var(--danger)}
      .ecos-timer-bar{height:3px;background:var(--border);border-radius:999px;margin-top:8px;overflow:hidden}
      .ecos-timer-bar-fill{height:100%;border-radius:999px;background:var(--ac);transition:width .3s linear}
      .ecos-timer-bar-fill.warning{background:var(--warning)}.ecos-timer-bar-fill.danger{background:var(--danger)}
      .ecos-timer-controls{display:flex;gap:6px;margin-top:10px}
      .ecos-timer-btn{flex:1;padding:6px 0;border:1px solid var(--border);border-radius:var(--r-sm);background:#fff;font-family:inherit;font-size:var(--fs-tiny);font-weight:var(--fw-semi);cursor:pointer;color:var(--text2);transition:all var(--transition)}
      .ecos-timer-btn:hover{border-color:var(--ac);color:var(--ac)}
      .ecos-timer-btn.primary{background:var(--ac);border-color:var(--ac);color:#fff}.ecos-timer-btn.primary:hover{background:var(--ac-dark)}
      .ecos-scoring-section{padding:14px 16px;border-bottom:1px solid var(--border);background:#fff}
      .ecos-scoring-title{font-size:10px;font-weight:var(--fw-bold);text-transform:uppercase;letter-spacing:.8px;color:var(--muted);margin-bottom:10px}
      .ecos-grid-config{display:flex;align-items:center;gap:8px;margin-bottom:10px}
      .ecos-grid-config label{font-size:var(--fs-tiny);color:var(--text2);font-weight:var(--fw-semi)}
      .ecos-grid-config input{width:50px;padding:4px 6px;border:1px solid var(--border);border-radius:var(--r-sm);font-size:var(--fs-tiny);font-family:inherit;text-align:center;color:var(--text);outline:none}
      .ecos-grid-config input:focus{border-color:var(--ac)}
      .ecos-grid-points{display:flex;flex-wrap:wrap;gap:5px}
      .ecos-point-btn{width:32px;height:32px;border-radius:var(--r-sm);border:1.5px solid var(--border);background:#fff;color:var(--muted);font-size:var(--fs-tiny);font-weight:var(--fw-bold);font-family:inherit;cursor:pointer;display:grid;place-items:center;transition:all .12s ease}
      .ecos-point-btn:hover{border-color:var(--ac);color:var(--ac)}
      .ecos-point-btn.earned{background:var(--ac);border-color:var(--ac);color:#fff}
      .ecos-grid-score{margin-top:10px;display:flex;align-items:baseline;gap:4px}
      .ecos-grid-score-val{font-size:22px;font-weight:var(--fw-heavy);color:var(--text)}
      .ecos-grid-score-total{font-size:var(--fs-small);color:var(--muted);font-weight:var(--fw-med)}
      .ecos-notes-section{padding:14px 16px;border-bottom:1px solid var(--border);background:#fff}
      .ecos-notes-section textarea{width:100%;min-height:120px;max-height:300px;resize:vertical;border:1.5px solid var(--border);border-radius:var(--r-sm);padding:8px 10px;font-family:inherit;font-size:var(--fs-tiny);color:var(--text);background:#fff;outline:none;line-height:1.5;transition:border-color var(--transition)}
      .ecos-notes-section textarea:focus{border-color:var(--ac)}
      .ecos-notes-section textarea::placeholder{color:var(--muted)}
      .ecos-final-score{padding:16px;background:#fff;border-top:1px solid var(--border);margin-top:auto}
      .ecos-final-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:var(--fs-tiny);color:var(--text2)}
      .ecos-final-row-val{font-weight:var(--fw-bold);color:var(--text)}
      .ecos-final-divider{height:1px;background:var(--border);margin:10px 0}
      .ecos-final-total{display:flex;justify-content:space-between;align-items:center;font-size:var(--fs-base);font-weight:var(--fw-heavy);color:var(--text)}
      .ecos-final-total-val{font-size:22px;color:var(--ac)}
      .ecos-final-save{width:100%;margin-top:12px;padding:8px;border:none;border-radius:var(--r-sm);background:var(--ac);color:#fff;font-family:inherit;font-size:var(--fs-tiny);font-weight:var(--fw-bold);cursor:pointer;transition:background var(--transition)}
      .ecos-final-save:hover{background:var(--ac-dark)}.ecos-final-save:disabled{opacity:.4;pointer-events:none}.ecos-final-save.saved{background:var(--success)}
      .ecos-sdd-link{display:flex;align-items:center;gap:6px;padding:10px 16px;border-bottom:1px solid var(--border);background:#fff;font-size:var(--fs-tiny);text-decoration:none;color:var(--ac);font-weight:var(--fw-semi);transition:background var(--transition)}
      .ecos-sdd-link:hover{background:var(--ac-light)}
      @keyframes spin{to{transform:rotate(360deg)}}
      @media(max-width:${CFG.breakpointOneCol}px){#sdd-bc,#sdd-top{padding-left:14px;padding-right:14px}#sdd-body{grid-template-columns:1fr;padding-left:14px;padding-right:14px}#sdd-follow{position:static;max-height:none;overflow-y:visible}#sdd-top{flex-wrap:wrap}#sdd-top-title{font-size:20px}#sdd-top-back{order:-1;width:100%}}
    `;
    document.head.appendChild(style);

    async function bootSDD() {
      if (cloudEnabled()) { try { const r = await cloudPull(); if (r) importLocalState(r); } catch (_) {} communityMigrateIfNeeded().catch(() => {}); }
      let attempts = 0;
      const tryBuild = () => { attempts++; if (document.querySelectorAll('.navbox table').length) buildSDD(); else if (attempts < 50) setTimeout(tryBuild, 100); else buildSDD(); };
      tryBuild();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootSDD);
    else bootSDD();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ECOS — chargement fichiers depuis Firestore
  // ══════════════════════════════════════════════════════════════════════════
  async function loadEcosFiles(sddN) {
    const tok = await cloudEnsureSession(); if (!tok) throw new Error('Non authentifié');
    const r = await fetch(`${firestoreBase()}/ecos/${sddN}/files`, { headers: { Authorization: `Bearer ${tok.idToken}` } });
    if (r.status === 404) return []; if (!r.ok) throw new Error(`Firestore ECOS HTTP ${r.status}`);
    const json = await r.json().catch(() => ({})); const docs = json.documents || [];
    function getField(fields, k) { const fv = fields?.[k]; if (!fv) return ''; return fv.stringValue ?? fv.integerValue ?? fv.doubleValue ?? ''; }
    const out = await Promise.all(docs.map(async (doc) => {
      const f = doc.fields || {}; let rawUrl = getField(f, 'url');
      rawUrl = normalizeToFirebaseEndpoint(rawUrl);
      if (rawUrl && rawUrl.startsWith('gs://')) rawUrl = await resolvePublicEcosUrl(rawUrl);
      return { id: doc.name?.split('/').pop() || '', name: getField(f, 'name'), url: rawUrl, source: getField(f, 'source'), specialite: getField(f, 'specialite'), sizeBytes: parseInt(f.sizeBytes?.integerValue || '0', 10), uploadedBy: getField(f, 'uploadedBy'), uploadedAt: getField(f, 'uploadedAt'), storagePath: getField(f, 'storagePath') };
    }));
    return out.filter(d => d.name && d.url && /^https?:\/\//i.test(d.url));
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ECOS — Upload
  // ══════════════════════════════════════════════════════════════════════════
  async function uploadEcosFile(file, sddN, onProgress) {
    const tok = await cloudEnsureSession(); if (!tok) throw new Error('Non authentifié');
    const { storageBucket } = CFG.ecos; const ext = file.name.split('.').pop().toLowerCase();
    const timestamp = Date.now(); const safeUid = (tok.uid || 'anon').replace(/[^a-zA-Z0-9_-]/g, '_');
    const storagePath = `ecos/${sddN}/${timestamp}_${safeUid}.${ext}`;
    const initUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o?uploadType=resumable&name=${encodeURIComponent(storagePath)}`;
    const initRes = await fetch(initUrl, { method: 'POST', headers: { 'Authorization': `Bearer ${tok.idToken}`, 'Content-Type': 'application/json', 'X-Goog-Upload-Protocol': 'resumable', 'X-Goog-Upload-Command': 'start', 'X-Goog-Upload-Header-Content-Type': file.type || 'application/octet-stream', 'X-Goog-Upload-Header-Content-Length': String(file.size) }, body: JSON.stringify({ name: storagePath, contentType: file.type || 'application/octet-stream' }) });
    if (!initRes.ok) { const txt = await initRes.text().catch(() => ''); throw new Error(`Storage init HTTP ${initRes.status}: ${txt.slice(0, 200)}`); }
    let uploadUrl = initRes.headers.get('X-Goog-Upload-URL') || initRes.headers.get('Location');
    if (!uploadUrl) return await uploadEcosFileMultipart(file, sddN, storagePath, tok, onProgress);
    const CHUNK = 256 * 1024; let offset = 0, downloadUrl = '';
    while (offset < file.size) {
      const end = Math.min(offset + CHUNK, file.size), chunk = file.slice(offset, end), isLast = end >= file.size;
      const uploadRes = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-Goog-Upload-Command': isLast ? 'upload, finalize' : 'upload', 'X-Goog-Upload-Offset': String(offset), 'Content-Length': String(chunk.size) }, body: chunk });
      offset = end; if (onProgress) onProgress(Math.round(offset / file.size * 100));
      if (isLast) {
        if (!uploadRes.ok) { const txt = await uploadRes.text().catch(() => ''); throw new Error(`Storage upload HTTP ${uploadRes.status}: ${txt.slice(0, 200)}`); }
        const uploadJson = await uploadRes.json().catch(() => ({}));
        downloadUrl = uploadJson.downloadTokens ? `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(storagePath)}?alt=media&token=${uploadJson.downloadTokens}` : makePublicHttpUrl(storageBucket, storagePath);
      }
    }
    invalidateEcosPresenceCache();
    return { storagePath, downloadUrl, gsUrl: `gs://${storageBucket}/${storagePath}` };
  }

  async function uploadEcosFileMultipart(file, sddN, storagePath, tok, onProgress) {
    const { storageBucket } = CFG.ecos;
    const buffer = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Lecture du fichier échouée')); reader.readAsArrayBuffer(file); });
    if (onProgress) onProgress(50);
    const uploadRes = await fetch(`https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o?name=${encodeURIComponent(storagePath)}&uploadType=media`, { method: 'POST', headers: { 'Authorization': `Bearer ${tok.idToken}`, 'Content-Type': file.type || 'application/octet-stream' }, body: buffer });
    if (!uploadRes.ok) { const txt = await uploadRes.text().catch(() => ''); throw new Error(`Storage multipart HTTP ${uploadRes.status}: ${txt.slice(0, 200)}`); }
    const uploadJson = await uploadRes.json().catch(() => ({})); if (onProgress) onProgress(100);
    invalidateEcosPresenceCache();
    const downloadUrl = uploadJson.downloadTokens ? `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(storagePath)}?alt=media&token=${uploadJson.downloadTokens}` : makePublicHttpUrl(storageBucket, storagePath);
    return { storagePath, downloadUrl, gsUrl: `gs://${storageBucket}/${storagePath}` };
  }

  async function saveEcosFileMeta(sddN, meta) {
    const tok = await cloudEnsureSession(); if (!tok) throw new Error('Non authentifié');
    const docId = `file_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const url = `${firestoreBase()}/ecos/${sddN}/files/${docId}`;
    const fields = { name: { stringValue: meta.name || '' }, url: { stringValue: meta.downloadUrl || '' }, storagePath: { stringValue: meta.storagePath || '' }, gsUrl: { stringValue: meta.gsUrl || '' }, source: { stringValue: meta.source || '' }, specialite: { stringValue: meta.specialite || '' }, sizeBytes: { integerValue: String(meta.sizeBytes || 0) }, mimeType: { stringValue: meta.mimeType || '' }, uploadedBy: { stringValue: tok.uid || '' }, uploadedAt: { integerValue: String(Date.now()) } };
    const r = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok.idToken}` }, body: JSON.stringify({ fields }) });
    if (!r.ok) { const txt = await r.text().catch(() => ''); throw new Error(`Firestore save HTTP ${r.status}: ${txt.slice(0, 200)}`); }
    return docId;
  }

  async function deleteEcosFile(sddN, fileId, storagePath) {
    const tok = await cloudEnsureSession(); if (!tok) throw new Error('Non authentifié');
    const fsRes = await fetch(`${firestoreBase()}/ecos/${sddN}/files/${fileId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok.idToken}` } });
    if (!fsRes.ok && fsRes.status !== 404) throw new Error(`Firestore delete HTTP ${fsRes.status}`);
    if (storagePath) { try { await fetch(`https://firebasestorage.googleapis.com/v0/b/${CFG.ecos.storageBucket}/o/${encodeURIComponent(storagePath)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok.idToken}` } }); } catch (_) {} }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ECOS — Preview PDF
  // ══════════════════════════════════════════════════════════════════════════
  // ══════════════════════════════════════════════════════════════════════════
  // ECOS — Preview PDF with Scoring Panel (v14)
  // ══════════════════════════════════════════════════════════════════════════

  function buildScoringPanelHTML(sddN, sddName, file, sddHref) {
    const tags = SDD_TAGS[sddN] || [];
    const matiere = tags[0] || 'Non classée';
    return `
      ${sddHref ? `<a class="ecos-sdd-link" href="${escapeHtml(sddHref)}" target="_blank">SDD — ${escapeHtml(sddName || 'SDD-' + sddN)}</a>` : ''}
      <div class="ecos-timer-wrap" id="ecos-timer-section">
        <div class="ecos-timer-phase"><span class="phase-dot idle" id="timer-dot"></span><span id="timer-phase-label">ECOS — 8 min</span></div>
        <div class="ecos-timer-display" id="timer-display">8:00</div>
        <div class="ecos-timer-bar"><div class="ecos-timer-bar-fill" id="timer-bar" style="width:100%"></div></div>
        <div class="ecos-timer-controls">
          <button class="ecos-timer-btn primary" id="timer-start">▶ Démarrer</button>
          <button class="ecos-timer-btn" id="timer-reset">↺ Reset</button>
        </div>
      </div>
      <div class="ecos-notes-section">
        <div class="ecos-scoring-title">Mes notes</div>
        <textarea id="ecos-notes-textarea" placeholder="Écris tes réponses, idées, hypothèses diagnostiques…"></textarea>
      </div>
      <div class="ecos-scoring-section">
        <div class="ecos-scoring-title">Grille de notation</div>
        <div class="ecos-grid-config">
          <label>Total points :</label>
          <input type="number" id="ecos-grid-total" value="20" min="1" max="100">
        </div>
        <div class="ecos-grid-points" id="ecos-grid-points"></div>
        <div class="ecos-grid-score">
          <span class="ecos-grid-score-val" id="ecos-grid-val">0</span>
          <span class="ecos-grid-score-total">/ <span id="ecos-grid-max">20</span></span>
        </div>
      </div>
      <div class="ecos-final-score" id="ecos-final-score">
        <div class="ecos-final-total"><span>Note station</span><span class="ecos-final-total-val" id="final-total">0 / 20</span></div>
        <div style="font-size:10px;color:var(--muted);margin-top:4px" id="final-matiere">${escapeHtml(matiere)}</div>
        <button class="ecos-final-save" id="ecos-save-btn" disabled>💾 Enregistrer la note</button>
      </div>`;
  }

  function initScoringPanel(container, sddN, sddName, file) {
    const tags = SDD_TAGS[sddN] || [];
    const matiere = tags[0] || 'Non classée';

    // State
    let gridTotal = 20, earnedPoints = new Set();

    // Timer state
    const PHASE_ECOS = 0, PHASE_DEBRIEF = 1, PHASE_DONE = 2;
    const PHASE_DURATIONS = [8 * 60, 3 * 60];
    const PHASE_LABELS = ['ECOS — 8 min', 'Débrief — 3 min'];
    let phase = PHASE_ECOS, remaining = PHASE_DURATIONS[0], timerInterval = null, running = false;

    const timerDisplay = container.querySelector('#timer-display');
    const timerBar = container.querySelector('#timer-bar');
    const timerDot = container.querySelector('#timer-dot');
    const timerPhaseLabel = container.querySelector('#timer-phase-label');
    const btnStart = container.querySelector('#timer-start');
    const btnReset = container.querySelector('#timer-reset');
    const gridContainer = container.querySelector('#ecos-grid-points');
    const gridValEl = container.querySelector('#ecos-grid-val');
    const gridMaxEl = container.querySelector('#ecos-grid-max');
    const gridTotalInput = container.querySelector('#ecos-grid-total');
    const finalTotal = container.querySelector('#final-total');
    const saveBtn = container.querySelector('#ecos-save-btn');

    const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

    // ── Timer ──
    function updateTimerUI() {
      timerDisplay.textContent = fmt(remaining);
      const total = PHASE_DURATIONS[phase] || 1;
      const pct = Math.max(0, remaining / total * 100);
      timerBar.style.width = pct + '%';

      // Color classes
      const ratio = remaining / total;
      timerDisplay.className = 'ecos-timer-display' + (ratio <= 0.125 ? ' danger' : ratio <= 0.25 ? ' warning' : '');
      timerBar.className = 'ecos-timer-bar-fill' + (ratio <= 0.125 ? ' danger' : ratio <= 0.25 ? ' warning' : '');

      timerDot.className = 'phase-dot ' + (running ? 'active' : 'idle');
      timerPhaseLabel.textContent = phase < 2 ? PHASE_LABELS[phase] : 'Terminé';
    }

    function tick() {
      remaining--;
      if (remaining <= 0) {
        if (phase === PHASE_ECOS) {
          phase = PHASE_DEBRIEF;
          remaining = PHASE_DURATIONS[1];
          haptic('warning');
          container.querySelector('.ecos-timer-wrap').style.background = '#fef3c7';
          setTimeout(() => { container.querySelector('.ecos-timer-wrap').style.background = ''; }, 600);
        } else {
          clearInterval(timerInterval);
          running = false;
          phase = PHASE_DONE;
          remaining = 0;
          btnStart.textContent = '✓ Terminé';
          btnStart.disabled = true;
          haptic('success');
        }
      }
      updateTimerUI();
    }

    btnStart.addEventListener('click', () => {
      if (phase === PHASE_DONE) return;
      if (running) {
        clearInterval(timerInterval); running = false;
        btnStart.textContent = '▶ Reprendre';
        btnStart.classList.add('primary');
        timerDot.className = 'phase-dot idle';
      } else {
        timerInterval = setInterval(tick, 1000); running = true;
        btnStart.textContent = '⏸ Pause';
        btnStart.classList.remove('primary');
        haptic('selection');
      }
      updateTimerUI();
    });

    btnReset.addEventListener('click', () => {
      clearInterval(timerInterval); running = false;
      phase = PHASE_ECOS; remaining = PHASE_DURATIONS[0];
      btnStart.textContent = '▶ Démarrer'; btnStart.disabled = false; btnStart.classList.add('primary');
      updateTimerUI();
    });

    updateTimerUI();

    // ── Grid ──
    function renderGrid() {
      gridContainer.innerHTML = '';
      earnedPoints = new Set([...earnedPoints].filter(p => p <= gridTotal));
      for (let i = 1; i <= gridTotal; i++) {
        const btn = document.createElement('button');
        btn.className = 'ecos-point-btn' + (earnedPoints.has(i) ? ' earned' : '');
        btn.textContent = i;
        btn.dataset.point = i;
        gridContainer.appendChild(btn);
      }
      gridMaxEl.textContent = gridTotal;
      updateScores();
    }

    gridContainer.addEventListener('click', e => {
      const btn = e.target.closest('.ecos-point-btn'); if (!btn) return;
      const p = parseInt(btn.dataset.point, 10);
      if (earnedPoints.has(p)) { earnedPoints.delete(p); btn.classList.remove('earned'); }
      else { earnedPoints.add(p); btn.classList.add('earned'); }
      haptic('selection');
      updateScores();
    });

    gridTotalInput.addEventListener('change', () => {
      const v = parseInt(gridTotalInput.value, 10);
      if (v > 0 && v <= 100) { gridTotal = v; renderGrid(); }
    });

    renderGrid();

    // ── Scores ──
    function updateScores() {
      const gridScore = earnedPoints.size;
      gridValEl.textContent = gridScore;

      if (gridTotal > 0) {
        const finalNote = Math.round((gridScore / gridTotal) * 20 * 10) / 10;
        finalTotal.textContent = finalNote.toFixed(1) + ' / 20';
        saveBtn.disabled = false;
      } else {
        finalTotal.textContent = '—';
        saveBtn.disabled = true;
      }
    }

    // ── Save ──
    saveBtn.addEventListener('click', async () => {
      if (!cloudEnabled()) return;
      const gridScore = earnedPoints.size;
      const finalNote = Math.round((gridScore / gridTotal) * 20 * 10) / 10;

      saveBtn.disabled = true; saveBtn.textContent = '…';
      try {
        await saveEcosScore(sddN, file?.id || 'unknown', {
          gridScore, gridTotal, performance: 0, finalScore: finalNote,
          matiere, sddName: sddName || '', fileName: file?.name || '',
          date: new Date().toISOString(),
        });
        haptic('success');
        saveBtn.textContent = '✓ Enregistré';
        saveBtn.classList.add('saved');
        setTimeout(() => { saveBtn.textContent = '💾 Enregistrer la note'; saveBtn.classList.remove('saved'); saveBtn.disabled = false; }, 2000);
      } catch (err) {
        console.error('[ECOS Score Save]', err);
        saveBtn.textContent = '⚠ Erreur'; saveBtn.disabled = false;
        setTimeout(() => { saveBtn.textContent = '💾 Enregistrer la note'; }, 2000);
      }
    });

    // ── Load existing score ──
    if (cloudEnabled() && file?.id) {
      loadEcosScore(sddN, file.id).then(data => {
        if (!data) return;
        if (data.gridTotal) { gridTotal = data.gridTotal; gridTotalInput.value = gridTotal; }
        if (data.gridScore) { for (let i = 1; i <= data.gridScore; i++) earnedPoints.add(i); }
        renderGrid();
      }).catch(() => {});
    }

    // Return cleanup function
    return () => { clearInterval(timerInterval); };
  }

  function openEcosPreviewWithTimer(file, sddN, sddName) {
    // Resolve SDD href
    const sddHref = `https://livret.uness.fr/lisa/2025/${encodeURIComponent(sddName + ' SDD-' + sddN)}`;
    openEcosPreviewV14(file, null, sddN, sddName, sddHref, null);
  }

  function openEcosPreviewV14(file, currentUid, sddN, sddName, sddHref, onDelete) {
    document.getElementById('ecos-preview-backdrop')?.remove();
    const safeUrl = normalizeToFirebaseEndpoint(file?.url);
    const sizeMB = (file?.sizeBytes > 0) ? ` · ${(file.sizeBytes / 1048576).toFixed(1)} Mo` : '';
    const ADMIN_UID = "2ZoVk6EHufhH5EC0tHhWI4l99kh2";
    const canDelete = currentUid && (file.uploadedBy === currentUid || currentUid === ADMIN_UID);

    const backdrop = document.createElement('div'); backdrop.id = 'ecos-preview-backdrop';
    backdrop.innerHTML = `<div id="ecos-preview-panel">
      <div id="ecos-preview-head">
        <span class="pv-title" title="${escapeHtml(file?.name || '')}">📄 ${escapeHtml(file?.name || 'Document')}${escapeHtml(sizeMB)}</span>
        <div id="ecos-preview-rating">
          <span class="pr-star" data-star="1">★</span>
          <span class="pr-star" data-star="2">★</span>
          <span class="pr-star" data-star="3">★</span>
          <span class="pr-star" data-star="4">★</span>
          <span class="pr-star" data-star="5">★</span>
          <span class="pr-info">…</span>
        </div>
        <a class="pv-btn" href="${escapeHtml(safeUrl)}" download="${escapeHtml(file?.name || 'document.pdf')}" target="_blank">⬇ Télécharger</a>
        ${canDelete ? `<button class="pv-del" id="pv-del-btn">✕ Supprimer</button>` : ''}
        <button class="pv-close" id="ecos-preview-close" title="Fermer (Echap)">✕</button>
      </div>
      <div id="ecos-preview-split">
        <iframe id="ecos-preview-iframe" src="${escapeHtml(safeUrl)}" title="${escapeHtml(file?.name || 'Document')}" allow="fullscreen" referrerpolicy="no-referrer"></iframe>
        <div id="ecos-scoring-panel">
          ${buildScoringPanelHTML(sddN, sddName, file, sddHref)}
        </div>
      </div>
    </div>`;
    document.body.appendChild(backdrop);

    // Init scoring panel
    const scoringPanel = backdrop.querySelector('#ecos-scoring-panel');
    const cleanup = initScoringPanel(scoringPanel, sddN, sddName || '', file);

    // Rating dans le preview
    const ratingBlock = backdrop.querySelector('#ecos-preview-rating');
    const prInfo = ratingBlock.querySelector('.pr-info');
    if (cloudEnabled() && sddN && file?.id) {
      loadFileRating(sddN, file.id).then(d => {
        if (!d) return;
        const filled = d.myRating > 0 ? d.myRating : Math.round(d.avg);
        ratingBlock.querySelectorAll('.pr-star').forEach((s, i) => s.classList.toggle('filled', i < filled));
        prInfo.textContent = d.count > 0 ? `${d.avg}/5 (${d.count})` : 'Pas encore noté';
      }).catch(() => {});

      ratingBlock.addEventListener('click', async e => {
        const star = e.target.closest('.pr-star'); if (!star) return;
        const rating = parseInt(star.dataset.star, 10);
        haptic('selection');
        ratingBlock.style.opacity = '.5'; ratingBlock.style.pointerEvents = 'none';
        try {
          const d = await submitFileRating(sddN, file.id, rating);
          haptic('medium');
          const filled = d.myRating > 0 ? d.myRating : Math.round(d.avg);
          ratingBlock.querySelectorAll('.pr-star').forEach((s, i) => s.classList.toggle('filled', i < filled));
          prInfo.textContent = d.count > 0 ? `${d.avg}/5 (${d.count})` : 'Pas encore noté';
        } catch (_) {}
        finally { ratingBlock.style.opacity = ''; ratingBlock.style.pointerEvents = ''; }
      });
      ratingBlock.addEventListener('mouseover', e => {
        const star = e.target.closest('.pr-star'); if (!star) return;
        const n = parseInt(star.dataset.star, 10);
        ratingBlock.querySelectorAll('.pr-star').forEach((s, i) => { s.style.color = i < n ? '#f59e0b' : ''; });
      });
      ratingBlock.addEventListener('mouseout', e => {
        if (e.target.closest('.pr-star')) ratingBlock.querySelectorAll('.pr-star').forEach(s => { s.style.color = ''; });
      });
    }

    // Suppression
    backdrop.querySelector('#pv-del-btn')?.addEventListener('click', async () => {
      if (!confirm('Supprimer ce fichier ?')) return;
      const btn = backdrop.querySelector('#pv-del-btn'); btn.textContent = '…'; btn.disabled = true;
      try {
        await deleteEcosFile(sddN, file.id, file.storagePath);
        haptic('warning');
        cleanup();
        backdrop.remove();
        if (onDelete) onDelete(file.id);
      } catch (err) { alert('Erreur : ' + err.message); btn.textContent = '✕ Supprimer'; btn.disabled = false; }
    });

    const close = () => { cleanup(); backdrop.remove(); };
    backdrop.querySelector('#ecos-preview-close').addEventListener('click', close);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
    const onKey = e => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } };
    document.addEventListener('keydown', onKey);
  }

  function openEcosPreview(file, currentUid, sddN, onDelete) {
    // v14: redirect to the new split preview
    // Resolve SDD name from tags or file info
    const sddHref = `https://livret.uness.fr/lisa/2025/${encodeURIComponent((file?.sddName || '') + ' SDD-' + sddN)}`.replace(/ SDD-/g, '+SDD-');
    openEcosPreviewV14(file, currentUid, sddN, '', sddHref, onDelete);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ECOS — Build Card (liste + upload + checkbox done + rating /5)
  // ══════════════════════════════════════════════════════════════════════════
  async function buildEcosCard(sddN, sddName, follow) {
    const ecosCollapsed = isCollapsedKey(`sdd_${sddN}_ecos`);
    const ecosCard = document.createElement('div');
    ecosCard.className = `sc${ecosCollapsed ? ' collapsed' : ''}`;
    ecosCard.dataset.key = 'ecos';
    ecosCard.innerHTML = `
      <div class="sc-head">
        <div class="sc-dot" style="background:#dc2626"></div>
        <span class="sc-head-label">Stations ECOS</span>
        <span class="sc-toggle">▾</span>
      </div>
      <div class="sc-body" id="ecos-body">
        ${ecosCollapsed ? '' : '<div style="color:var(--muted);font-size:12px;display:flex;align-items:center;gap:8px"><div style="width:14px;height:14px;border:2px solid var(--border);border-top-color:var(--ac);border-radius:50%;animation:spin .7s linear infinite"></div>Chargement…</div>'}
      </div>`;
    follow.appendChild(ecosCard);
    const body = ecosCard.querySelector('#ecos-body');
    let _files = [];

    function updateRatingUI(idx, ratingData, container) {
      const ratingEl = container.querySelector(`#ecos-rating-${idx}`); if (!ratingEl) return;
      const { avg, count, myRating } = ratingData;
      const filled = myRating > 0 ? myRating : Math.round(avg);
      ratingEl.querySelectorAll('.ecos-rating-star').forEach((s, i) => { s.style.color = ''; s.classList.toggle('filled', i < filled); });
      const infoEl = ratingEl.querySelector('.ecos-rating-info');
      if (infoEl) infoEl.textContent = count > 0 ? `${avg}/5 (${count} vote${count > 1 ? 's' : ''})` : 'Pas encore noté';
    }

    function renderFileList(files, currentUid) {
      _files = files;
      let listWrap = body.querySelector('#ecos-file-list');
      if (!listWrap) { listWrap = document.createElement('div'); listWrap.id = 'ecos-file-list'; }
      listWrap.innerHTML = '';

      if (!files.length) {
        listWrap.innerHTML = '<p style="color:var(--muted);font-size:12px;font-style:italic;margin:0 0 4px">Aucune station ECOS disponible.</p>';
        return listWrap;
      }

      const listDiv = document.createElement('div');
      listDiv.className = 'ecos-list';

      for (let fi = 0; fi < files.length; fi++) {
        const f = files[fi];
        const sizeMB = f.sizeBytes > 0 ? `${(f.sizeBytes / 1048576).toFixed(1)} Mo` : '';
        const meta = [f.source, f.specialite, sizeMB].filter(Boolean).join(' · ');
        const isDoneStation = getEcosStationDone(sddN, f.id);

        const item = document.createElement('div');
        item.className = `ecos-item${isDoneStation ? ' station-done' : ''}`;
        item.dataset.idx = fi;
        item.innerHTML = `
          <div class="ecos-info" data-action="preview" data-idx="${fi}">
            <div class="ecos-name" title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</div>
            ${meta ? `<div class="ecos-meta">${escapeHtml(meta)}</div>` : ''}
          </div>
          <div class="ecos-done-ck${isDoneStation ? ' on' : ''}" data-action="toggle-done" data-idx="${fi}" title="${isDoneStation ? 'Marquer non faite' : 'Marquer comme faite'}">✓</div>
          <div class="ecos-rating" id="ecos-rating-${fi}">
            <span class="ecos-rating-star" data-star="1" data-idx="${fi}">★</span>
            <span class="ecos-rating-star" data-star="2" data-idx="${fi}">★</span>
            <span class="ecos-rating-star" data-star="3" data-idx="${fi}">★</span>
            <span class="ecos-rating-star" data-star="4" data-idx="${fi}">★</span>
            <span class="ecos-rating-star" data-star="5" data-idx="${fi}">★</span>
            <span class="ecos-rating-info">…</span>
          </div>`;
        listDiv.appendChild(item);

        // Charger rating en arrière-plan
        if (cloudEnabled()) {
          loadFileRating(sddN, f.id).then(d => { if (d) updateRatingUI(fi, d, listDiv); }).catch(() => {});
        }
      }
      listWrap.appendChild(listDiv);

      // Délégation clicks (toggle-done, preview, delete)
      listWrap.addEventListener('click', async e => {
        const el = e.target.closest('[data-action]'); if (!el) return;
        const idx = parseInt(el.dataset.idx, 10), f = _files[idx];

        if (el.dataset.action === 'toggle-done') {
          if (!f) return;
          const nowDone = !getEcosStationDone(sddN, f.id);
          haptic(nowDone ? 'success' : 'light');
          setEcosStationDone(sddN, f.id, nowDone);
          el.className = `ecos-done-ck${nowDone ? ' on' : ''}`;
          el.title = nowDone ? 'Marquer non faite' : 'Marquer comme faite';
          el.closest('.ecos-item')?.classList.toggle('station-done', nowDone);
          return;
        }
        if (el.dataset.action === 'preview') {
          if (!f) return;
          const sddHref = `https://livret.uness.fr/lisa/2025/${encodeURIComponent(sddName + ' SDD-' + sddN)}`;
          openEcosPreviewV14(f, currentUid, sddN, sddName, sddHref, (deletedId) => {
            _files = _files.filter(x => x.id !== deletedId);
            renderFileList(_files, currentUid);
          });
          return;
        }
      });

      // Délégation étoiles — click
      listWrap.addEventListener('click', async e => {
        const star = e.target.closest('.ecos-rating-star'); if (!star) return;
        e.stopPropagation();
        const idx = parseInt(star.dataset.idx, 10), rating = parseInt(star.dataset.star, 10), f = _files[idx];
        if (!f) return;
        haptic('selection');
        star.style.opacity = '.4';
        try {
          const newData = await submitFileRating(sddN, f.id, rating);
          haptic('medium');
          updateRatingUI(idx, newData, listDiv);
        } catch (err) { console.warn('[ECOS Rating]', err); }
        finally { star.style.opacity = ''; }
      });

      // Hover preview étoiles
      listWrap.addEventListener('mouseover', e => {
        const star = e.target.closest('.ecos-rating-star'); if (!star) return;
        const rating = parseInt(star.dataset.star, 10), idx = parseInt(star.dataset.idx, 10);
        const ratingEl = listDiv.querySelector(`#ecos-rating-${idx}`);
        ratingEl?.querySelectorAll('.ecos-rating-star').forEach((s, i) => { s.style.color = i < rating ? '#f59e0b' : ''; });
      });
      listWrap.addEventListener('mouseout', e => {
        const star = e.target.closest('.ecos-rating-star'); if (!star) return;
        const idx = parseInt(star.dataset.idx, 10), f = _files[idx];
        const cached = f ? _ratingsCache.get(`${sddN}_${f.id}`) : null;
        if (cached) updateRatingUI(idx, cached, listDiv);
        else {
          const ratingEl = listDiv.querySelector(`#ecos-rating-${idx}`);
          ratingEl?.querySelectorAll('.ecos-rating-star').forEach(s => { s.style.color = ''; });
        }
      });

      return listWrap;
    }

    // Zone d'upload
    function buildUploadZone(currentUid) {
      const wrap = document.createElement('div'); wrap.id = 'ecos-upload-wrap';
      wrap.innerHTML = `
        <button id="ecos-upload-toggle">＋ Ajouter un fichier</button>
        <div id="ecos-upload-panel" style="display:none">
          <div class="ecos-drop-zone" id="ecos-drop-zone">Cliquer ou déposer — PDF, PNG, JPG (max ${CFG.ecos.maxFileSizeMB} Mo)</div>
          <input type="file" id="ecos-upload-input" accept="${CFG.ecos.allowedExt.join(',')}" multiple>
          <div class="ecos-upload-progress" id="ecos-upload-progress"></div>
          <div class="ecos-upload-fields" id="ecos-upload-fields" style="display:none">
            <input type="text" id="ecos-meta-source" placeholder="Source (LISA 2024…)">
            <input type="text" id="ecos-meta-specialite" placeholder="Spécialité">
          </div>
          <div class="ecos-upload-actions" id="ecos-upload-actions" style="display:none">
            <button class="ecos-upload-btn submit" id="ecos-upload-submit" disabled>⬆ Envoyer</button>
            <button class="ecos-upload-btn cancel" id="ecos-upload-cancel">Annuler</button>
          </div>
        </div>`;

      const toggle = wrap.querySelector('#ecos-upload-toggle'), panel = wrap.querySelector('#ecos-upload-panel');
      const dropZone = wrap.querySelector('#ecos-drop-zone'), input = wrap.querySelector('#ecos-upload-input');
      const progress = wrap.querySelector('#ecos-upload-progress'), fields = wrap.querySelector('#ecos-upload-fields');
      const actions = wrap.querySelector('#ecos-upload-actions'), submitBtn = wrap.querySelector('#ecos-upload-submit'), cancelBtn = wrap.querySelector('#ecos-upload-cancel');
      let _pendingFiles = [], _open = false;

      toggle.addEventListener('click', () => { _open = !_open; panel.style.display = _open ? '' : 'none'; toggle.textContent = _open ? '✕ Fermer' : '＋ Ajouter un fichier'; });

      function resetUpload() { _pendingFiles = []; input.value = ''; progress.innerHTML = ''; fields.style.display = 'none'; actions.style.display = 'none'; submitBtn.disabled = true; }

      function validateAndShow(files) {
        const { maxFileSizeMB, allowedTypes } = CFG.ecos; const valid = [], errors = [];
        for (const f of files) {
          if (!allowedTypes.includes(f.type)) { errors.push(f.name + ' : type non supporté'); continue; }
          if (f.size > maxFileSizeMB * 1024 * 1024) { errors.push(f.name + ' : trop lourd (max ' + maxFileSizeMB + ' Mo)'); continue; }
          valid.push(f);
        }
        if (errors.length) alert('Fichiers rejetés :\n' + errors.join('\n'));
        if (!valid.length) return;
        _pendingFiles = valid; progress.innerHTML = '';
        for (const f of valid) {
          const item = document.createElement('div'); item.className = 'ecos-upload-item'; item.dataset.fname = f.name;
          item.innerHTML = '<span class="ecos-upload-item-name" title="' + escapeHtml(f.name) + '">' + escapeHtml(f.name) + '</span><div class="ecos-upload-bar-wrap"><div class="ecos-upload-bar"></div></div><span class="ecos-upload-status">En attente</span>';
          progress.appendChild(item);
        }
        fields.style.display = ''; actions.style.display = ''; submitBtn.disabled = false;
      }

      dropZone.addEventListener('click', () => input.click());
      input.addEventListener('change', () => { if (input.files.length) validateAndShow([...input.files]); });
      dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
      dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('drag-over'); if (e.dataTransfer.files.length) validateAndShow([...e.dataTransfer.files]); });
      cancelBtn.addEventListener('click', resetUpload);

      submitBtn.addEventListener('click', async () => {
        if (!_pendingFiles.length) return; submitBtn.disabled = true; cancelBtn.disabled = true;
        const source = wrap.querySelector('#ecos-meta-source').value.trim();
        const specialite = wrap.querySelector('#ecos-meta-specialite').value.trim();
        const newFiles = [];
        for (const file of _pendingFiles) {
          const itemEl = [...progress.querySelectorAll('.ecos-upload-item')].find(el => el.dataset.fname === file.name);
          const barEl = itemEl?.querySelector('.ecos-upload-bar'), statusEl = itemEl?.querySelector('.ecos-upload-status');
          if (statusEl) statusEl.textContent = '…';
          try {
            const { storagePath, downloadUrl, gsUrl } = await uploadEcosFile(file, sddN, pct => { if (barEl) barEl.style.width = pct + '%'; if (statusEl) statusEl.textContent = pct + '%'; });
            if (barEl) barEl.style.width = '100%';
            const docId = await saveEcosFileMeta(sddN, { name: file.name, downloadUrl, storagePath, gsUrl, source, specialite, sizeBytes: file.size, mimeType: file.type });
            if (statusEl) { statusEl.textContent = '✓'; statusEl.className = 'ecos-upload-status done'; }
            haptic('success');
            newFiles.push({ id: docId, name: file.name, url: downloadUrl, storagePath, gsUrl, source, specialite, sizeBytes: file.size, uploadedBy: currentUid });
          } catch (err) {
            console.error('[ECOS Upload]', err);
            if (statusEl) { statusEl.textContent = '✗'; statusEl.className = 'ecos-upload-status error'; }
            if (barEl) barEl.style.background = 'var(--danger)';
            haptic('warning');
          }
        }
        if (newFiles.length) { _files = [..._files, ...newFiles]; renderFileList(_files, currentUid); }
        setTimeout(() => { resetUpload(); cancelBtn.disabled = false; }, 1200);
      });

      return wrap;
    }

    // Chargement initial
    let loaded = false;
    async function loadAndRender() {
      if (loaded) return; loaded = true;
      body.innerHTML = '';
      const tok = await cloudEnsureSession().catch(() => null);
      const currentUid = tok?.uid || '';
      let files = [];
      try { files = await loadEcosFiles(sddN); }
      catch (e) { const errP = document.createElement('p'); errP.style.cssText = 'color:var(--danger);font-size:12px;margin:0 0 10px'; errP.textContent = '⚠ ' + e.message; body.appendChild(errP); }
      const listWrap = renderFileList(files, currentUid);
      body.appendChild(listWrap);
      if (cloudEnabled()) { const uploadWrap = buildUploadZone(currentUid); body.appendChild(uploadWrap); }
    }

    if (!ecosCollapsed) loadAndRender();
    ecosCard.querySelector('.sc-head').addEventListener('click', e => {
      if (e.target.closest('button,a,input')) return;
      const collapsed = ecosCard.classList.toggle('collapsed');
      setCollapsedKey(`sdd_${sddN}_ecos`, collapsed);
      if (!collapsed) loadAndRender();
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // BUILD SDD PAGE
  // ══════════════════════════════════════════════════════════════════════════
  function buildSDD() {
    const tables = document.querySelectorAll('.navbox table');

    const fullTitle = document.querySelector('#firstHeading')?.textContent?.trim() || document.title;
    const numMatch  = fullTitle.match(/SDD-(\d+)/i);
    const sddN      = numMatch ? parseInt(numMatch[1], 10) : null;
    const sddNum    = numMatch ? 'SDD-' + pad3(sddN) : '';
    const sddName   = fullTitle.replace(/\s*SDD-\d+\s*/i, '').trim();

    let famille = '', famille_href = '';
    tables[0]?.querySelectorAll('tr').forEach(tr => {
      const th = tr.querySelector('th')?.textContent?.trim();
      const td = tr.querySelector('td'); if (!td) return;
      if (th === 'Famille') { const a = td.querySelector('a'); famille = a?.textContent?.trim() || td.textContent.trim(); famille_href = a?.href || ''; }
    });

    let items_primary = [], items_secondary = [], items_tertiary = [];
    if (tables[1]) {
      tables[1].querySelectorAll('tr').forEach(tr => {
        const th    = tr.querySelector('th')?.textContent?.trim() || '';
        const links = [...tr.querySelectorAll('td a')].map(a => ({ text: a.textContent.trim(), href: a.href }));
        if      (th.includes('en rapport'))  items_primary   = links;
        else if (th.includes('non traités')) items_secondary = links;
        else if (th.includes('general'))     items_tertiary  = links;
      });
    }

    function parseAttendus(table) {
      if (!table) return [];
      return [...table.querySelectorAll('tbody tr')].slice(1).map(tr => {
        const tds = tr.querySelectorAll('td'); if (!tds.length) return null;
        const a = tds[0]?.querySelector('a');
        return { text: a?.textContent?.trim() || tds[0]?.textContent?.trim() || '', href: a?.href || '', domains: (tds[1]?.textContent?.trim() || '').split(',').map(s => s.trim()).filter(Boolean), comps: (tds[2]?.textContent?.trim() || '').split(',').map(s => s.trim()).filter(Boolean) };
      }).filter(Boolean);
    }

    const att_famille    = parseAttendus(tables[2]);
    const att_specifique = parseAttendus(tables[3]);
    const att_stage      = parseAttendus(tables[4]);

    document.body.innerHTML = '';

    let navOrder = [], navItems = {}, navIdx = -1;
    try {
      const ord = localStorage.getItem('uness_sdd_nav_order'), its = localStorage.getItem('uness_sdd_nav_items');
      if (ord) navOrder = JSON.parse(ord);
      if (its) { const arr = JSON.parse(its); for (const it of arr) navItems[it.num] = it; }
      if (sddN) navIdx = navOrder.indexOf(sddN);
    } catch (_) {}

    const prevNum  = navIdx > 0                  ? navOrder[navIdx - 1] : null;
    const nextNum  = navIdx < navOrder.length - 1 ? navOrder[navIdx + 1] : null;
    const prevHref = prevNum ? (navItems[prevNum]?.href || '#') : null;
    const nextHref = nextNum ? (navItems[nextNum]?.href || '#') : null;
    const navPos   = navOrder.length > 0 && navIdx >= 0 ? `${navIdx + 1} / ${navOrder.length}` : '';

    const bc = document.createElement('div'); bc.id = 'sdd-bc';
    bc.innerHTML = `
      <a href="/lisa/2025/Accueil">Accueil</a><span class="sep">›</span>
      <a href="/lisa/2025/Cat%C3%A9gorie:Situation_de_d%C3%A9part">Situations de départ</a><span class="sep">›</span>
      <strong style="color:var(--text2);font-weight:var(--fw-semi)">${escapeHtml(sddNum)}</strong>
      <span class="bc-spacer"></span>
      ${navOrder.length > 1 ? `<a class="sdd-nav-btn${prevHref ? '' : ' disabled'}" ${prevHref ? `href="${escapeHtml(prevHref)}"` : ''}>‹ Préc.</a>${navPos ? `<span id="sdd-nav-pos">${navPos}</span>` : ''}<a class="sdd-nav-btn${nextHref ? '' : ' disabled'}" ${nextHref ? `href="${escapeHtml(nextHref)}"` : ''}>Suiv. ›</a>` : ''}
      ${cloudEnabled() ? '<button class="btn-logout" id="btn-logout-sdd" title="Déconnexion cloud">⊗</button>' : ''}`;
    document.body.appendChild(bc);

    if (navOrder.length > 1) {
      document.addEventListener('keydown', e => {
        if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') return;
        if (e.key === ''  && prevHref) location.href = prevHref;
        if (e.key === '' && nextHref) location.href = nextHref;
      });
    }

    const top = document.createElement('div'); top.id = 'sdd-top';
    top.innerHTML = `
      <div id="sdd-top-pill">${escapeHtml(sddNum)}</div>
      <div id="sdd-top-info">
        <div id="sdd-top-title">${escapeHtml(sddName)}</div>
        ${famille ? `<div id="sdd-top-family">Famille · <a href="${escapeHtml(famille_href)}">${escapeHtml(famille)}</a></div>` : ''}
      </div>
      <a id="sdd-top-back" href="/lisa/2025/Cat%C3%A9gorie:Situation_de_d%C3%A9part">← Liste SDD</a>`;
    document.body.appendChild(top);
    document.getElementById('btn-logout-sdd')?.addEventListener('click', () => { if (confirm('Se déconnecter du cloud sync ?')) window.cloudDisconnect(); });

    const bodyEl = document.createElement('div'); bodyEl.id = 'sdd-body';

    function card(title, dotColor, innerHTML, key) {
      const collapsed = (sddN != null && key) ? isCollapsedKey(`sdd_${sddN}_${key}`) : false;
      const div = document.createElement('div');
      div.className = `sc${collapsed ? ' collapsed' : ''}`;
      if (key) div.dataset.key = key;
      div.innerHTML = `<div class="sc-head"><div class="sc-dot" style="background:${dotColor}"></div><span class="sc-head-label">${escapeHtml(title)}</span><span class="sc-toggle">▾</span></div><div class="sc-body">${innerHTML}</div>`;
      return div;
    }

    function chipsBlock(links, bg, color) {
      if (!links.length) return '';
      return `<div class="chips">${links.map(l => `<a class="chip" style="background:${bg};color:${color}" href="${escapeHtml(l.href)}">${escapeHtml(l.text)}</a>`).join('')}</div>`;
    }

    function attTable(rows, tableKey) {
      if (!rows.length) return '<p style="color:var(--muted);font-size:var(--fs-base);font-style:italic">Aucun attendu.</p>';
      return '<table class="at"><thead><tr><th style="width:55%">Attendu</th><th style="width:25%">Domaines</th><th>Compétences</th></tr></thead><tbody>' +
        rows.map((r, i) => {
          const attId = `att-${tableKey}-${sddN}-${i}`;
          const linkHtml = r.href ? '<a href="' + escapeHtml(r.href) + '">' + escapeHtml(r.text) + '</a>' : escapeHtml(r.text);
          return '<tr class="att-row"><td>' + linkHtml + '<button class="att-ai-btn" data-att-id="' + attId + '" data-att-text="' + r.text.replace(/"/g, '&quot;') + '" title="Expliquer cet attendu">✦</button></td><td>' + r.domains.map(d => '<span class="tag tag-d">' + escapeHtml(d) + '</span>').join('') + '</td><td>' + r.comps.map(c => '<span class="tag tag-c">' + escapeHtml(c) + '</span>').join('') + '</td></tr><tr class="att-panel-row" id="panelrow-' + attId + '" style="display:none"><td colspan="3" style="padding:0!important;border-top:none"><div class="att-ai-panel" id="panel-' + attId + '" style="margin:0;border-radius:0;border-left:none;border-right:none;border-bottom:none"></div></td></tr>';
        }).join('') + '</tbody></table>';
    }

    const content = document.createElement('div');
    content.style.cssText = 'display:flex;flex-direction:column;gap:16px;min-width:0';

    if (items_primary.length || items_secondary.length || items_tertiary.length) {
      let html = '';
      if (items_primary.length)   html += `<span class="chip-section" style="background:#eef2ff;color:#4338ca">En rapport direct</span>${chipsBlock(items_primary, '#eef2ff', '#4338ca')}`;
      if (items_secondary.length) html += `<div style="margin-top:14px"><span class="chip-section" style="background:#f1f5f9;color:#475569">Reliés, non traités ici</span>${chipsBlock(items_secondary, '#f1f5f9', '#475569')}</div>`;
      if (items_tertiary.length)  html += `<div style="margin-top:14px"><span class="chip-section" style="background:#f0fdf4;color:#15803d">Reliés en général</span>${chipsBlock(items_tertiary, '#f0fdf4', '#15803d')}</div>`;
      content.appendChild(card('Items de connaissance', '#6366f1', html, 'items'));
    }

    if (att_famille.length)    content.appendChild(card(`Attendus — ${famille || 'Famille'}`, '#10b981', attTable(att_famille,    'famille'),    'att_famille'));
    if (att_specifique.length) content.appendChild(card('Attendus spécifiques',               '#3b82f6', attTable(att_specifique, 'specifique'), 'att_specifique'));
    if (att_stage.length)      content.appendChild(card('Valorisation du stage',              '#f59e0b', attTable(att_stage,      'stage'),      'att_stage'));

    // Colonne gauche (notes + community + ECOS)
    const follow = document.createElement('div'); follow.id = 'sdd-follow';

    const resizeHandle = document.createElement('div'); resizeHandle.id = 'notes-resize-handle';
    follow.appendChild(resizeHandle);

    const savedW = parseInt(GM_getValue('uness_notes_col_width', CFG.notesColWidth), 10);
    document.documentElement.style.setProperty('--notes-col', savedW + 'px');

    let _dragStartX = 0, _dragStartW = 0;
    resizeHandle.addEventListener('mousedown', e => {
      e.preventDefault(); _dragStartX = e.clientX; _dragStartW = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--notes-col'), 10) || savedW;
      resizeHandle.classList.add('dragging');
      const onMove = e => { const newW = Math.min(CFG.notesColMax, Math.max(CFG.notesColMin, _dragStartW + (e.clientX - _dragStartX))); document.documentElement.style.setProperty('--notes-col', newW + 'px'); };
      const onUp   = e => { resizeHandle.classList.remove('dragging'); GM_setValue('uness_notes_col_width', Math.min(CFG.notesColMax, Math.max(CFG.notesColMin, _dragStartW + (e.clientX - _dragStartX)))); document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
      document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
    });

    if (sddN != null) {
      const notesCollapsed = isCollapsedKey(`sdd_${sddN}_notes`);
      const currentStatus  = getStatus(sddN), doneDate = getDoneDate(sddN), doneDateStr = doneDate ? formatDoneDate(doneDate) : '';

      const notesHTML = `
        <div class="status-picker" id="status-picker">
          <button class="status-btn" data-st="todo">À faire</button>
          <button class="status-btn" data-st="inprogress">En cours</button>
          <button class="status-btn" data-st="done">✓ Faite</button>
        </div>
        <div id="wysiwyg-editor" style="margin-top:8px;border:1px solid var(--border);border-radius:var(--r-sm)"></div>
        <div id="wy-save-status"></div>`;

      const noteCard = card('Suivi & notes', '#4f46e5', notesHTML, 'notes');

      const headLabel = noteCard.querySelector('.sc-head-label');
      const dateBadge = document.createElement('span'); dateBadge.className = 'sc-head-date'; dateBadge.id = 'notes-date-badge';
      if (currentStatus === 'done' && doneDateStr) { dateBadge.textContent = doneDateStr; dateBadge.style.display = ''; } else dateBadge.style.display = 'none';
      headLabel.after(dateBadge);

      ensureToastAssets();

      const saveStatus = noteCard.querySelector('#wy-save-status');
      const picker = noteCard.querySelector('#status-picker');
      const editorRoot = noteCard.querySelector('#wysiwyg-editor');

      let editor = null;
      let _saveTimer = null;

      function applyStatus(st) {
        picker.querySelectorAll('.status-btn').forEach(btn => {
          btn.classList.remove('active-todo', 'active-inprogress', 'active-done');
          if (btn.dataset.st === st) btn.classList.add('active-' + st);
        });

        const dd = getDoneDate(sddN);
        const ddStr = dd ? formatDoneDate(dd) : '';
        const badge = noteCard.querySelector('#notes-date-badge');

        if (st === 'done' && ddStr) {
          badge.textContent = ddStr;
          badge.style.display = '';
        } else {
          badge.style.display = 'none';
        }
      }
      applyStatus(currentStatus);

      picker.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          haptic(btn.dataset.st === 'done' ? 'success' : 'selection');
          setStatus(sddN, btn.dataset.st);
          applyStatus(btn.dataset.st);
        });
      });

      function getEditorMarkdown() {
        if (!editor) return getNotes(sddN) || '';
        try {
          return editor.getMarkdown();
        } catch (_) {
          return getNotes(sddN) || '';
        }
      }

      function saveNow() {
        try {
          const md = getEditorMarkdown();
          setNotes(sddN, md);
          publicNoteMirrorPush(sddN, md).catch(() => {});
          saveStatus.textContent = 'Sauvé ✓';
          clearTimeout(saveNow._flash);
          saveNow._flash = setTimeout(() => {
            saveStatus.textContent = '';
          }, 1800);
        } catch (e) {
          console.error('[TOAST SAVE]', e);
          saveStatus.textContent = 'Erreur de sauvegarde';
          clearTimeout(saveNow._flash);
          saveNow._flash = setTimeout(() => {
            saveStatus.textContent = '';
          }, 2500);
        }
      }

      function scheduleSave() {
        saveStatus.textContent = '…';
        clearTimeout(_saveTimer);
        _saveTimer = setTimeout(saveNow, CFG.autosaveDelay);
      }

      const initialMd = getNotes(sddN) || '';

      try {
        editor = new toastui.Editor({
          el: editorRoot,
          initialValue: initialMd,
          initialEditType: 'wysiwyg',
          previewStyle: 'vertical',
          height: 'auto',
          usageStatistics: false,
          hideModeSwitch: true,
          toolbarItems: [
            ['heading', 'bold', 'italic', 'strike'],
            ['hr', 'quote'],
            ['ul', 'ol', 'task'],
            ['table', 'link'],
            ['code', 'codeblock']
          ]
        });

        editor.on('change', () => {
          scheduleSave();
        });

        // Tab / Shift+Tab : indent/dedent dans les listes
        editorRoot.addEventListener('keydown', e => {
          if (e.key === 'Tab') {
            const wwEl = editorRoot.querySelector('.toastui-editor-ww-container .ProseMirror');
            if (wwEl) {
              // Laisse ProseMirror gérer si on est dans une liste
              const sel = window.getSelection();
              if (sel && sel.rangeCount) {
                const node = sel.getRangeAt(0).startContainer;
                const inList = node.nodeType === 3
                  ? node.parentElement?.closest('li')
                  : node.closest?.('li');
                if (inList) {
                  e.preventDefault();
                  if (e.shiftKey) {
                    editor.exec('outdentList');
                  } else {
                    editor.exec('indentList');
                  }
                  return;
                }
              }
            }
          }
          const mod = e.ctrlKey || e.metaKey;
          if (mod && /^[sS]$/.test(e.key)) {
            e.preventDefault();
            saveNow();
          }
        });

        // Sécurité supplémentaire : sauvegarde quand on quitte la page / perd le focus
        window.addEventListener('beforeunload', () => {
          try { saveNow(); } catch (_) {}
        });

      } catch (e) {
        console.error('[TOAST INIT]', e);
        editorRoot.innerHTML = `
          <div style="border:1px solid var(--danger);background:var(--danger-light);color:var(--danger);padding:10px 12px;border-radius:var(--r-sm);font-size:12px">
            Impossible d’initialiser l’éditeur WYSIWYG.
          </div>
          <textarea id="toast-fallback-textarea" style="width:100%;min-height:220px;margin-top:8px;padding:10px 12px;border:1px solid var(--border);border-radius:var(--r-sm);font:12px ui-monospace,monospace">${escapeHtml(initialMd)}</textarea>
        `;

        const fallback = editorRoot.querySelector('#toast-fallback-textarea');
        fallback.addEventListener('input', () => {
          saveStatus.textContent = '…';
          clearTimeout(_saveTimer);
          _saveTimer = setTimeout(() => {
            const md = fallback.value;
            setNotes(sddN, md);
            publicNoteMirrorPush(sddN, md).catch(() => {});
            saveStatus.textContent = 'Sauvé ✓';
            clearTimeout(saveNow._flash);
            saveNow._flash = setTimeout(() => {
              saveStatus.textContent = '';
            }, 1800);
          }, CFG.autosaveDelay);
        });
      }

      follow.appendChild(noteCard);
    }

    // Notes communauté
    if (sddN != null) {
      const commCard = document.createElement('div'); commCard.className = 'sc'; commCard.dataset.key = 'community';
      const commCollapsed = isCollapsedKey(`sdd_${sddN}_community`); if (commCollapsed) commCard.classList.add('collapsed');
      commCard.innerHTML = `<div class="sc-head"><div class="sc-dot" style="background:linear-gradient(135deg,#6366f1,#d97706)"></div><span class="sc-head-label">Notes de la communauté</span><span style="margin-left:6px;font-size:10px;background:#eef2ff;color:#4f46e5;padding:2px 6px;border-radius:999px;font-weight:var(--fw-bold);letter-spacing:.5px">IA</span><span class="sc-toggle">▾</span></div><div class="sc-body" id="community-body"></div>`;
      follow.appendChild(commCard);
      const commBody = commCard.querySelector('#community-body');
      if (!commCollapsed) communityNotesLoad(sddN, sddName, commBody);
      commCard.querySelector('.sc-head').addEventListener('click', e => {
        if (e.target.closest('button,input,textarea,select,a,label')) return;
        const nowCollapsed = commCard.classList.toggle('collapsed');
        setCollapsedKey(`sdd_${sddN}_community`, nowCollapsed);
        if (!nowCollapsed && !commBody.innerHTML.trim()) communityNotesLoad(sddN, sddName, commBody);
      });
    }

    // Card ECOS
    if (sddN != null && cloudEnabled()) { buildEcosCard(sddN, sddName, follow); }

    bodyEl.appendChild(follow);
    bodyEl.appendChild(content);
    document.body.appendChild(bodyEl);

    // IA par attendu
    content.addEventListener('click', async e => {
      const btn = e.target.closest('.att-ai-btn'); if (!btn) return;
      const attId = btn.dataset.attId, attText = btn.dataset.attText;
      const panel = document.getElementById('panel-' + attId), panelRow = document.getElementById('panelrow-' + attId);
      if (!panel) return;
      const showPanel = () => { if (panelRow) panelRow.style.display = ''; panel.classList.add('visible'); btn.classList.add('active'); btn.textContent = '✦'; };
      const hidePanel = () => { if (panelRow) panelRow.style.display = 'none'; panel.classList.remove('visible'); btn.classList.remove('active'); btn.textContent = '✦'; };
      if (panel.classList.contains('visible')) { hidePanel(); return; }
      if (panel.innerHTML.trim()) { showPanel(); return; }
      btn.classList.add('loading'); btn.textContent = '…';
      if (panelRow) panelRow.style.display = '';
      try {
        const result = await callFunction('explainAttendant', { sddN, sddName, attId, attText });
        panel.innerHTML = communityMarkdownToHtml(result.explanation || '');
        showPanel();
      } catch (err) { panel.innerHTML = '<p style="color:var(--danger);font-size:var(--fs-small)">⚠ ' + escapeHtml(err.message) + '</p>'; showPanel(); }
      finally { btn.classList.remove('loading'); }
    });

    // Collapse cards
    document.querySelectorAll('#sdd-body .sc').forEach(sc => {
      const head = sc.querySelector('.sc-head'), key = sc.dataset.key;
      if (!head || !key || sddN == null) return;
      head.addEventListener('click', e => {
        if (e.target.closest('button,input,textarea,select,a,label')) return;
        if (key === 'community' || key === 'ecos') return;
        const collapsed = sc.classList.toggle('collapsed');
        setCollapsedKey(`sdd_${sddN}_${key}`, collapsed);
      });
    });
  }

})();

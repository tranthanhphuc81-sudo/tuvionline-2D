// @ts-nocheck
/* Trích nguyên văn từ legacy/lyso-toolkit.html (bản web đã kiểm chứng).
   Phase 1 của PROMPT-KIT sẽ chuyển sang TypeScript chặt chẽ — giữ cho tests/golden.test.ts luôn xanh. */
/* ===== Engine (Tu Vi Dau So) — lunar algorithm ported from Ho Ngoc Duc's public implementation
   (Astronomical Algorithms, Jean Meeus 1998) https://www.informatik.uni-leipzig.de/~duc/amlich/ ===== */
import { LySoUtil } from './util.js';
const window = { LySoUtil };

function INT(d){return Math.floor(d);}
const PI = Math.PI;
function jdFromDate(dd,mm,yy){
  let a=INT((14-mm)/12), y=yy+4800-a, m=mm+12*a-3;
  let jd=dd+INT((153*m+2)/5)+365*y+INT(y/4)-INT(y/100)+INT(y/400)-32045;
  if(jd<2299161) jd=dd+INT((153*m+2)/5)+365*y+INT(y/4)-32083;
  return jd;
}
function jdToDate(jd){
  let a,b,c;
  if(jd>2299160){ a=jd+32044; b=INT((4*a+3)/146097); c=a-INT((b*146097)/4); }
  else { b=0; c=jd+32082; }
  let d=INT((4*c+3)/1461), e=c-INT((1461*d)/4), m=INT((5*e+2)/153);
  let day=e-INT((153*m+2)/5)+1, month=m+3-12*INT(m/10), year=b*100+d-4800+INT(m/10);
  return [day,month,year];
}
function NewMoon(k){
  let T=k/1236.85, T2=T*T, T3=T2*T, dr=PI/180;
  let Jd1=2415020.75933+29.53058868*k+0.0001178*T2-0.000000155*T3;
  Jd1+=0.00033*Math.sin((166.56+132.87*T-0.009173*T2)*dr);
  let M=359.2242+29.10535608*k-0.0000333*T2-0.00000347*T3;
  let Mpr=306.0253+385.81691806*k+0.0107306*T2+0.00001236*T3;
  let F=21.2964+390.67050646*k-0.0016528*T2-0.00000239*T3;
  let C1=(0.1734-0.000393*T)*Math.sin(M*dr)+0.0021*Math.sin(2*dr*M);
  C1-=0.4068*Math.sin(Mpr*dr); C1+=0.0161*Math.sin(dr*2*Mpr); C1-=0.0004*Math.sin(dr*3*Mpr);
  C1+=0.0104*Math.sin(dr*2*F); C1-=0.0051*Math.sin(dr*(M+Mpr));
  C1-=0.0074*Math.sin(dr*(M-Mpr)); C1+=0.0004*Math.sin(dr*(2*F+M));
  C1-=0.0004*Math.sin(dr*(2*F-M)); C1-=0.0006*Math.sin(dr*(2*F+Mpr));
  C1+=0.0010*Math.sin(dr*(2*F-Mpr)); C1+=0.0005*Math.sin(dr*(2*Mpr+M));
  let deltat=(T< -11)?(0.001+0.000839*T+0.0002261*T2-0.00000845*T3-0.000000081*T*T3):(-0.000278+0.000265*T+0.000262*T2);
  return Jd1+C1-deltat;
}
function SunLongitude(jdn){
  let T=(jdn-2451545.0)/36525, T2=T*T, dr=PI/180;
  let M=357.52910+35999.05030*T-0.0001559*T2-0.00000048*T*T2;
  let L0=280.46645+36000.76983*T+0.0003032*T2;
  let DL=(1.914600-0.004817*T-0.000014*T2)*Math.sin(dr*M);
  DL+=(0.019993-0.000101*T)*Math.sin(dr*2*M)+0.000290*Math.sin(dr*3*M);
  let L=(L0+DL)*dr; L-=PI*2*INT(L/(PI*2)); return L;
}
function getSunLongitude(dayNumber,timeZone){ return INT(SunLongitude(dayNumber-0.5-timeZone/24)/PI*6); }
function getNewMoonDay(k,timeZone){ return INT(NewMoon(k)+0.5+timeZone/24); }
function getLunarMonth11(yy,timeZone){
  let off=jdFromDate(31,12,yy)-2415021, k=INT(off/29.530588853), nm=getNewMoonDay(k,timeZone);
  if(getSunLongitude(nm,timeZone)>=9) nm=getNewMoonDay(k-1,timeZone);
  return nm;
}
function getLeapMonthOffset(a11,timeZone){
  let k=INT((a11-2415021.076998695)/29.530588853+0.5), last=0, i=1;
  let arc=getSunLongitude(getNewMoonDay(k+i,timeZone),timeZone);
  do{ last=arc; i++; arc=getSunLongitude(getNewMoonDay(k+i,timeZone),timeZone); } while(arc!=last && i<14);
  return i-1;
}
function convertSolar2Lunar(dd,mm,yy,timeZone){
  let dayNumber=jdFromDate(dd,mm,yy), k=INT((dayNumber-2415021.076998695)/29.530588853);
  let monthStart=getNewMoonDay(k+1,timeZone);
  if(monthStart>dayNumber) monthStart=getNewMoonDay(k,timeZone);
  let a11=getLunarMonth11(yy,timeZone), b11=a11, lunarYear;
  if(a11>=monthStart){ lunarYear=yy; a11=getLunarMonth11(yy-1,timeZone); }
  else { lunarYear=yy+1; b11=getLunarMonth11(yy+1,timeZone); }
  let lunarDay=dayNumber-monthStart+1, diff=INT((monthStart-a11)/29), lunarLeap=0, lunarMonth=diff+11;
  if(b11-a11>365){ let leapMonthDiff=getLeapMonthOffset(a11,timeZone);
    if(diff>=leapMonthDiff){ lunarMonth=diff+10; if(diff==leapMonthDiff) lunarLeap=1; } }
  if(lunarMonth>12) lunarMonth-=12;
  if(lunarMonth>=11 && diff<4) lunarYear-=1;
  return [lunarDay,lunarMonth,lunarYear,lunarLeap];
}
function convertLunar2Solar(lunarDay,lunarMonth,lunarYear,lunarLeap,timeZone){
  let a11,b11;
  if(lunarMonth<11){ a11=getLunarMonth11(lunarYear-1,timeZone); b11=getLunarMonth11(lunarYear,timeZone); }
  else { a11=getLunarMonth11(lunarYear,timeZone); b11=getLunarMonth11(lunarYear+1,timeZone); }
  let k=INT(0.5+(a11-2415021.076998695)/29.530588853), off=lunarMonth-11; if(off<0) off+=12;
  if(b11-a11>365){ let leapOff=getLeapMonthOffset(a11,timeZone), leapMonth=leapOff-2; if(leapMonth<0) leapMonth+=12;
    if(lunarLeap!=0 && lunarMonth!=leapMonth) return [0,0,0];
    else if(lunarLeap!=0 || off>=leapOff) off+=1; }
  let monthStart=getNewMoonDay(k+off,timeZone);
  return jdToDate(monthStart+lunarDay-1);
}

const CAN=["Giáp","Ất","Bính","Đinh","Mậu","Kỷ","Canh","Tân","Nhâm","Quý"];
const CHI=["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];
const CUNG_NAME=["Mệnh","Phụ Mẫu","Phúc Đức","Điền Trạch","Quan Lộc","Nô Bộc","Thiên Di","Tật Ách","Tài Bạch","Tử Tức","Phu Thê","Huynh Đệ"];
const HOUR_RANGES=["23:00–00:59","01:00–02:59","03:00–04:59","05:00–06:59","07:00–08:59","09:00–10:59","11:00–12:59","13:00–14:59","15:00–16:59","17:00–18:59","19:00–20:59","21:00–22:59"];
const DAN=2;
function mod(n,m){ return ((n%m)+m)%m; }
function dayCanChiIndex(dd,mm,yy){ const jd=jdFromDate(dd,mm,yy); const idx=mod(jd+49,60); return {can:idx%10, chi:idx%12}; }
function yearCanChiIndex(lunarYear){ return {can:mod(lunarYear-4,10), chi:mod(lunarYear-4,12)}; }
function ngHoDonDanCan(yearCanIdx){ const t={0:2,5:2,1:4,6:4,2:6,7:6,3:8,8:8,4:0,9:0}; return t[yearCanIdx]; }
function nguThuDonTyCan(dayCanIdx){ const t={0:0,5:0,1:2,6:2,2:4,7:4,3:6,8:6,4:8,9:8}; return t[dayCanIdx]; }
function canOfPalaceFromDan(yearCanIdx,steps){ return mod(ngHoDonDanCan(yearCanIdx)+steps,10); }
const NAPAM=[
 [0,0,"Kim","Hải Trung Kim"],[2,2,"Hoả","Lư Trung Hoả"],[4,4,"Mộc","Đại Lâm Mộc"],
 [6,6,"Thổ","Lộ Bàng Thổ"],[8,8,"Kim","Kiếm Phong Kim"],[0,10,"Hoả","Sơn Đầu Hoả"],
 [2,0,"Thuỷ","Giản Hạ Thuỷ"],[4,2,"Thổ","Thành Đầu Thổ"],[6,4,"Kim","Bạch Lạp Kim"],
 [8,6,"Mộc","Dương Liễu Mộc"],[0,8,"Thuỷ","Tuyền Trung Thuỷ"],[2,10,"Thổ","Ốc Thượng Thổ"],
 [4,0,"Hoả","Tích Lịch Hoả"],[6,2,"Mộc","Tùng Bách Mộc"],[8,4,"Thuỷ","Trường Lưu Thuỷ"],
 [0,6,"Kim","Sa Trung Kim"],[2,8,"Hoả","Sơn Hạ Hoả"],[4,10,"Mộc","Bình Địa Mộc"],
 [6,0,"Thổ","Bích Thượng Thổ"],[8,2,"Kim","Kim Bạc Kim"],[0,4,"Hoả","Phú Đăng Hoả"],
 [2,6,"Thuỷ","Thiên Hà Thuỷ"],[4,8,"Thổ","Đại Trạch Thổ"],[6,10,"Kim","Thoa Xuyến Kim"],
 [8,0,"Mộc","Tang Đố Mộc"],[0,2,"Thuỷ","Đại Khê Thuỷ"],[2,4,"Thổ","Sa Trung Thổ"],
 [4,6,"Hoả","Thiên Thượng Hoả"],[6,8,"Mộc","Thạch Lựu Mộc"],[8,10,"Thuỷ","Đại Hải Thuỷ"]
];
function napAmLookup(canIdx,chiIdx){
  for(const row of NAPAM){ const [c0,h0]=row;
    if(c0===canIdx && h0===chiIdx) return row;
    if(mod(c0+1,10)===canIdx && mod(h0+1,12)===chiIdx) return row; }
  return null;
}
const CUC_SO={"Thuỷ":2,"Mộc":3,"Kim":4,"Thổ":5,"Hoả":6};
const CUC_TEN={"Thuỷ":"Thuỷ Nhị Cục","Mộc":"Mộc Tam Cục","Kim":"Kim Tứ Cục","Thổ":"Thổ Ngũ Cục","Hoả":"Hoả Lục Cục"};

function calcChart(input){
  const TZ = input.tz || (window.LySoUtil ? window.LySoUtil.lunarTzForSolarYear(input.yy) : 7);
  const [lDay,lMonth,lYear,lLeap]=convertSolar2Lunar(input.dd,input.mm,input.yy,TZ);
  const gioIdx=input.hourBranchIdx;
  const yearCC=yearCanChiIndex(lYear);
  const dayCC=dayCanChiIndex(input.dd,input.mm,input.yy);
  const gioCanIdx=mod(nguThuDonTyCan(dayCC.can)+gioIdx,10);
  const isDuongCan=(yearCC.can%2===0);
  const isDuongNam = input.gender==='M' && isDuongCan;
  const isAmNu = input.gender==='F' && !isDuongCan;
  const thuanDaiHan = isDuongNam || isAmNu;
  function stepFromDan1(oneIdx){ return mod(DAN+(oneIdx-1),12); }
  let menhStep = lMonth - gioIdx;
  while(menhStep<=0) menhStep+=12; while(menhStep>12) menhStep-=12;
  const menhChi = stepFromDan1(menhStep);
  let thanStep = lMonth + gioIdx;
  while(thanStep<=0) thanStep+=12; while(thanStep>12) thanStep-=12;
  const thanChi = stepFromDan1(thanStep);
  const menhStepsFromDan = mod(menhChi-DAN,12);
  const menhCanIdx = canOfPalaceFromDan(yearCC.can, menhStepsFromDan);
  const napAm = napAmLookup(menhCanIdx, menhChi);
  const cucHanh = napAm[2], cucSo = CUC_SO[cucHanh], cucTen = CUC_TEN[cucHanh];
  const ngay = lDay;
  const aBorrow = mod(cucSo - mod(ngay,cucSo), cucSo);
  const b = (ngay+aBorrow)/cucSo;
  let tuViChi = stepFromDan1(b);
  if(aBorrow!==0){ if(aBorrow%2===1) tuViChi=mod(tuViChi-aBorrow,12); else tuViChi=mod(tuViChi+aBorrow,12); }
  const stars={};
  function addStar(chiIdx,name){ (stars[chiIdx]=stars[chiIdx]||[]).push(name); }
  addStar(tuViChi,"Tử Vi");
  addStar(mod(tuViChi-1,12),"Thiên Cơ"); addStar(mod(tuViChi-3,12),"Thái Dương");
  addStar(mod(tuViChi-4,12),"Vũ Khúc"); addStar(mod(tuViChi-5,12),"Thiên Đồng");
  addStar(mod(tuViChi-8,12),"Liêm Trinh");
  const thienPhuChi = mod(4-tuViChi,12);
  addStar(thienPhuChi,"Thiên Phủ");
  addStar(mod(thienPhuChi+1,12),"Thái Âm"); addStar(mod(thienPhuChi+2,12),"Tham Lang");
  addStar(mod(thienPhuChi+3,12),"Cự Môn"); addStar(mod(thienPhuChi+4,12),"Thiên Tướng");
  addStar(mod(thienPhuChi+5,12),"Thiên Lương"); addStar(mod(thienPhuChi+6,12),"Thất Sát");
  addStar(mod(thienPhuChi+10,12),"Phá Quân");

  const TS_NAMES=["Trường Sinh","Mộc Dục","Quan Đới","Lâm Quan","Đế Vượng","Suy","Bệnh","Tử","Mộ","Tuyệt","Thai","Dưỡng"];
  // Trường Sinh của Cục: Hoả khởi Dần, Kim khởi Tỵ, Mộc khởi Hợi, Thuỷ và Thổ khởi Thân
  const TS_START={"Hoả":2,"Kim":5,"Mộc":11,"Thuỷ":8,"Thổ":8};
  const tsStart=TS_START[cucHanh];
  const truongSinh={};
  for(let i=0;i<12;i++){ const c=thuanDaiHan? mod(tsStart+i,12) : mod(tsStart-i,12); truongSinh[c]=TS_NAMES[i]; }

  const TT_NAMES=["Thái Tuế","Thiếu Dương","Tang Môn","Thiếu Âm","Quan Phù","Tử Phù","Tuế Phá","Long Đức","Bạch Hổ","Phúc Đức","Điếu Khách","Trực Phù"];
  const thaiTue={}; for(let i=0;i<12;i++) thaiTue[mod(yearCC.chi+i,12)]=TT_NAMES[i];

  const LOC_TON_BY_CAN={0:2,1:3,2:5,3:6,4:5,5:6,6:8,7:9,8:11,9:0};
  const locTonChi=LOC_TON_BY_CAN[yearCC.can];
  const kinhDuongChi=mod(locTonChi+1,12), daLaChi=mod(locTonChi-1,12);

  function thienMaChi(yc){ if([8,0,4].includes(yc)) return 2; if([2,6,10].includes(yc)) return 8; if([5,9,1].includes(yc)) return 11; return 5; }
  const thienMa=thienMaChi(yearCC.chi);

  const KHOI_VIET_BY_CAN={0:[1,7],4:[1,7],6:[1,7],1:[0,8],5:[0,8],2:[11,9],3:[11,9],8:[3,5],9:[3,5],7:[2,6]};
  const [khoiChi,vietChi]=KHOI_VIET_BY_CAN[yearCC.can];

  const taPhuChi=mod(4+(lMonth-1),12), huuBatChi=mod(10-(lMonth-1),12);
  const vanKhucChi=mod(4+gioIdx,12), vanXuongChi=mod(10-gioIdx,12);
  const diaKiepChi=mod(11+gioIdx,12), diaKhongChi=mod(11-gioIdx,12);

  const phuTinh={};
  function addPhu(c,n){ (phuTinh[c]=phuTinh[c]||[]).push(n); }
  addPhu(locTonChi,"Lộc Tồn"); addPhu(kinhDuongChi,"Kình Dương"); addPhu(daLaChi,"Đà La");
  addPhu(thienMa,"Thiên Mã"); addPhu(khoiChi,"Thiên Khôi"); addPhu(vietChi,"Thiên Việt");
  addPhu(taPhuChi,"Tả Phù"); addPhu(huuBatChi,"Hữu Bật");
  addPhu(vanXuongChi,"Văn Xương"); addPhu(vanKhucChi,"Văn Khúc");
  addPhu(diaKhongChi,"Địa Không"); addPhu(diaKiepChi,"Địa Kiếp");

  const TUHOA=[
   ["Liêm Trinh","Phá Quân","Vũ Khúc","Thái Dương"],["Thiên Cơ","Thiên Lương","Tử Vi","Thái Âm"],
   ["Thiên Đồng","Thiên Cơ","Văn Xương","Liêm Trinh"],["Thái Âm","Thiên Đồng","Thiên Cơ","Cự Môn"],
   ["Tham Lang","Thái Âm","Hữu Bật","Thiên Cơ"],["Vũ Khúc","Tham Lang","Thiên Lương","Văn Khúc"],
   ["Thái Dương","Vũ Khúc","Thái Âm","Thiên Đồng"],["Cự Môn","Thái Dương","Văn Khúc","Văn Xương"],
   ["Thiên Lương","Tử Vi","Tả Phù","Vũ Khúc"],["Phá Quân","Cự Môn","Thái Âm","Tham Lang"]
  ];
  const tuHoaBanMenh={loc:TUHOA[yearCC.can][0],quyen:TUHOA[yearCC.can][1],khoa:TUHOA[yearCC.can][2],ky:TUHOA[yearCC.can][3]};

  const daiHan=[];
  for(let i=0;i<12;i++){ const c=thuanDaiHan? mod(menhChi+i,12) : mod(menhChi-i,12);
    daiHan.push({chi:c, tuoiStart:cucSo+i*10, tuoiEnd:cucSo+i*10+9, cungTen:CUNG_NAME[mod(c-menhChi,12)]}); }

  function tieuHanStart(yc){ if([2,6,10].includes(yc)) return 4; if([8,0,4].includes(yc)) return 10; if([5,9,1].includes(yc)) return 7; return 1; }
  const tieuHanStartChi=tieuHanStart(yearCC.chi);
  const thuanTieuHan = input.gender==='M';

  return { lunar:{day:lDay,month:lMonth,year:lYear,leap:lLeap}, yearCC, dayCC, gioCanIdx, gioChiIdx:gioIdx,
    isDuongCan, thuanDaiHan, menhChi, thanChi, menhCanIdx, cucHanh, cucSo, cucTen, napAmTen:napAm[3],
    tuViChi, thienPhuChi, stars, phuTinh, truongSinh, thaiTue, locTonChi, kinhDuongChi, daLaChi, thienMa,
    khoiChi, vietChi, taPhuChi, huuBatChi, vanXuongChi, vanKhucChi, diaKhongChi, diaKiepChi,
    tuHoaBanMenh, daiHan, tieuHanStartChi, thuanTieuHan, TUHOA };
}

export const TuViEngine = { convertSolar2Lunar, convertLunar2Solar, jdFromDate, CAN, CHI, CUNG_NAME, HOUR_RANGES, mod, calcChart, yearCanChiIndex };
export default TuViEngine;

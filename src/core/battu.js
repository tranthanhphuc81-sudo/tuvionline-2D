// @ts-nocheck
/* Trích nguyên văn từ legacy/lyso-toolkit.html (bản web đã kiểm chứng).
   Phase 1 của PROMPT-KIT sẽ chuyển sang TypeScript chặt chẽ — giữ cho tests/golden.test.ts luôn xanh. */
import { LySoUtil } from './util.js';
const window = { LySoUtil };

/* ===== Lunar / solar-term engine (Meeus algorithms, same base as amlich) ===== */
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
function findSolarTerm(jdGuess, targetDeg, tz){
  const targetRad = targetDeg*PI/180;
  let lo = jdGuess-6, hi = jdGuess+6;
  function f(jd){ let L = SunLongitude(jd - tz/24); let diff = L - targetRad;
    while(diff> PI) diff-=2*PI; while(diff<-PI) diff+=2*PI; return diff; }
  for(let i=0;i<60;i++){ let mid=(lo+hi)/2; if(f(lo)*f(mid)<=0) hi=mid; else lo=mid; }
  return (lo+hi)/2;
}

/* ===== Bat Tu core ===== */
const CAN=["Giáp","Ất","Bính","Đinh","Mậu","Kỷ","Canh","Tân","Nhâm","Quý"];
const CHI=["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];
const HANH5=["Mộc","Hoả","Thổ","Kim","Thuỷ"];
const CAN_HANH=[0,0,1,1,2,2,3,3,4,4];
const CHI_HANH=[4,2,0,0,2,1,1,2,3,3,2,4]; // Ty=Thuy,Suu=Tho,Dan=Moc,Mao=Moc,Thin=Tho,Ty=Hoa,Ngo=Hoa,Mui=Tho,Than=Kim,Dau=Kim,Tuat=Tho,Hoi=Thuy
const HOUR_RANGES=["23:00–00:59","01:00–02:59","03:00–04:59","05:00–06:59","07:00–08:59","09:00–10:59","11:00–12:59","13:00–14:59","15:00–16:59","17:00–18:59","19:00–20:59","21:00–22:59"];
// Representative clock hour for each 2-hour gio, expressed as an OFFSET FROM NOON in hours
// (jdFromDate's integer JDN corresponds to local noon in this codebase's convention — see findSolarTerm/getSunLongitude usage)
const HOUR_OFFSET_FROM_NOON=[-12,-10,-8,-6,-4,-2,0,2,4,6,8,10];
const DAN=2;
function mod(n,m){ return ((n%m)+m)%m; }
function dayCanChiIndex(dd,mm,yy){ const jd=jdFromDate(dd,mm,yy); const idx=mod(jd+49,60); return {can:idx%10, chi:idx%12}; }
function yearCanChiIndex(y){ return {can:mod(y-4,10), chi:mod(y-4,12)}; }
function ngHoDonDanCan(yearCanIdx){ const t={0:2,5:2,1:4,6:4,2:6,7:6,3:8,8:8,4:0,9:0}; return t[yearCanIdx]; }
function nguThuDonTyCan(dayCanIdx){ const t={0:0,5:0,1:2,6:2,2:4,7:4,3:6,8:6,4:8,9:8}; return t[dayCanIdx]; }
function canOfChiFromDan(yearCanIdx, chiIdx){ return mod(ngHoDonDanCan(yearCanIdx)+mod(chiIdx-DAN,12),10); }
function canOfHourFromTy(dayCanIdx, hourChiIdx){ return mod(nguThuDonTyCan(dayCanIdx)+hourChiIdx,10); }

const TIET = [ // name, targetDeg, chiIdx, guessMM, guessDD
  ["Tiểu Hàn",285,1,1,6],["Lập Xuân",315,2,2,4],["Kinh Trập",345,3,3,6],
  ["Thanh Minh",15,4,4,5],["Lập Hạ",45,5,5,6],["Mang Chủng",75,6,6,6],
  ["Tiểu Thử",105,7,7,7],["Lập Thu",135,8,8,8],["Bạch Lộ",165,9,9,8],
  ["Hàn Lộ",195,10,10,8],["Lập Đông",225,11,11,7],["Đại Tuyết",255,0,12,7],
];
function tietBoundariesForYear(yy, tz){
  return TIET.map(([name,deg,chiIdx,mm,dd])=>({name, chiIdx, jd: findSolarTerm(jdFromDate(dd,mm,yy), deg, tz)}));
}

const TANG_CAN = {
 0:[[9,'Bản khí']], 1:[[5,'Bản khí'],[9,'Trung khí'],[7,'Dư khí']],
 2:[[0,'Bản khí'],[2,'Trung khí'],[4,'Dư khí']], 3:[[1,'Bản khí']],
 4:[[4,'Bản khí'],[1,'Trung khí'],[9,'Dư khí']], 5:[[2,'Bản khí'],[6,'Trung khí'],[4,'Dư khí']],
 6:[[3,'Bản khí'],[5,'Trung khí']], 7:[[5,'Bản khí'],[3,'Trung khí'],[1,'Dư khí']],
 8:[[6,'Bản khí'],[8,'Trung khí'],[4,'Dư khí']], 9:[[7,'Bản khí']],
 10:[[4,'Bản khí'],[7,'Trung khí'],[3,'Dư khí']], 11:[[8,'Bản khí'],[0,'Trung khí']],
};
const THAP_THAN = {
 same:{same:'Tỷ Kiên',diff:'Kiếp Tài'}, taSinh:{same:'Thực Thần',diff:'Thương Quan'},
 taKhac:{same:'Thiên Tài',diff:'Chính Tài'}, khacTa:{same:'Thất Sát',diff:'Chính Quan'},
 sinhTa:{same:'Thiên Ấn',diff:'Chính Ấn'},
};
const GIUP_THAN = ['Tỷ Kiên','Kiếp Tài','Thiên Ấn','Chính Ấn'];
function thapThan(nhatChuCan, targetCan){
  const ne=Math.floor(nhatChuCan/2), te=Math.floor(targetCan/2);
  const parity=(nhatChuCan%2===targetCan%2)?'same':'diff';
  let rel;
  if(te===ne) rel='same'; else if(te===mod(ne+1,5)) rel='taSinh';
  else if(te===mod(ne+2,5)) rel='taKhac'; else if(te===mod(ne+3,5)) rel='khacTa'; else rel='sinhTa';
  return THAP_THAN[rel][parity];
}
// Vuong-Tuong-Huu-Tu-Tu theo mua (Chi thang)
const VTHTT_ORDER=["Vượng","Tướng","Hưu","Tù","Tử"];
function seasonHanh(monthChiIdx){
  if([2,3].includes(monthChiIdx)) return 0; // Xuan->Moc
  if([5,6].includes(monthChiIdx)) return 1; // Ha->Hoa
  if([8,9].includes(monthChiIdx)) return 3; // Thu->Kim
  if([11,0].includes(monthChiIdx)) return 4; // Dong->Thuy
  return 2; // Tu quy -> Tho
}
function calcChart(input){
  const TZ=7;
  const { gender, dd, mm, yy, hourChiIdx } = input;
  const lunar = convertSolar2Lunar(dd,mm,yy, window.LySoUtil ? window.LySoUtil.lunarTzForSolarYear(yy) : TZ);
  // Nam tru: theo tiet Lap Xuan
  const jdLX_thisYear = findSolarTerm(jdFromDate(4,2,yy), 315, TZ);
  const inputJD = jdFromDate(dd,mm,yy) + HOUR_OFFSET_FROM_NOON[hourChiIdx]/24;
  const tietYear = (inputJD >= jdLX_thisYear) ? yy : yy-1;
  const yearCC = yearCanChiIndex(tietYear);
  // Thang tru: tim doan tiet chua inputJD
  const allTiet = [...tietBoundariesForYear(yy-1,TZ), ...tietBoundariesForYear(yy,TZ), ...tietBoundariesForYear(yy+1,TZ)]
    .sort((a,b)=>a.jd-b.jd);
  let monthChiIdx=null;
  for(let i=0;i<allTiet.length-1;i++){ if(inputJD>=allTiet[i].jd && inputJD<allTiet[i+1].jd){ monthChiIdx=allTiet[i].chiIdx; break; } }
  const monthCanIdx = canOfChiFromDan(yearCC.can, monthChiIdx);
  // Ngay tru
  const dayCC = dayCanChiIndex(dd,mm,yy);
  const nhatChu = dayCC.can;
  // Gio tru
  const gioCanIdx = canOfHourFromTy(dayCC.can, hourChiIdx);

  const pillars = [
    { role:'Trụ Năm', can:yearCC.can, chi:yearCC.chi },
    { role:'Trụ Tháng', can:monthCanIdx, chi:monthChiIdx },
    { role:'Trụ Ngày', can:dayCC.can, chi:dayCC.chi, isNhatChu:true },
    { role:'Trụ Giờ', can:gioCanIdx, chi:hourChiIdx },
  ];

  const isDuongCan = (yearCC.can%2===0);
  const thuanDaiVan = (gender==='M') === isDuongCan; // Duong Nam or Am Nu -> thuan

  // Dai Van list
  function cycleIdx(c,ch){ for(let i=0;i<60;i++){ if(i%10===c && i%12===ch) return i; } return -1; }
  function fromCycle(i){ i=mod(i,60); return {can:i%10, chi:i%12}; }
  const startCycle = cycleIdx(monthCanIdx, monthChiIdx);
  const daiVan = [];
  for(let i=0;i<9;i++){ const idx = thuanDaiVan? startCycle+i : startCycle-i; daiVan.push(fromCycle(idx)); }

  // khoi van tuoi: dem so ngay den tiet lien ke (thuan: tiet ke tiep; nghich: tiet lien truoc)
  let khoiVanDiffDays;
  if(thuanDaiVan){
    const next = allTiet.find(t=>t.jd> inputJD);
    khoiVanDiffDays = next.jd - inputJD;
  } else {
    const prevArr = allTiet.filter(t=>t.jd<= inputJD);
    const prev = prevArr[prevArr.length-1];
    khoiVanDiffDays = inputJD - prev.jd;
  }
  const totalMonths = khoiVanDiffDays*4;
  let khoiVanYears = Math.floor(totalMonths/12);
  let khoiVanMonths = Math.round(totalMonths - khoiVanYears*12);
  if(khoiVanMonths>=12){ khoiVanMonths=0; khoiVanYears+=1; }

  return { lunar, yearCC, monthCanIdx, monthChiIdx, dayCC, gioCanIdx, hourChiIdx, nhatChu,
    pillars, isDuongCan, thuanDaiVan, daiVan, khoiVanYears, khoiVanMonths, khoiVanDiffDays, tietYear };
}

export const BatTuEngine = { CAN, CHI, HANH5, CAN_HANH, CHI_HANH, HOUR_RANGES, TANG_CAN, THAP_THAN, GIUP_THAN,
  mod, thapThan, seasonHanh, VTHTT_ORDER, calcChart, yearCanChiIndex, convertSolar2Lunar, convertLunar2Solar };
export default BatTuEngine;

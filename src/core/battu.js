// @ts-nocheck
/* Trích nguyên văn từ legacy/lyso-toolkit.html (bản web đã kiểm chứng).
   Phase 1 của PROMPT-KIT sẽ chuyển sang TypeScript chặt chẽ — giữ cho tests/golden.test.ts luôn xanh. */

import { jdFromDate, convertSolar2Lunar, convertLunar2Solar, findSolarTerm, TIET, tietBoundariesForYear, lunarTzForSolarYear } from './calendar';
const window = { LySoUtil: { lunarTzForSolarYear } };
import { CAN, CHI, HOUR_RANGES, mod, dayCanChiIndex, yearCanChiIndex, canOfChiFromDan, canOfHourFromTy, cycleIdx, fromCycle } from './canchi';
/* ===== Bat Tu core ===== */
const HANH5=["Mộc","Hoả","Thổ","Kim","Thuỷ"];
const CAN_HANH=[0,0,1,1,2,2,3,3,4,4];
const CHI_HANH=[4,2,0,0,2,1,1,2,3,3,2,4]; // Ty=Thuy,Suu=Tho,Dan=Moc,Mao=Moc,Thin=Tho,Ty=Hoa,Ngo=Hoa,Mui=Tho,Than=Kim,Dau=Kim,Tuat=Tho,Hoi=Thuy
// Representative clock hour for each 2-hour gio, expressed as an OFFSET FROM NOON in hours
// (jdFromDate's integer JDN corresponds to local noon in this codebase's convention — see findSolarTerm/getSunLongitude usage)
const HOUR_OFFSET_FROM_NOON=[-12,-10,-8,-6,-4,-2,0,2,4,6,8,10];

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

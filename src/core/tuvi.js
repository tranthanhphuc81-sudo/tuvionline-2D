// @ts-nocheck
/* Trích nguyên văn từ legacy/lyso-toolkit.html (bản web đã kiểm chứng).
   Phase 1 của PROMPT-KIT sẽ chuyển sang TypeScript chặt chẽ — giữ cho tests/golden.test.ts luôn xanh. */
/* ===== Engine (Tu Vi Dau So) — lunar algorithm ported from Ho Ngoc Duc's public implementation
   (Astronomical Algorithms, Jean Meeus 1998) https://www.informatik.uni-leipzig.de/~duc/amlich/ ===== */
import { jdFromDate, convertSolar2Lunar, convertLunar2Solar, lunarTzForSolarYear } from './calendar';
const window = { LySoUtil: { lunarTzForSolarYear } };
import { CAN, CHI, HOUR_RANGES, DAN, mod, dayCanChiIndex, yearCanChiIndex, ngHoDonDanCan, nguThuDonTyCan, napAmLookup } from './canchi';

const CUNG_NAME=["Mệnh","Phụ Mẫu","Phúc Đức","Điền Trạch","Quan Lộc","Nô Bộc","Thiên Di","Tật Ách","Tài Bạch","Tử Tức","Phu Thê","Huynh Đệ"];
function canOfPalaceFromDan(yearCanIdx,steps){ return mod(ngHoDonDanCan(yearCanIdx)+steps,10); }
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

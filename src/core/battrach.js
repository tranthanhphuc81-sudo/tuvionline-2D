// @ts-nocheck
/* Trích nguyên văn từ legacy/lyso-toolkit.html (bản web đã kiểm chứng).
   Phase 1 của PROMPT-KIT sẽ chuyển sang TypeScript chặt chẽ — giữ cho tests/golden.test.ts luôn xanh. */
import { LySoUtil } from './util.js';
const window = { LySoUtil };

/* ===== Solar-term engine (Meeus algorithms, same validated base as Phần 2/3 tools) — used only to find the exact Lập Xuân instant for each year ===== */
function INT(d){return Math.floor(d);}
const PI = Math.PI;
function jdFromDate(dd,mm,yy){
  let a=INT((14-mm)/12), y=yy+4800-a, m=mm+12*a-3;
  let jd=dd+INT((153*m+2)/5)+365*y+INT(y/4)-INT(y/100)+INT(y/400)-32045;
  if(jd<2299161) jd=dd+INT((153*m+2)/5)+365*y+INT(y/4)-32083;
  return jd;
}
function SunLongitude(jdn){
  let T=(jdn-2451545.0)/36525, T2=T*T, dr=PI/180;
  let M=357.52910+35999.05030*T-0.0001559*T2-0.00000048*T*T2;
  let L0=280.46645+36000.76983*T+0.0003032*T2;
  let DL=(1.914600-0.004817*T-0.000014*T2)*Math.sin(dr*M);
  DL+=(0.019993-0.000101*T)*Math.sin(dr*2*M)+0.000290*Math.sin(dr*3*M);
  let L=(L0+DL)*dr; L-=PI*2*INT(L/(PI*2)); return L;
}
function findSolarTerm(jdGuess, targetDeg, tz){
  const targetRad = targetDeg*PI/180;
  let lo = jdGuess-6, hi = jdGuess+6;
  function f(jd){ let L = SunLongitude(jd - tz/24); let diff = L - targetRad;
    while(diff> PI) diff-=2*PI; while(diff<-PI) diff+=2*PI; return diff; }
  for(let i=0;i<60;i++){ let mid=(lo+hi)/2; if(f(lo)*f(mid)<=0) hi=mid; else lo=mid; }
  return (lo+hi)/2;
}
function lapXuanJD(year, tz){ return findSolarTerm(jdFromDate(4,2,year), 315, tz); }
// Inverse of jdFromDate (integer JD -> {dd,mm,yy}), standard Gregorian algorithm, for display purposes only.
function jdToDate(jd){
  jd = Math.round(jd);
  let a = jd + 32044, b = INT((4*a+3)/146097), c = a - INT((146097*b)/4);
  let d0 = INT((4*c+3)/1461), e = c - INT((1461*d0)/4), m0 = INT((5*e+2)/153);
  const dd = e - INT((153*m0+2)/5) + 1;
  const mm = m0 + 3 - 12*INT(m0/10);
  const yy = 100*b + d0 - 4800 + INT(m0/10);
  return {dd, mm, yy};
}
// Returns the "năm lý số" to use for Mệnh Quái: if birth date falls before that year's tiết Lập Xuân, use the previous year (mục 2.2 Phần 4).
function lySoYear(dd,mm,yy,tz){
  const birthJD = jdFromDate(dd,mm,yy);
  const lx = lapXuanJD(yy, tz);
  return { year: birthJD < lx ? yy-1 : yy, beforeLapXuan: birthJD < lx };
}

/* ===== Bát Trạch core engine (verified against Phần 4 document, Chương 2/4/10) ===== */
function digitSum(n){ while(n>=10){ n = String(n).split("").reduce((a,d)=>a+ +d,0);} return n; }
function menhQuai(year, gender){
  const last2 = ((year % 100)+100)%100;
  const S = digitSum(last2);
  let num;
  if(year < 2000){ num = gender==="M" ? 10-S : 5+S; }
  else { num = gender==="M" ? 9-S : 6+S; }
  if(num>9) num = digitSum(num);
  if(num===0) num = 9;
  const map = {1:"Khảm",2:"Khôn",3:"Chấn",4:"Tốn",6:"Càn",7:"Đoài",8:"Cấn",9:"Ly"};
  if(num===5) return gender==="M" ? "Khôn" : "Cấn";
  return map[num];
}
const TRI = { "Càn":[1,1,1], "Khảm":[0,1,0], "Cấn":[0,0,1], "Chấn":[1,0,0], "Tốn":[0,1,1], "Ly":[1,0,1], "Khôn":[0,0,0], "Đoài":[1,1,0] };
const HANH = {"Càn":"Kim","Khảm":"Thuỷ","Cấn":"Thổ","Chấn":"Mộc","Tốn":"Mộc","Ly":"Hoả","Khôn":"Thổ","Đoài":"Kim"};
const DONG_TU = ["Khảm","Ly","Chấn","Tốn"];
function nhom(q){ return DONG_TU.includes(q) ? "Đông Tứ Mệnh" : "Tây Tứ Mệnh"; }
function bitsToTri(b){ for(const [name,t] of Object.entries(TRI)){ if(t[0]===b[0]&&t[1]===b[1]&&t[2]===b[2]) return name; } return null; }
function flip(bits, positions){ const r=[...bits]; positions.forEach(p=>{ r[p]=1-r[p]; }); return r; }
const STARS = [
  {name:"Phục Vị", flip:[], good:true, desc:"Giữ nguyên bản thân — ổn định, an nhàn, ít biến động."},
  {name:"Sinh Khí", flip:[2], good:true, desc:"Sinh sôi, thăng tiến, tài lộc, sức khoẻ — cát tinh vượng nhất."},
  {name:"Thiên Y", flip:[0,1], good:true, desc:"Sức khoẻ, quý nhân, thầy thuốc — hợp người bệnh, người cao tuổi."},
  {name:"Diên Niên", flip:[0,1,2], good:true, desc:"Trường thọ, hoà hợp gia đạo, hôn nhân bền vững."},
  {name:"Tuyệt Mệnh", flip:[1], good:false, desc:"Tổn hại nặng — sức khoẻ, tài chính; hung tinh nặng nhất."},
  {name:"Lục Sát", flip:[0,2], good:false, desc:"Thị phi, kiện tụng, tai nạn nhỏ, xung khắc."},
  {name:"Hoạ Hại", flip:[0], good:false, desc:"Phiền toái vặt, hao tài lặt vặt, cãi vã — nhẹ nhất trong 4 hung tinh."},
  {name:"Ngũ Quỷ", flip:[1,2], good:false, desc:"Hoả hoạn, trộm cắp, thị phi lớn, dễ gây tai hoạ bất ngờ."},
];
function duNien(base){
  const bits = TRI[base];
  return STARS.map(s=>{
    const quai = bitsToTri(flip(bits, s.flip));
    return {star:s.name, good:s.good, desc:s.desc, quai, hanh:HANH[quai]};
  });
}
const HAU_THIEN = {"Bắc":"Khảm","Đông Bắc":"Cấn","Đông":"Chấn","Đông Nam":"Tốn","Nam":"Ly","Tây Nam":"Khôn","Tây":"Đoài","Tây Bắc":"Càn"};
const QUAI_TO_HUONG = {}; for(const [h,q] of Object.entries(HAU_THIEN)) QUAI_TO_HUONG[q]=h;
const DOI_HUONG = {"Bắc":"Nam","Nam":"Bắc","Đông":"Tây","Tây":"Đông","Đông Bắc":"Tây Nam","Tây Nam":"Đông Bắc","Đông Nam":"Tây Bắc","Tây Bắc":"Đông Nam"};

const HANH_COLOR = {
  "Mộc":{mau:["Xanh lá","Xanh lục"], hex:["#3f8f4f","#5fab6c"]},
  "Hoả":{mau:["Đỏ","Cam","Hồng","Tím"], hex:["#c9432f","#e08a2b"]},
  "Thổ":{mau:["Vàng đất","Nâu","Be"], hex:["#b98a3d","#8a6a3d"]},
  "Kim":{mau:["Trắng","Xám","Ánh kim"], hex:["#cfcfcf","#e8d98a"]},
  "Thuỷ":{mau:["Đen","Xanh dương/Navy"], hex:["#1c1c1c","#2b4a7a"]},
};
const SINH_PREV = {"Hoả":"Mộc","Thổ":"Hoả","Kim":"Thổ","Thuỷ":"Kim","Mộc":"Thuỷ"}; // a sinh H: SINH_PREV[H] = a
const KHAC_PREV = {"Thổ":"Mộc","Thuỷ":"Thổ","Hoả":"Thuỷ","Kim":"Hoả","Mộc":"Kim"}; // a khắc H: KHAC_PREV[H] = a
const KHAC_NEXT = {"Mộc":"Thổ","Thổ":"Thuỷ","Thuỷ":"Hoả","Hoả":"Kim","Kim":"Mộc"}; // H khắc b: KHAC_NEXT[H] = b

export const PhongThuyEngine = { menhQuai, HANH, nhom, duNien, HAU_THIEN, QUAI_TO_HUONG, DOI_HUONG, HANH_COLOR, SINH_PREV, KHAC_PREV, KHAC_NEXT, lySoYear, lapXuanJD, jdFromDate, jdToDate };
export default PhongThuyEngine;

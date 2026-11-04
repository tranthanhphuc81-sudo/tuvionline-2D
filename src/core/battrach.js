// @ts-nocheck
/* Trích nguyên văn từ legacy/lyso-toolkit.html (bản web đã kiểm chứng).
   Phase 1 của PROMPT-KIT sẽ chuyển sang TypeScript chặt chẽ — giữ cho tests/golden.test.ts luôn xanh. */

import { jdFromDate, jdToDateRounded as jdToDate, lapXuanJD } from './calendar';
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

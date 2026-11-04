// @ts-nocheck
/* Trích từ legacy/lyso-toolkit.html (bản web đã kiểm chứng) — bỏ phần thao tác DOM.
   Phase 1 của PROMPT-KIT sẽ chuyển sang TypeScript chặt chẽ — giữ cho tests/golden.test.ts luôn xanh. */
/* ===== Tiện ích dùng chung: kiểm tra ngày, múi giờ lịch âm, giờ Tý muộn ===== */

function pad2(n){ return (n<10?'0':'')+n; }
// Ngày dương lịch có thật không (loại 31/2, 31/4...)
function validSolar(dd,mm,yy){
  if(!Number.isInteger(dd)||!Number.isInteger(mm)||!Number.isInteger(yy)) return false;
  if(yy<1900||yy>2100||mm<1||mm>12||dd<1) return false;
  var d=new Date(Date.UTC(yy,mm-1,dd));
  return d.getUTCFullYear()===yy && d.getUTCMonth()===mm-1 && d.getUTCDate()===dd;
}
// Cộng/trừ ngày cho một ngày dương lịch
function shiftSolar(dd,mm,yy,delta){
  var d=new Date(Date.UTC(yy,mm-1,dd+delta));
  return [d.getUTCDate(), d.getUTCMonth()+1, d.getUTCFullYear()];
}
// Lịch âm Việt Nam: từ 1968 tính theo kinh tuyến 105°Đ (UTC+7); trước 1968 tính theo kinh tuyến 120°Đ (UTC+8)
function lunarTzForSolarYear(yy){ return yy<1968 ? 8 : 7; }
function lunarTzForLunarYear(ly){ return ly<1968 ? 8 : 7; }

export const LySoUtil = { pad2, validSolar, shiftSolar, lunarTzForSolarYear, lunarTzForLunarYear };
export default LySoUtil;

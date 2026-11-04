// @ts-nocheck
/* Trích nguyên văn từ legacy/lyso-toolkit.html (bản web đã kiểm chứng).
   Phase 1 của PROMPT-KIT sẽ chuyển sang TypeScript chặt chẽ — giữ cho tests/golden.test.ts luôn xanh. */

import { jdFromDate, monthChiFromDate } from './calendar';
function mod(n,m){ return ((n%m)+m)%m; }
function dayCanChiIndex(dd,mm,yy){ const jd=jdFromDate(dd,mm,yy); const idx=mod(jd+49,60); return {can:idx%10, chi:idx%12}; }

/* ===== Luc Hao core ===== */
const CAN = ["Giáp","Ất","Bính","Đinh","Mậu","Kỷ","Canh","Tân","Nhâm","Quý"];
const CHI = ["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];
const HANH5 = ["Kim","Thuỷ","Mộc","Hoả","Thổ"];
const CHI_HANH_IDX = [1,4,2,2,4,3,3,4,0,0,4,1];
const TRI = ["Càn","Khảm","Cấn","Chấn","Tốn","Ly","Khôn","Đoài"];
const BITS = { Càn:[1,1,1], Khảm:[0,1,0], Cấn:[0,0,1], Chấn:[1,0,0], Tốn:[0,1,1], Ly:[1,0,1], Khôn:[0,0,0], Đoài:[1,1,0] };
const TRI_TUONG = { Càn:"Thiên", Khôn:"Địa", Chấn:"Lôi", Cấn:"Sơn", Tốn:"Phong", Khảm:"Thuỷ", Ly:"Hoả", Đoài:"Trạch" };
const TRI_CUNG_HANH_IDX = { Càn:0, Đoài:0, Chấn:2, Tốn:2, Khảm:1, Ly:3, Cấn:4, Khôn:4 };
function bitsToTri(b){ for(const name of TRI){ const t=BITS[name]; if(t[0]===b[0]&&t[1]===b[1]&&t[2]===b[2]) return name; } return null; }

const NAP_GIAP = {
  Càn:  { noi:[[0,0],[0,2],[0,4]], ngoai:[[8,6],[8,8],[8,10]] },
  Khôn: { noi:[[1,7],[1,5],[1,3]], ngoai:[[9,1],[9,11],[9,9]] },
  Chấn: { noi:[[6,0],[6,2],[6,4]], ngoai:[[6,6],[6,8],[6,10]] },
  Tốn:  { noi:[[7,1],[7,11],[7,9]], ngoai:[[7,7],[7,5],[7,3]] },
  Khảm: { noi:[[4,2],[4,4],[4,6]], ngoai:[[4,8],[4,10],[4,0]] },
  Ly:   { noi:[[5,3],[5,1],[5,11]], ngoai:[[5,9],[5,7],[5,5]] },
  Cấn:  { noi:[[2,4],[2,6],[2,8]], ngoai:[[2,10],[2,0],[2,2]] },
  Đoài: { noi:[[3,5],[3,3],[3,1]], ngoai:[[3,11],[3,9],[3,7]] },
};
const STEP_THE_UNG = {
  "Bản cung":[6,3], "Nhất thế":[1,4], "Nhị thế":[2,5], "Tam thế":[3,6],
  "Tứ thế":[4,1], "Ngũ thế":[5,2], "Du hồn":[4,1], "Quy hồn":[3,6],
};
const HEXA_ROWS = [
["Càn","Bản cung","Càn","Càn","Càn vi Thiên"],["Càn","Nhất thế","Tốn","Càn","Thiên Phong Cấu"],
["Càn","Nhị thế","Cấn","Càn","Thiên Sơn Độn"],["Càn","Tam thế","Khôn","Càn","Thiên Địa Bĩ"],
["Càn","Tứ thế","Khôn","Tốn","Phong Địa Quán"],["Càn","Ngũ thế","Khôn","Cấn","Sơn Địa Bác"],
["Càn","Du hồn","Khôn","Ly","Hoả Địa Tấn"],["Càn","Quy hồn","Càn","Ly","Hoả Thiên Đại Hữu"],
["Khảm","Bản cung","Khảm","Khảm","Khảm vi Thuỷ"],["Khảm","Nhất thế","Đoài","Khảm","Thuỷ Trạch Tiết"],
["Khảm","Nhị thế","Chấn","Khảm","Thuỷ Lôi Truân"],["Khảm","Tam thế","Ly","Khảm","Thuỷ Hoả Ký Tế"],
["Khảm","Tứ thế","Ly","Đoài","Trạch Hoả Cách"],["Khảm","Ngũ thế","Ly","Chấn","Lôi Hoả Phong"],
["Khảm","Du hồn","Ly","Khôn","Địa Hoả Minh Di"],["Khảm","Quy hồn","Khảm","Khôn","Địa Thuỷ Sư"],
["Cấn","Bản cung","Cấn","Cấn","Cấn vi Sơn"],["Cấn","Nhất thế","Ly","Cấn","Sơn Hoả Bí"],
["Cấn","Nhị thế","Càn","Cấn","Sơn Thiên Đại Súc"],["Cấn","Tam thế","Đoài","Cấn","Sơn Trạch Tổn"],
["Cấn","Tứ thế","Đoài","Ly","Hoả Trạch Khuê"],["Cấn","Ngũ thế","Đoài","Càn","Thiên Trạch Lý"],
["Cấn","Du hồn","Đoài","Tốn","Phong Trạch Trung Phu"],["Cấn","Quy hồn","Cấn","Tốn","Phong Sơn Tiệm"],
["Chấn","Bản cung","Chấn","Chấn","Chấn vi Lôi"],["Chấn","Nhất thế","Khôn","Chấn","Lôi Địa Dự"],
["Chấn","Nhị thế","Khảm","Chấn","Lôi Thuỷ Giải"],["Chấn","Tam thế","Tốn","Chấn","Lôi Phong Hằng"],
["Chấn","Tứ thế","Tốn","Khôn","Địa Phong Thăng"],["Chấn","Ngũ thế","Tốn","Khảm","Thuỷ Phong Tỉnh"],
["Chấn","Du hồn","Tốn","Đoài","Trạch Phong Đại Quá"],["Chấn","Quy hồn","Chấn","Đoài","Trạch Lôi Tuỳ"],
["Tốn","Bản cung","Tốn","Tốn","Tốn vi Phong"],["Tốn","Nhất thế","Càn","Tốn","Phong Thiên Tiểu Súc"],
["Tốn","Nhị thế","Ly","Tốn","Phong Hoả Gia Nhân"],["Tốn","Tam thế","Chấn","Tốn","Phong Lôi Ích"],
["Tốn","Tứ thế","Chấn","Càn","Thiên Lôi Vô Vọng"],["Tốn","Ngũ thế","Chấn","Ly","Hoả Lôi Phệ Hạp"],
["Tốn","Du hồn","Chấn","Cấn","Sơn Lôi Di"],["Tốn","Quy hồn","Tốn","Cấn","Sơn Phong Cổ"],
["Ly","Bản cung","Ly","Ly","Ly vi Hoả"],["Ly","Nhất thế","Cấn","Ly","Hoả Sơn Lữ"],
["Ly","Nhị thế","Tốn","Ly","Hoả Phong Đỉnh"],["Ly","Tam thế","Khảm","Ly","Hoả Thuỷ Vị Tế"],
["Ly","Tứ thế","Khảm","Cấn","Sơn Thuỷ Mông"],["Ly","Ngũ thế","Khảm","Tốn","Phong Thuỷ Hoán"],
["Ly","Du hồn","Khảm","Càn","Thiên Thuỷ Tụng"],["Ly","Quy hồn","Ly","Càn","Thiên Hoả Đồng Nhân"],
["Khôn","Bản cung","Khôn","Khôn","Khôn vi Địa"],["Khôn","Nhất thế","Chấn","Khôn","Địa Lôi Phục"],
["Khôn","Nhị thế","Đoài","Khôn","Địa Trạch Lâm"],["Khôn","Tam thế","Càn","Khôn","Địa Thiên Thái"],
["Khôn","Tứ thế","Càn","Chấn","Lôi Thiên Đại Tráng"],["Khôn","Ngũ thế","Càn","Đoài","Trạch Thiên Quải"],
["Khôn","Du hồn","Càn","Khảm","Thuỷ Thiên Nhu"],["Khôn","Quy hồn","Khôn","Khảm","Thuỷ Địa Tỷ"],
["Đoài","Bản cung","Đoài","Đoài","Đoài vi Trạch"],["Đoài","Nhất thế","Khảm","Đoài","Trạch Thuỷ Khốn"],
["Đoài","Nhị thế","Khôn","Đoài","Trạch Địa Tuỵ"],["Đoài","Tam thế","Cấn","Đoài","Trạch Sơn Hàm"],
["Đoài","Tứ thế","Cấn","Khảm","Thuỷ Sơn Kiển"],["Đoài","Ngũ thế","Cấn","Khôn","Địa Sơn Khiêm"],
["Đoài","Du hồn","Cấn","Chấn","Lôi Sơn Tiểu Quá"],["Đoài","Quy hồn","Đoài","Chấn","Lôi Trạch Quy Muội"],
];
const HEXA_MAP = {};
for(const [cung,step,ha,thuong,name] of HEXA_ROWS){ HEXA_MAP[ha+"|"+thuong] = {cung,step,name}; }

function lucThan(taHanhIdx, hanhIdx){
  const d = mod(hanhIdx - taHanhIdx, 5);
  return ["Huynh Đệ","Tử Tôn","Thê Tài","Quan Quỷ","Phụ Mẫu"][d];
}
function napGiapHexagram(haName, thName){
  const ha = NAP_GIAP[haName], th = NAP_GIAP[thName];
  const hao = [];
  for(let i=0;i<3;i++) hao.push({can:ha.noi[i][0], chi:ha.noi[i][1]});
  for(let i=0;i<3;i++) hao.push({can:th.ngoai[i][0], chi:th.ngoai[i][1]});
  return hao;
}
function calcQuai(tosses){
  const amDuong = tosses.map(s => (s===7||s===9) ? 1 : 0);
  const dong = tosses.map(s => (s===6||s===9));
  const haName = bitsToTri([amDuong[0],amDuong[1],amDuong[2]]);
  const thName = bitsToTri([amDuong[3],amDuong[4],amDuong[5]]);
  const info = HEXA_MAP[haName+"|"+thName];
  const [theHao, ungHao] = STEP_THE_UNG[info.step];
  const cungHanhIdx = TRI_CUNG_HANH_IDX[info.cung];
  const hao = napGiapHexagram(haName, thName).map((h,i)=>{
    const hanhIdx = CHI_HANH_IDX[h.chi];
    return { idx:i+1, can:h.can, chi:h.chi, hanhIdx, toss:tosses[i],
      amDuong:amDuong[i], dong:dong[i], lucThan:lucThan(cungHanhIdx,hanhIdx),
      isThe:(i+1)===theHao, isUng:(i+1)===ungHao };
  });
  let bien = null;
  const dongIdx = []; for(let i=0;i<6;i++) if(dong[i]) dongIdx.push(i);
  if(dongIdx.length>0){
    const bAmDuong = amDuong.slice();
    for(const i of dongIdx) bAmDuong[i]=1-bAmDuong[i];
    const bHaName=bitsToTri([bAmDuong[0],bAmDuong[1],bAmDuong[2]]), bThName=bitsToTri([bAmDuong[3],bAmDuong[4],bAmDuong[5]]);
    const bInfo = HEXA_MAP[bHaName+"|"+bThName];
    const bHaoAll = napGiapHexagram(bHaName,bThName);
    const hoaList = dongIdx.map(i=>{
      const nc = bHaoAll[i]; const newHanhIdx = CHI_HANH_IDX[nc.chi];
      return { haoIdx:i+1, tuCan:hao[i].can, tuChi:hao[i].chi, tuLucThan:hao[i].lucThan,
        denCan:nc.can, denChi:nc.chi, denLucThan:lucThan(cungHanhIdx,newHanhIdx) };
    });
    bien = { name:bInfo.name, cung:bInfo.cung, step:bInfo.step, hoaList };
  }
  return { haName, thName, cung:info.cung, step:info.step, name:info.name, hao, theHao, ungHao, cungHanhIdx, bien };
}

const VTHTT = { // by HANH5 order [Kim,Thuy,Moc,Hoa,Tho]
  xuan:["Tù","Hưu","Vượng","Tướng","Tử"], ha:["Tử","Tù","Hưu","Vượng","Tướng"],
  thu:["Vượng","Tướng","Tử","Tù","Hưu"], dong:["Hưu","Vượng","Tướng","Tử","Tù"],
  tuquy:["Tướng","Tử","Tù","Hưu","Vượng"],
};
function seasonOfMonthChi(chiIdx){
  if(chiIdx===2||chiIdx===3) return "xuan";
  if(chiIdx===5||chiIdx===6) return "ha";
  if(chiIdx===8||chiIdx===9) return "thu";
  if(chiIdx===11||chiIdx===0) return "dong";
  return "tuquy";
}
const LUC_XUNG = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
const LUC_HOP = [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];
function chiRelation(a,b){
  if(a===b) return null;
  if(LUC_XUNG.some(p=>(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a))) return "xung";
  if(LUC_HOP.some(p=>(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a))) return "hop";
  return null;
}
function pillClass(state){ return state==="Vượng"?"vuong":state==="Tướng"?"tuong":state==="Hưu"?"huu":"tu"; }

export const LucHaoEngine = { CAN, CHI, HANH5, TRI, TRI_TUONG, calcQuai, dayCanChiIndex, monthChiFromDate,
  VTHTT, seasonOfMonthChi, chiRelation, lucThan, mod, CHI_HANH_IDX };
export default LucHaoEngine;

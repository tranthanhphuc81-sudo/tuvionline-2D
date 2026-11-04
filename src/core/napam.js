// @ts-nocheck
/* Trích nguyên văn từ legacy/lyso-toolkit.html (bản web đã kiểm chứng).
   Phase 1 của PROMPT-KIT sẽ chuyển sang TypeScript chặt chẽ — giữ cho tests/golden.test.ts luôn xanh. */
/* ===== Engine (Nạp Âm — mạng theo năm sinh & hợp hôn) — dùng lại đúng bảng 30 Nạp Âm
   và công thức Can/Chi năm sinh đã trình bày ở Phụ lục Nạp Âm, tài liệu Phần 4 ===== */

function mod(n,m){ return ((n%m)+m)%m; }
const CAN=["Giáp","Ất","Bính","Đinh","Mậu","Kỷ","Canh","Tân","Nhâm","Quý"];
const CHI=["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];
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
function canChiOfYear(year){ return { can: mod(year-4,10), chi: mod(year-4,12) }; }
function napAmOfYear(year){
  const {can,chi} = canChiOfYear(year);
  const row = napAmLookup(can,chi);
  return { year, can, chi, canChiTen: CAN[can]+' '+CHI[chi], hanh: row[2], ten: row[3] };
}

const HANH_ORDER = ["Kim","Thuỷ","Mộc","Hoả","Thổ"];
function sinhOf(h){ return HANH_ORDER[mod(HANH_ORDER.indexOf(h)+1,5)]; }
function khacOf(h){ return HANH_ORDER[mod(HANH_ORDER.indexOf(h)+2,5)]; }

// 4 ngoại lệ sinh khắc đặc biệt được dân gian truyền lại phổ biến nhất (Phụ lục Nạp Âm, mục 5)
const EXC_NEEDS = [
  { names:["Kiếm Phong Kim","Sa Trung Kim"], needs:"Hoả",
    note:"là kim loại thô, cần Hoả để nung/luyện mới thành khí cụ hoàn chỉnh" },
  { names:["Thiên Thượng Hoả","Tích Lịch Hoả"], needs:"Thuỷ",
    note:"là lửa trên trời/ánh chớp sấm sét, cần Thuỷ (mây, hơi ẩm) mới sinh ra được" },
];
function relation(pA, pB){
  const names = [pA.ten, pB.ten];
  if(names.includes('Đại Hải Thuỷ') && names.includes('Sa Trung Thổ')){
    return { cls:'ok', text:'Đại Hải Thuỷ (nước biển lớn) được dân gian xem là dung nạp được Sa Trung Thổ (đất lẫn cát, đất cù lao) mà không bị khắc chế — đây là 1 trong 4 ngoại lệ sinh khắc đặc biệt của Nạp Âm (mục 5, Phụ lục Nạp Âm), dù theo Ngũ hành gốc thì Thổ khắc Thuỷ.' };
  }
  for(const ex of EXC_NEEDS){
    if(ex.names.includes(pA.ten) && pB.hanh === ex.needs){
      return { cls:'ok', text: pA.ten+' ('+ex.note+') — nên mạng '+pB.hanh+' ('+pB.ten+') của người kia KHÔNG bị xem là khắc mà ngược lại còn được xem là có lợi, dù theo Ngũ hành gốc '+pB.hanh+' khắc '+pA.hanh+'. Đây là 1 trong 4 ngoại lệ sinh khắc đặc biệt của Nạp Âm (mục 5, Phụ lục Nạp Âm).' };
    }
    if(ex.names.includes(pB.ten) && pA.hanh === ex.needs){
      return { cls:'ok', text: pB.ten+' ('+ex.note+') — nên mạng '+pA.hanh+' ('+pA.ten+') của người kia KHÔNG bị xem là khắc mà ngược lại còn được xem là có lợi, dù theo Ngũ hành gốc '+pA.hanh+' khắc '+pB.hanh+'. Đây là 1 trong 4 ngoại lệ sinh khắc đặc biệt của Nạp Âm (mục 5, Phụ lục Nạp Âm).' };
    }
  }
  if(pA.hanh === pB.hanh){
    return { cls:'ok', text:'Hai mạng cùng hành '+pA.hanh+' — dân gian xem là hoà hợp, ngang bằng, không xung khắc.' };
  }
  if(sinhOf(pA.hanh) === pB.hanh){
    return { cls:'ok', text: pA.hanh+' sinh '+pB.hanh+' — mạng Người 1 ('+pA.ten+') tương sinh, trợ lực cho mạng Người 2 ('+pB.ten+').' };
  }
  if(sinhOf(pB.hanh) === pA.hanh){
    return { cls:'ok', text: pB.hanh+' sinh '+pA.hanh+' — mạng Người 2 ('+pB.ten+') tương sinh, trợ lực cho mạng Người 1 ('+pA.ten+').' };
  }
  if(khacOf(pA.hanh) === pB.hanh){
    return { cls:'warn', text: pA.hanh+' khắc '+pB.hanh+' — theo Ngũ hành gốc, mạng Người 1 ('+pA.ten+') khắc mạng Người 2 ('+pB.ten+'). Đây là MỘT lớp tham khảo khi xem tuổi hợp hôn, cần cân nhắc thêm cùng các yếu tố khác (tuổi xung theo Chi, Cung phi Bát Trạch...), không phải căn cứ duy nhất hay mang tính quyết định.' };
  }
  if(khacOf(pB.hanh) === pA.hanh){
    return { cls:'warn', text: pB.hanh+' khắc '+pA.hanh+' — theo Ngũ hành gốc, mạng Người 2 ('+pB.ten+') khắc mạng Người 1 ('+pA.ten+'). Đây là MỘT lớp tham khảo khi xem tuổi hợp hôn, cần cân nhắc thêm cùng các yếu tố khác (tuổi xung theo Chi, Cung phi Bát Trạch...), không phải căn cứ duy nhất hay mang tính quyết định.' };
  }
  return { cls:'warn', text:'Không xác định được quan hệ sinh khắc.' };
}

export const NapAmEngine = { CAN, CHI, NAPAM, napAmLookup, canChiOfYear, napAmOfYear, HANH_ORDER, sinhOf, khacOf, relation };
export default NapAmEngine;

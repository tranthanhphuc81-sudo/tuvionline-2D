/* Bát Trạch: các mục hiển thị và "Giải thích chỉ số" — NGUYÊN VĂN legacy (tab Bát Trạch: renderSummary, renderLapXuanNote,
   renderHouseBanner, renderPositions, renderHanh, renderExplain, renderNotes). */
import { PhongThuyEngine, type BatTrachReading, type Hanh, type HouseReading, type Huong, type SolarDate, type StarName } from '../../core';
import { note, p, type Block, type Section } from '../rich';
import { duNienDesc } from './stars';

const { QUAI_TO_HUONG, HANH_COLOR, nhom } = PhongThuyEngine;

export function batTrachSummary(r: BatTrachReading): [string, string][] {
  const cells: [string, string][] = [
    ['Năm lý số dùng để tính', String(r.ly.year)],
    ['Mệnh Quái', r.quai],
    ['Ngũ hành bản mệnh', r.hanh],
    ['Nhóm', r.nhom],
  ];
  if (r.house) cells.push(['Trạch Quái căn nhà', r.house.trachQuai], ['Nhóm của nhà', r.house.nhom]);
  return cells;
}

/** Ghi chú sinh trước Lập Xuân; null nếu sinh sau. */
export function batTrachLapXuanNote(solar: SolarDate, r: BatTrachReading): string | null {
  if (!r.lapXuan) return null;
  const lx = r.lapXuan, y = solar.yy, ly = r.ly.year;
  return '<b>Sinh trước tiết Lập Xuân:</b> ngày sinh ' + solar.dd + '/' + solar.mm + '/' + y + ' rơi TRƯỚC tiết Lập Xuân của năm ' + y + ' (rơi vào ngày ' + lx.dd + '/' + lx.mm + '/' + lx.yy + ') — theo mục 2.2 Phần 4, trường hợp này phải dùng năm lý số <b>' + ly + '</b> để tính Mệnh Quái, KHÔNG dùng năm ' + y + ' ghi trên giấy khai sinh. Công cụ đã tự động áp dụng đúng năm ' + ly + ' ở bảng bên dưới.';
}

export interface StarCard { star: StarName; good: boolean; huong: Huong; pill: string; line: string; desc: string; cur: boolean }

/** Thẻ 8 sao Du Niên (legacy renderStars); `cur` là hướng cửa đang xét. */
export function batTrachStarCards(r: BatTrachReading): StarCard[] {
  return r.dn.map((s) => {
    const huong = QUAI_TO_HUONG[s.quai], cur = huong === r.house?.huongCua;
    return { star: s.star, good: s.good, huong, cur, pill: s.good ? 'TỐT' : 'XẤU', line: 'Hướng ' + huong + ' — quẻ ' + s.quai + ' (' + s.hanh + ')' + (cur ? ' · đang chọn' : ''), desc: duNienDesc(s.star) };
  });
}

/** Đánh giá căn nhà theo hướng cửa (legacy #pt-houseBanner). */
export function batTrachHouseBanner(h: HouseReading): string {
  return '<b>' + (h.hop ? 'Hợp nhóm' : 'Lệch nhóm') + ':</b> nhà toạ ' + h.toa + ', hướng cửa ' + h.huongCua + ' (Trạch Quái ' + h.trachQuai + ', ' + h.nhom + ') '
    + (h.hop ? 'cùng nhóm với Mệnh Quái của bạn — theo nguyên tắc Chương 3, đây là lựa chọn thuận lợi để tối đa hoá số hướng tốt khai thác được.'
      : 'khác nhóm với Mệnh Quái của bạn — theo nguyên tắc Chương 3, đây không phải lựa chọn tối ưu; khó sắp xếp đủ 4 vị trí quan trọng (cửa, bếp, phòng ngủ, bàn làm việc) đều rơi vào hướng tốt cùng lúc.')
    + ' Riêng với Mệnh Quái của bạn, hướng cửa <b>' + h.huongCua + '</b> đang xét ứng với sao <b>' + h.star.star + '</b> (' + (h.star.good ? 'tốt' : 'xấu') + ') — ' + duNienDesc(h.star.star);
}

/** Bốn vị trí "Gợi ý bố trí theo hướng" (legacy renderPositions): [nhãn, câu có định dạng]. */
export function batTrachPositions(r: BatTrachReading): [string, string][] {
  const at = (star: StarName) => QUAI_TO_HUONG[r.dn.find((x) => x.star === star)!.quai];
  const sk = at('Sinh Khí'), ty = at('Thiên Y'), dn = at('Diên Niên'), nq = at('Ngũ Quỷ'), tm = at('Tuyệt Mệnh');
  return [
    ['Cửa chính', 'Ưu tiên hướng <b>' + sk + '</b> (Sinh Khí); nếu không thể, hướng <b>' + dn + '</b> (Diên Niên) hoặc <b>' + ty + '</b> (Thiên Y).'],
    ['Bếp (toạ hung, hướng cát)', 'Đặt bếp TOẠ hướng <b>' + nq + '</b> (Ngũ Quỷ) hoặc <b>' + tm + '</b> (Tuyệt Mệnh); miệng bếp quay về hướng <b>' + sk + '</b> hoặc <b>' + dn + '</b>.'],
    ['Giường ngủ (đầu giường)', 'Ưu tiên hướng <b>' + ty + '</b> (Thiên Y — dưỡng sức khoẻ) hoặc <b>' + sk + '</b> (Sinh Khí — năng động).'],
    ['Bàn làm việc/học (mặt ngồi)', 'Ưu tiên hướng <b>' + sk + '</b> (Sinh Khí) hoặc <b>' + dn + '</b> (Diên Niên).'],
  ];
}

function swatches(id: string, hanhs: readonly Hanh[]): Block {
  return { id, kind: 'swatches', items: hanhs.flatMap((h) => HANH_COLOR[h].mau.map((m, i) => ({ label: m, hex: HANH_COLOR[h].hex[i] ?? HANH_COLOR[h].hex[0] }))) };
}

/** "Ngũ hành ứng dụng — màu sắc, vật phẩm" (legacy renderHanh). */
export function batTrachHanhCard(r: BatTrachReading): Section {
  return {
    id: 'battrach.hanh', title: '',
    blocks: [
      p('battrach.hanh.nen', 'Mệnh Quái <b>' + r.quai + '</b> thuộc hành <b>' + r.hanh + '</b>. Theo mục 7.3, nên ưu tiên dùng màu sắc/vật phẩm thuộc chính hành <b>' + r.hanh + '</b> và hành <b>' + r.sinhHanh + '</b> (hành sinh ra ' + r.hanh + '):'),
      swatches('battrach.hanh.nen.mau', [r.hanh, r.sinhHanh]),
      p('battrach.hanh.han', 'Hạn chế dùng nhiều màu/vật phẩm thuộc hành <b>' + r.khacHanh + '</b> (hành khắc chế ' + r.hanh + '):'),
      swatches('battrach.hanh.han.mau', [r.khacHanh]),
      note('battrach.hanh.bikhac', 'Màu/vật phẩm thuộc hành <b>' + r.biKhacHanh + '</b> (hành bị ' + r.hanh + ' khắc chế lại) có thể dùng vừa phải, không cần kiêng tuyệt đối.'),
    ],
  };
}

export function batTrachExplain(r: BatTrachReading): Section[] {
  const { quai, hanh, house } = r;
  const goodStars = r.dn.filter((s) => s.good).map((s) => s.star).join(', ');
  const badStars = r.dn.filter((s) => !s.good).map((s) => s.star).join(', ');
  const item = (id: string, title: string, body: string): Section => ({ id: 'battrach.explain.' + id, title, blocks: [p('battrach.explain.' + id + '.0', body)] });
  return [
    item('menhquai', '1. Mệnh Quái là gì?', 'Mệnh Quái là 1 trong 8 quẻ Bát Quái (Càn, Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài) được gán cho mỗi người dựa trên năm sinh và giới tính (công thức "cửu cung phi tinh" — Chương 2). Đây là quẻ gốc đại diện cho bản thân, dùng làm trục để so sánh với 8 hướng nhà và tìm ra hướng/vị trí hợp mệnh. Ở đây, Mệnh Quái của bạn là <b>' + quai + '</b>, thuộc hành <b>' + hanh + '</b>.'),
    item('nhom', '2. Đông Tứ Mệnh / Tây Tứ Mệnh', '8 quẻ được chia làm 2 nhóm 4 quẻ: <b>Đông Tứ Mệnh</b> (Khảm, Ly, Chấn, Tốn) và <b>Tây Tứ Mệnh</b> (Càn, Khôn, Cấn, Đoài). Nguyên tắc cốt lõi của Bát Trạch: người thuộc nhóm nào nên ưu tiên ở nhà/hướng thuộc CÙNG nhóm đó — Mệnh Quái <b>' + quai + '</b> của bạn thuộc <b>' + nhom(quai) + '</b>, nên các hướng hợp nhất sẽ nằm trong 4 hướng Hậu Thiên tương ứng nhóm này.'),
    item('dunien', '3. Du Niên — 8 sao tốt xấu', 'Từ Mệnh Quái gốc, phép "lật hào" theo quy luật cố định (Chương 4) sinh ra 8 sao Du Niên ứng với 8 hướng, chia làm 4 sao tốt (<b>' + goodStars + '</b>) và 4 sao xấu (<b>' + badStars + '</b>). Mỗi sao mang một ý nghĩa và mức độ cát/hung khác nhau (ví dụ Sinh Khí là cát tinh vượng nhất, Tuyệt Mệnh là hung tinh nặng nhất) — xem bảng đầy đủ ở mục "Bảng Du Niên" bên trên để biết hướng nào ứng với sao nào.'),
    item('botri', '4. Ứng dụng vào bố trí thực tế', 'Nguyên tắc chung: cửa chính, bếp (hướng đặt bếp/hướng lưng người nấu), giường ngủ (hướng đầu giường) và bàn làm việc nên ưu tiên đặt để "đón" các sao tốt (đặc biệt Sinh Khí, Thiên Y, Diên Niên) và tránh các sao xấu, đặc biệt Tuyệt Mệnh, Ngũ Quỷ. '
      + (house ? 'Với hướng cửa chính đang xét (<b>' + house.huongCua + '</b>), căn nhà có Trạch Quái là <b>' + house.trachQuai + '</b> (nhóm ' + house.nhom + ') — ' + (house.hop ? 'CÙNG nhóm với Mệnh Quái của bạn, tức là hướng nhà đang thuận theo nguyên tắc Bát Trạch.' : 'KHÁC nhóm với Mệnh Quái của bạn — xem thêm bảng Du Niên và gợi ý ở trên để biết nên hoá giải/bố trí thế nào.')
        : 'Bạn chưa nhập hướng cửa chính của một căn nhà cụ thể — có thể quay lại nhập ở form phía trên để xem đánh giá riêng cho ngôi nhà đang cân nhắc.')),
    item('nguhanh', '5. Ngũ hành ứng dụng nội thất', 'Ngoài hướng, Ngũ hành của Mệnh Quái (<b>' + hanh + '</b>) còn được dùng để chọn màu sắc, vật phẩm trang trí hợp mệnh (ưu tiên hành ' + hanh + ' và hành sinh ra nó, hạn chế hành khắc nó) — xem chi tiết màu sắc gợi ý ở mục "Ngũ hành ứng dụng" bên trên.'),
  ];
}

export function batTrachNotes(): Section {
  return {
    id: 'battrach.notes', title: '',
    blocks: [p('battrach.notes.0', '<b>Phạm vi công cụ:</b> tính Mệnh Quái theo công thức Chương 2, tra đủ bảng Du Niên 8 sao theo quy luật lật hào đã kiểm chứng ở Chương 4, xét nhóm Đông/Tây Tứ Mệnh (Chương 3) và gợi ý bố trí hướng theo Chương 5, 7. Công cụ <b>chưa xét</b>: Huyền Không Phi Tinh (thời vận xây nhà), Loan Đầu chuyên sâu (hình thế thực địa), và các trường hợp đặc thù (chung cư nhiều hướng, nhiều thành viên khác Mệnh Quái trong cùng nhà) — các trường hợp này nên tham khảo thêm như đã lưu ý trong tài liệu Phần 4. Đây là công cụ tính toán theo hệ lý số cổ truyền, mang tính văn hoá và tham khảo, không thay thế quyết định thực tế.')],
  };
}

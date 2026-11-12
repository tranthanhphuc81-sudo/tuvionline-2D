/* Câu chữ mục Cách cục (ARCHITECTURE mục 15). Nội dung mới, viết bằng lời của app, KHÔNG chép câu văn của bản dịch sách. */
import { BatTuEngine, type CachCucReading, type CachKey, type CachLyDo, type GodKey } from '../../core';
import { note, p, type Block, type Section } from '../rich';

const { CAN, CHI } = BatTuEngine;

export const CACH_NAME: Record<CachKey, string> = {
  'chinh-quan': 'Chính Quan cách', 'that-sat': 'Thất Sát cách', tai: 'Tài cách', an: 'Ấn cách', 'thuc-than': 'Thực Thần cách',
  'thuong-quan': 'Thương Quan cách', 'duong-nhan': 'Dương Nhận cách', 'kien-loc': 'Kiến Lộc cách', 'nguyet-kiep': 'Nguyệt Kiếp cách',
};
export const GOD_NAME: Record<GodKey, string> = {
  quan: 'Chính Quan', sat: 'Thất Sát', tai: 'Tài tinh', an: 'Ấn tinh', thuc: 'Thực Thần', thuong: 'Thương Quan', kiep: 'Tỷ Kiếp', kieu: 'Thiên Ấn',
};
const VI_TEXT: Record<Extract<CachLyDo, { k: 'thanh' }>['vi'], string> = {
  sinh: 'sinh thêm sức cho cách', ho: 'che chở cho cách', che: 'kiềm chế bớt cái dữ của cách', hoa: 'hoá cái dữ của cách thành cái giúp mình',
  tiet: 'cho khí thừa có chỗ thoát ra', giup: 'giúp thân đủ sức gánh cách',
};
const TRANG_THAI: Record<CachReadingStatus, string> = { thanh: 'cách thành', cuu: 'cách bị phá nhưng có chữ cứu', bai: 'cách chưa thành' };
type CachReadingStatus = CachCucReading['trangThai'];
const PILLAR = ['trụ năm', 'trụ tháng', 'trụ ngày', 'trụ giờ'];

export const CACHCUC_NOTE = 'Cách luận theo quy tắc của sách Tử Bình Chân Thuyên, app viết gọn lại nên chưa đủ mọi ngoại lệ của sách: so với các lá số ví dụ trong sách, Dụng thần trùng khoảng một nửa. Đây là một góc nhìn văn hoá để tham khảo.';

/** Câu ngắn cho "Tóm lại về bạn". */
export function cachCucTomLai(r: CachCucReading): string {
  return '<b>Cách cục (Bát Tự):</b> ' + CACH_NAME[r.cach] + ', ' + TRANG_THAI[r.trangThai] + '; Dụng thần theo cách cục là hành <b>' + r.dung + '</b>.';
}

function nguonText(r: CachCucReading, stems: readonly number[], monthChi: number): string {
  const chi = CHI[monthChi];
  if (r.nguon === 'loc-nhan') {
    const loai = r.cach === 'kien-loc' ? 'Lộc' : r.cach === 'duong-nhan' ? 'Dương Nhận' : 'Kiếp';
    return 'Chi tháng mang ' + loai + ' của chính Nhật Chủ. Sách không lấy chữ cùng hành với mình làm cách, mà tìm Tài, Quan, Thực lộ ra bên ngoài để dùng.';
  }
  if (r.nguon === 'thau') {
    const at = [0, 1, 3].filter((i) => stems[i] === r.can).map((i) => PILLAR[i]).join(', ');
    return 'Chi tháng ' + chi + ' tàng can ' + CAN[r.can] + ', và can này lộ lên ' + at + ', nên lấy ' + CAN[r.can] + ' (' + r.than + ') làm cách.';
  }
  if (r.nguon === 'tu-lenh') {
    return 'Không can tàng nào của chi tháng lộ lên. Bạn sinh vào ngày thứ ' + (Math.floor(r.days ?? 0) + 1) + ' sau tiết đầu tháng, lúc can ' + CAN[r.can] + ' đang cầm quyền (gọi là tư lệnh), nên lấy ' + CAN[r.can] + ' (' + r.than + ') làm cách.';
  }
  return 'Không can tàng nào của chi tháng lộ lên, nên lấy khí chính của chi tháng là ' + CAN[r.can] + ' (' + r.than + ') làm cách.';
}

function lyDoText(l: CachLyDo): string {
  if (l.k === 'thanh') return 'Có ' + GOD_NAME[l.tuong] + ' để ' + VI_TEXT[l.vi] + ', nên ' + GOD_NAME[l.tuong] + ' là tương thần, chữ giúp cách thành.';
  if (l.k === 'pha') return 'Gặp ' + GOD_NAME[l.boi] + ' lộ ra phá cách' + (l.cuu ? '; may có ' + GOD_NAME[l.cuu] + ' đứng ra cứu, nên cách vẫn dùng được.' : ', mà chưa có chữ cứu.');
  return 'Lá số chưa có ' + l.can.map((g) => GOD_NAME[g]).join(' hay ') + ' để giúp cách.';
}

/** Mục "Cách cục" trên màn Bát Tự. `stems`: can năm, tháng, ngày, giờ; `monthChi`: chi tháng; `nguHanhDung`: Dụng thần của engine ngũ hành để so. */
export function cachCucSection(r: CachCucReading, stems: readonly number[], monthChi: number, nguHanhDung: string): Section {
  const blocks: Block[] = [
    p('cachcuc.cach', 'Lá số thuộc <b>' + CACH_NAME[r.cach] + '</b>. ' + nguonText(r, stems, monthChi)),
    p('cachcuc.loai', r.nguon === 'loc-nhan' ? 'Với cách này, sách nhìn vào chữ dùng được ở bên ngoài thay vì chính chi tháng.' : r.thien ? 'Đây là cách lành: cần được giữ gìn, tránh bị phá.' : 'Đây là cách cần chế ngự: có chữ kiềm giữ thì mới thành.'),
    ...r.lyDo.map((l, i) => p('cachcuc.lydo.' + i, lyDoText(l))),
  ];
  if (r.via === 'dieu-hau') blocks.push(p('cachcuc.dieuhau', 'Sinh tháng ' + CHI[monthChi] + ', khí trời ' + (r.dung === 'Hoả' ? 'lạnh' : 'nóng') + '. Theo sách, lúc này việc ' + (r.dung === 'Hoả' ? 'sưởi ấm' : 'làm mát') + ' đứng trước cách cục (gọi là điều hậu), nên Dụng thần là hành <b>' + r.dung + '</b>.'));
  if (r.via === 'tong') blocks.push(p('cachcuc.tong', 'Lá số thành Tòng cách, là một ngoại cách. Gặp ngoại cách thì sách theo ngoại cách, nên Dụng thần là hành <b>' + r.dung + '</b>.'));
  blocks.push(p('cachcuc.dung', 'Dụng thần theo cách cục: hành <b>' + r.dung + '</b>. ' + (r.dung === nguHanhDung ? 'Trùng với Dụng thần của phần phân tích ngũ hành ở trên.' : 'Phần phân tích ngũ hành ở trên chọn hành ' + nguHanhDung + ': hai cách luận khác nhau thì kết quả có thể khác, sách cổ cũng vậy.')));
  blocks.push(note('cachcuc.note', CACHCUC_NOTE));
  return { id: 'cachcuc', title: '', blocks };
}

/** Lời Thầy đọc về cách cục: vài câu ngắn, không lặp lại phần lý do chi tiết. */
export function cachCucSpeech(r: CachCucReading): string {
  const tuong = r.tuongThan ? ' Chữ giúp cách là ' + GOD_NAME[r.tuongThan] + '.' : '';
  const why = r.via === 'dieu-hau' ? ' Sinh vào tháng ' + (r.dung === 'Hoả' ? 'lạnh nên cần sưởi ấm' : 'nóng nên cần làm mát') + ' trước, nên Dụng thần là ' + r.dung + '.' : r.via === 'tong' ? ' Lá số thành Tòng cách, nên theo ngoại cách, Dụng thần là ' + r.dung + '.' : ' Dụng thần theo cách cục là ' + r.dung + '.';
  return 'Xem theo sách Tử Bình Chân Thuyên, lá số này là ' + CACH_NAME[r.cach] + ', ' + TRANG_THAI[r.trangThai] + '.' + tuong + why;
}

/* "Lời sách cho Can ngày theo tháng sinh" (TU-VAN-SACH mục G, ARCHITECTURE 15.9).
   Nguồn: phụ lục "Bát tự dụng thần đề yếu" cuối bản dịch Tử Bình Chân Thuyên (docs/sach, tr. 204–303), phần "Thường lý"
   (lẽ thường) của từng Can ngày sinh trong từng tháng. Câu chữ dưới đây là lời TÓM TẮT của app, không chép bản dịch;
   số trang để người đọc mở sách đối chiếu. Phần "Biến lý" (các ngoại lệ) chỉ nêu ý chính khi cần.
   uu: can sách xét trước tiên (theo thứ tự); cuong / nhuoc: can sách nêu riêng cho thân mạnh / thân yếu (nếu có). */
import type { Hanh } from '../../core';
import { note, p, type Block, type Section } from '../rich';

export interface ThuongLy { p: number; lenh: string; uu: string; cuong?: string; nhuoc?: string; tom: string }

/** [Can ngày 0..9][tháng theo thứ tự sách: 0 = tháng giêng (Dần) … 11 = tháng chạp (Sửu)] */
export const THUONG_LY: readonly (readonly ThuongLy[])[] = [
  [ // Giáp
    { p: 204, lenh: 'Lộc của Giáp', uu: 'Bính Quý', tom: 'Đầu xuân còn rét: trước hết lấy Bính hoả sưởi ấm cây non, thân mạnh thì Bính còn giúp mộc toả sáng; Quý thuỷ tưới nhuận đi kèm.' },
    { p: 205, lenh: 'Dương Nhận', uu: 'Bính Quý', cuong: 'Canh Mậu Đinh', tom: 'Rét đã lui, mộc rất mạnh. Lẽ thường dùng Bính phối Quý; cũng có lối dùng Canh chế Nhận, Mậu làm Tài giúp Sát, hoặc Đinh tiết khí cho mộc hoả thông minh.' },
    { p: 205, lenh: 'Tài', uu: 'Canh Nhâm', tom: 'Cây đã già, cần Canh kim tỉa gọt và Nhâm thuỷ tưới (sách không lấy Quý vì dễ bị Mậu hợp mất). Canh, Nhâm, Đinh cùng lộ là cách đẹp.' },
    { p: 206, lenh: 'Thực Thần', uu: 'Quý Canh Tân', tom: 'Đầu hè nóng, điều hoà khí hậu là việc gấp: Quý thuỷ là thần chính, Nhâm Quý cần Canh Tân làm nguồn nước.' },
    { p: 207, lenh: 'Thương Quan', uu: 'Quý Nhâm Canh Tân', tom: 'Giữa hè, phải lấy thuỷ điều hậu trước, rồi Canh Tân làm nguồn; đó là lối Thương Quan gặp Ấn.' },
    { p: 208, lenh: 'Tài', uu: 'Quý Canh', cuong: 'Canh Đinh', nhuoc: 'Nhâm Quý Giáp', tom: 'Trước Đại Thử xét như tháng năm (cần thuỷ). Sau Đại Thử kim thuỷ dần tiến: thân mạnh dùng Canh chế hoặc Đinh tiết, thân yếu dùng Ấn và Tỷ Kiếp.' },
    { p: 209, lenh: 'Thất Sát', uu: 'Canh', cuong: 'Canh Đinh', nhuoc: 'Nhâm Quý Bính', tom: 'Canh kim nắm lệnh. Thân mạnh thì chuyên dùng Canh; thân và Sát cùng mạnh thì cần Đinh chế Sát; thân yếu cần Ấn Tỷ, kim thuỷ nhiều thì thêm Bính cho ấm.' },
    { p: 210, lenh: 'Chính Quan', uu: 'Tân', cuong: 'Tân Đinh', nhuoc: 'Bính Nhâm Quý', tom: 'Mộc ở đất kim nên quý ở thân mạnh để dùng Tân Quan. Thân và Sát cùng mạnh thì Đinh chế; thân yếu cần Ấn Tỷ, có Bính càng hay; kim quá nhiều thì lấy Ấn hoá Sát.' },
    { p: 211, lenh: 'Tài', uu: 'Canh Đinh', nhuoc: 'Nhâm Quý Giáp', tom: 'Tháng Tuất có Canh và Đinh: thân mạnh dùng Canh hay Đinh đều quý; thân yếu dùng Ấn Tỷ. Tuất là đất khô, hoả nhiều thì cần chút Quý thuỷ.' },
    { p: 212, lenh: 'Ấn', uu: 'Bính Mậu', cuong: 'Canh Bính Mậu', tom: 'Đầu đông lạnh, điều hậu là gấp: trước hết lấy Bính hoả; Nhâm thuỷ nắm lệnh nên cần Mậu ngăn nước.' },
    { p: 212, lenh: 'Ấn', uu: 'Bính Mậu', nhuoc: 'Giáp Ất', tom: 'Giống tháng Hợi: Bính trước, Mậu sau. Thân yếu thì dựa vào Dần Mão (Lộc, Nhận) chứ không dùng bừa Ấn, vì thuỷ nhiều làm mộc trôi.' },
    { p: 213, lenh: 'Tài', uu: 'Bính', cuong: 'Canh Đinh', nhuoc: 'Giáp Ất', tom: 'Trời rét đất đông, trước hết cần Bính hoả. Thân mạnh mà Canh Đinh cùng lộ là cách đẹp; thân yếu dùng Tỷ Kiếp, chữ Dần (có Giáp có Bính) là tốt nhất.' },
  ],
  [ // Ất
    { p: 214, lenh: 'Kiếp Tài', uu: 'Bính Quý', tom: 'Đầu xuân còn rét: trước dùng Bính hoả, sau mới đến Quý thuỷ tưới nhuận. Bính nhiều hơn Quý thì tốt; Quý nhiều quá thì mộc ướt lạnh.' },
    { p: 215, lenh: 'Lộc của Ất', uu: 'Bính Quý', tom: 'Ất đắc lộc. Thân mạnh dùng hoả tiết, thân yếu cần thuỷ sinh; mộc nhiều dùng Bính, hoả nhiều dùng Quý. Kỵ gặp Canh.' },
    { p: 216, lenh: 'Tài', uu: 'Quý Bính', cuong: 'Bính Đinh', tom: 'Dương khí ngày một sáng: trước dùng Quý, sau dùng Bính, thuỷ hoả giúp nhau. Thân mạnh dùng Bính Đinh tiết khí, nhưng nên có chút thuỷ.' },
    { p: 217, lenh: 'Thương Quan', uu: 'Quý Canh Tân', tom: 'Hoả nóng đất khô, mộc héo: điều hậu là gấp, chuyên dùng Quý thuỷ; thuỷ yếu thì cần Canh Tân làm gốc.' },
    { p: 217, lenh: 'Thực Thần', uu: 'Nhâm Quý Canh Tân', tom: 'Giữa hè chuyên dùng Nhâm Quý; thuỷ yếu thì thích có Canh Tân. Có kim mà không có thuỷ là lá số khô.' },
    { p: 218, lenh: 'Tài', uu: 'Quý Nhâm', nhuoc: 'Quý Nhâm', tom: 'Trước Đại Thử xét như tháng năm. Sau Đại Thử hoả lui, kim thuỷ dần tiến; thân yếu vẫn thích Quý Nhâm, có Dần Mão Hợi giúp là đẹp.' },
    { p: 219, lenh: 'Chính Quan', uu: 'Giáp', cuong: 'Đinh', nhuoc: 'Giáp Nhâm Quý', tom: 'Canh kim nắm quyền, Ất dễ bị tổn: phần nhiều thân yếu, cần Tỷ Kiếp như Giáp hay chữ Dần (dây leo bám cây). Canh lộ thì có lối dùng Kỷ thổ; Ấn hoá Sát cũng được nhưng đề phòng thuỷ quá nhiều; Đinh chế Sát chỉ khi thân mạnh.' },
    { p: 220, lenh: 'Thất Sát', uu: 'Quý Bính', cuong: 'Đinh', nhuoc: 'Quý Giáp', tom: 'Ất ở đất tuyệt, cần thân mạnh. Trước Thu Phân dùng Quý trước Bính sau; sau Thu Phân trời lạnh dần thì Bính trước Quý sau. Thân mạnh dùng Đinh chế Sát.' },
    { p: 221, lenh: 'Tài', uu: 'Quý Canh Tân', nhuoc: 'Giáp', cuong: 'Bính Đinh', tom: 'Đất tháng Tuất khô: chuyên dùng Quý thuỷ tưới nhuận, thích Canh Tân làm nguồn. Tài nhiều thân yếu thì mừng gặp Giáp, chữ Dần.' },
    { p: 222, lenh: 'Ấn', uu: 'Bính Mậu', tom: 'Thuỷ lạnh mộc đông: điều hậu là gấp, trước hết lấy Bính hoả; Nhâm nắm lệnh nên không thể thiếu Mậu ngăn nước.' },
    { p: 222, lenh: 'Ấn', uu: 'Bính', tom: 'Giữa đông chuyên dùng Bính hoả. Bính sợ Nhâm Quý khắc, có Mậu Kỷ giải cứu thì vẫn có lộc.' },
    { p: 223, lenh: 'Tài', uu: 'Bính', nhuoc: 'Giáp', tom: 'Đất ẩm khí rất lạnh: chuyên dùng Bính hoả. Tài nhiều thân yếu thì cần Giáp, chữ Dần giúp thân, nhưng vẫn không thể thiếu Bính.' },
  ],
  [ // Bính
    { p: 224, lenh: 'Ấn', uu: 'Nhâm Canh', nhuoc: 'Giáp Nhâm', tom: 'Bính được mộc sinh, khí tự mạnh. Thân mạnh thích Nhâm (Sát) với Canh (Tài); mộc nhiều làm hoả nghẹt thì dùng Canh phá Ấn; thân yếu dùng Giáp Ấn nhưng vẫn cần thấy Nhâm.' },
    { p: 225, lenh: 'Ấn', uu: 'Nhâm Canh Tân', nhuoc: 'Ất Bính Đinh', tom: 'Mẹ vượng con mạnh, Bính tự cường: chuyên dùng Nhâm, cần Canh Tân trợ. Không có Nhâm thì dùng Kỷ tiết; thân yếu dùng Ấn.' },
    { p: 226, lenh: 'Thực Thần', uu: 'Nhâm Giáp', cuong: 'Nhâm Canh Tân', nhuoc: 'Giáp Nhâm', tom: 'Thổ làm mờ hoả: chuyên dùng Nhâm, và xem Mậu có lộ không để lấy Giáp chế. Thân mạnh dùng Nhâm, có Canh Tân càng đẹp; thân yếu trước dùng Giáp, phụ Nhâm.' },
    { p: 227, lenh: 'Lộc của Bính', uu: 'Nhâm Canh Tân', nhuoc: 'Giáp', tom: 'Hoả quá nóng: chuyên dùng Nhâm thuỷ, thuỷ yếu cần gốc Canh Tân; không có Nhâm thì dùng Quý, kém hơn. Thân yếu dùng Giáp Ấn.' },
    { p: 228, lenh: 'Dương Nhận', uu: 'Nhâm Canh Tân', nhuoc: 'Giáp Ất Nhâm', tom: 'Thân mạnh chuyên dùng Nhâm, Canh Tân phụ giúp; Nhâm bị Đinh hợp hay Mậu chế thì thành tầm thường. Thân yếu dùng Giáp Ất nhưng phải có Nhâm phụ.' },
    { p: 228, lenh: 'Thương Quan', uu: 'Nhâm Canh', nhuoc: 'Giáp Nhâm', tom: 'Trước Đại Thử xét như tháng năm. Sau đó dù hoả thổ còn vượng, dụng thần vẫn không rời Nhâm Canh; thân yếu vẫn dùng Giáp Ấn và cần thấy Nhâm.' },
    { p: 229, lenh: 'Tài', uu: 'Nhâm', nhuoc: 'Giáp Bính Đinh', tom: 'Bính thoái khí, cần thân mạnh. Thân mạnh chuyên dùng Nhâm trong Thân; thân yếu dùng Giáp mộc, Tài vượng phá Ấn thì nhờ Tỷ Kiếp chế Tài.' },
    { p: 230, lenh: 'Tài', uu: 'Nhâm Quý', nhuoc: 'Giáp Bính Đinh', tom: 'Thân mạnh mà Nhâm lộ là tốt; không có Nhâm thì dùng Quý, kém hơn. Thân yếu vẫn dùng Giáp Ấn, Nhâm Giáp cùng lộ là Sát Ấn sinh nhau; Tài quá nhiều thì dùng Tỷ Kiếp.' },
    { p: 231, lenh: 'Thực Thần', uu: 'Giáp Nhâm', cuong: 'Nhâm Canh', tom: 'Hoả vào mộ, kỵ thổ làm mờ: thân yếu thì Giáp là ưu tiên để chế thổ sinh thân, sau mới dùng Nhâm. Thân mạnh chuyên dùng Nhâm Canh.' },
    { p: 232, lenh: 'Thất Sát', uu: 'Giáp', cuong: 'Mậu Nhâm', tom: 'Bính gặp tuyệt địa, thân yếu: chuyên dùng Giáp mộc, Sát Ấn sinh nhau. Nhâm lộ nhiều thì cần Mậu, nhưng phải thân mạnh.' },
    { p: 233, lenh: 'Chính Quan', uu: 'Giáp', cuong: 'Nhâm Quý Mậu', tom: 'Thuỷ vượng hoả yếu: thân yếu chuyên dùng Giáp Ấn hoá Quan Sát. Thân mạnh mới dùng được Quan; Sát mạnh thì cần Mậu chế.' },
    { p: 234, lenh: 'Thương Quan', uu: 'Giáp Bính', cuong: 'Nhâm Canh', tom: 'Bính bị thổ tiết, khí lạnh: thân yếu chuyên dùng Giáp mộc, cần có Bính Tỷ làm ấm cục. Thân mạnh thì thích Nhâm Canh.' },
  ],
  [ // Đinh
    { p: 235, lenh: 'Ấn', uu: 'Canh Giáp', nhuoc: 'Giáp Canh', tom: 'Đinh khá mạnh nhờ mộc. Mộc nhiều làm lửa nghẹt thì cần Canh bổ củi; thân mạnh mà Canh Giáp cùng lộ là quý. Thân yếu chuyên dùng Giáp, có Canh bổ Giáp dẫn Đinh.' },
    { p: 236, lenh: 'Ấn', uu: 'Canh', nhuoc: 'Giáp Canh', tom: 'Đinh không sợ yếu mà sợ mộc ẩm quá nhiều làm lửa tắt: trước hết dùng Canh kim, kỵ Ất. Thân yếu cần thấy Giáp và Canh.' },
    { p: 236, lenh: 'Thương Quan', uu: 'Canh Giáp', tom: 'Mậu thổ tiết hoả, thân yếu: chuyên dùng Canh bổ Giáp để dẫn Đinh. Canh Giáp cùng lộ là đẹp nhất.' },
    { p: 237, lenh: 'Kiếp Tài', uu: 'Quý Nhâm Canh Tân', nhuoc: 'Giáp', tom: 'Đinh dựa uy Bính, hoả vượng. Thân mạnh dùng Quý trước, Nhâm sau; thuỷ yếu thì mừng có gốc Canh Tân. Thân yếu dùng Giáp Ấn.' },
    { p: 238, lenh: 'Lộc của Đinh', uu: 'Nhâm Canh', nhuoc: 'Đinh', tom: 'Thân mạnh chuyên dùng Nhâm Canh; Quý lộ một mình gọi là Độc Sát nắm quyền. Kim thuỷ quá vượng mà thân yếu thì nhờ Đinh Kỷ trong Ngọ.' },
    { p: 239, lenh: 'Thực Thần', uu: 'Giáp Canh Nhâm', cuong: 'Quý Canh', tom: 'Trước Đại Thử xét như tháng năm. Sau Đại Thử hoả lui, thân yếu cần Canh Giáp cùng lộ; Mậu Kỷ lộ thì chuyên dùng Giáp. Thân mạnh dùng Quý hoặc Canh.' },
    { p: 240, lenh: 'Tài', uu: 'Canh Giáp Bính', nhuoc: 'Bính Đinh Giáp', tom: 'Tài nắm lệnh. Thân yếu cần Bính Đinh, Tỵ Ngọ giúp sức, Tỷ Kiếp chia Tài; Canh bổ Giáp dẫn Đinh, có thêm Bính sưởi là đẹp. Thân mạnh chuyên dùng Tài.' },
    { p: 241, lenh: 'Tài', uu: 'Giáp Canh Bính', cuong: 'Nhâm Quý', tom: 'Thân yếu, Giáp Canh Bính cùng lộ là quý; không có Giáp thì dùng Ất, kém bền. Thân mạnh mà Nhâm Quý lộ là Tài sinh Sát.' },
    { p: 241, lenh: 'Thương Quan', uu: 'Giáp', cuong: 'Canh Tân', tom: 'Thổ tiết hoả, thân yếu: chuyên dùng Giáp mộc chế thổ sinh thân. Thân và Thương đều mạnh thì dùng Canh Tân; hoả mộc quá nhiều thì lấy Canh Nhâm.' },
    { p: 242, lenh: 'Chính Quan', uu: 'Giáp Bính', cuong: 'Nhâm Mậu', tom: 'Thân yếu chuyên dùng Giáp như con có mẹ; cần có Bính để mộc ẩm còn cháy được. Hoả mạnh thì dùng Nhâm; Nhâm Quý quá mạnh thì dùng Mậu chế.' },
    { p: 243, lenh: 'Thất Sát', uu: 'Giáp Bính Canh', cuong: 'Mậu Kỷ', tom: 'Thân yếu chuyên dùng Giáp, không thể thiếu Bính sưởi; có Canh bổ Giáp dẫn Đinh là đẹp. Thân và Sát cùng mạnh thì Mậu Kỷ chế Sát.' },
    { p: 244, lenh: 'Thực Thần', uu: 'Giáp Bính', cuong: 'Quý Tân', tom: 'Thân yếu dùng Giáp dẫn Đinh, Bính làm ấm Giáp, hai thứ khó thiếu một. Thân mạnh thì dùng Quý Tân (Tài sinh Sát).' },
  ],
  [ // Mậu
    { p: 245, lenh: 'Thất Sát', uu: 'Bính Giáp Quý', cuong: 'Giáp Quý', nhuoc: 'Bính', tom: 'Còn rét, trước hết lấy Bính hoả. Thân yếu dùng Bính Ấn hoá Sát là tốt nhất; thân mạnh thì Giáp trước Quý sau.' },
    { p: 246, lenh: 'Chính Quan', uu: 'Bính Đinh', cuong: 'Nhâm Quý', tom: 'Mộc khí rất mạnh, thổ bị khắc, thân yếu: dùng Bính Đinh hoá Sát sinh thân. Thân mạnh hoặc hoả Ấn quá nhiều thì lấy Nhâm Quý (Tài phá Ấn).' },
    { p: 246, lenh: 'Tỷ Kiên', uu: 'Giáp Quý Bính', cuong: 'Giáp Quý Bính', nhuoc: 'Bính Giáp Quý', tom: 'Mậu thông khí tháng, thân tự mạnh: Giáp trước, Quý Bính sau. Thân yếu thì Bính trước. Thổ quá dày mộc không khắc nổi thì dùng Canh Tân tiết.' },
    { p: 247, lenh: 'Lộc của Mậu', uu: 'Quý Giáp Nhâm', nhuoc: 'Bính Mậu', tom: 'Đầu hè, điều hậu là gấp: trước hết lấy Quý thuỷ, sau đến Giáp; hoả quá vượng thì dùng Nhâm, có gốc Canh Tân phát thuỷ là đẹp.' },
    { p: 248, lenh: 'Dương Nhận', uu: 'Nhâm Quý Giáp Tân', nhuoc: 'Đinh Kỷ', tom: 'Giữa hè, điều hậu là gấp: trước dùng Nhâm Quý, sau Giáp khai thổ; có Tân làm nguồn nước là đẹp. Thân yếu thì nhờ Đinh Kỷ trong Ngọ.' },
    { p: 249, lenh: 'Kiếp Tài', uu: 'Quý Giáp', cuong: 'Giáp Quý', nhuoc: 'Giáp Đinh', tom: 'Trước Đại Thử xét như tháng năm; sau Đại Thử vẫn cần chút Quý thuỷ. Thân mạnh dùng Giáp Quý, thân yếu dùng Giáp Đinh; thổ vượng mà nhiều kim thì lấy kim tiết.' },
    { p: 250, lenh: 'Thực Thần', uu: 'Bính Đinh', cuong: 'Canh Nhâm Giáp Quý', tom: 'Thổ bị kim tiết, thân yếu: chuyên dùng Bính Đinh Ấn; Tài nhiều thì dùng Tỷ Kiếp. Thân mạnh dùng Canh Nhâm trong tháng, hoặc Giáp Quý; khí bắt đầu lạnh nên nên có Bính.' },
    { p: 251, lenh: 'Thương Quan', uu: 'Bính Đinh', cuong: 'Tân', tom: 'Thổ bị kim tiết nhiều, phải xem thân có gánh nổi không. Thân mạnh dùng Thương Quan (Tân) tiết tú; kim mạnh hơn thổ thì cần Bính Đinh, kỵ Nhâm Quý.' },
    { p: 252, lenh: 'Tỷ Kiên', uu: 'Giáp Quý Bính', nhuoc: 'Bính Đinh', tom: 'Thân không yếu: chuyên dùng Giáp khai thổ, Tuất khô nên thích Quý; Giáp Quý Bính cùng lộ là đẹp. Thân yếu cần Bính Đinh.' },
    { p: 252, lenh: 'Tài', uu: 'Bính Giáp', tom: 'Đầu đông, điều hậu là gấp: chuyên dùng Bính hoả, thân yếu cũng lấy Bính Ấn; Bính Giáp cùng lộ là quý.' },
    { p: 253, lenh: 'Tài', uu: 'Bính Giáp', nhuoc: 'Mậu Bính', tom: 'Điều hậu là gấp, trước dùng Bính; thân yếu mà Bính Giáp cùng lộ là quý. Nhâm Quý lộ, Tài nhiều thân yếu thì dùng Tỷ Kiếp, nhưng phải có Bính.' },
    { p: 254, lenh: 'Kiếp Tài', uu: 'Bính Giáp', tom: 'Thân không yếu, nhưng điều hậu là gấp: Bính hoả ưu tiên, thân yếu thì Bính Giáp. Hoả nhiều thì lấy một chút Nhâm làm Tài phá Ấn.' },
  ],
  [ // Kỷ
    { p: 255, lenh: 'Chính Quan', uu: 'Bính Giáp', cuong: 'Giáp', nhuoc: 'Bính', tom: 'Còn rét, trước cần Bính sưởi ấm, kỵ Nhâm. Thân yếu dùng Bính, thân mạnh dùng Giáp; Bính Giáp cùng lộ, Quý tàng trong chi là cách đẹp.' },
    { p: 256, lenh: 'Thất Sát', uu: 'Bính', cuong: 'Giáp Quý', tom: 'Sát mạnh thân yếu: chuyên dùng Bính hoá Sát sinh thân. Thân mạnh thì thích Giáp khai thổ, Quý tưới nhuận (Tài sinh Quan); mộc quá nhiều thì dùng Canh chế.' },
    { p: 257, lenh: 'Kiếp Tài', uu: 'Bính Giáp Quý', cuong: 'Giáp Quý', nhuoc: 'Bính Giáp', tom: 'Kỷ và Thìn đều là đất ẩm nên vẫn lấy Bính trước. Thân mạnh thích Giáp Quý (Tài Quan); thân yếu dùng Bính Giáp (Quan Ấn).' },
    { p: 257, lenh: 'Ấn', uu: 'Quý Bính Canh', tom: 'Đầu hè, điều hậu là gấp nên Quý thuỷ là trọng, nhưng Kỷ là đất ẩm nên vẫn cần chút Bính; Quý ở tháng này ở đất tuyệt, cần gốc Canh Tân.' },
    { p: 258, lenh: 'Ấn', uu: 'Nhâm Canh Tân', tom: 'Giữa hè, điều hậu là gấp: chuyên dùng Nhâm thuỷ; thuỷ yếu nên cần Canh Tân sinh. Có thuỷ không có kim thì khó bền.' },
    { p: 259, lenh: 'Tỷ Kiên', uu: 'Quý Giáp', tom: 'Mùi là đất khô, vẫn lấy Quý thuỷ tưới là trên hết. Thổ dày thân mạnh, được Giáp khai Quý nhuận là Tài Quan sinh nhau.' },
    { p: 260, lenh: 'Thương Quan', uu: 'Bính Quý', cuong: 'Canh Nhâm', nhuoc: 'Bính', tom: 'Mẹ hư (thổ bị kim tiết): trước dùng Bính chế kim sưởi thổ, sau dùng Quý; thân yếu mà Quý Bính cùng lộ là quý. Thân mạnh dùng Canh tiết, Nhâm nhuận.' },
    { p: 261, lenh: 'Thực Thần', uu: 'Bính Quý', cuong: 'Tân', nhuoc: 'Bính', tom: 'Giống tháng bảy: Bính ưu tiên, Quý phụ. Thân yếu dùng Bính Ấn chế Thực; thân mạnh dùng chính Thực Thần trong tháng.' },
    { p: 261, lenh: 'Kiếp Tài', uu: 'Giáp Bính Quý', cuong: 'Canh Tân Quý', nhuoc: 'Bính Giáp', tom: 'Thân mạnh được Giáp lộ thì giàu; thích Canh Tân tiết tú, Quý tưới nhuận. Thân yếu vẫn cần Bính Giáp.' },
    { p: 262, lenh: 'Tài', uu: 'Bính Giáp', nhuoc: 'Mậu Bính', tom: 'Đầu đông, điều hậu là gấp: trước dùng Bính, kỵ Quý. Tài nhiều thân yếu thì dùng Mậu chia Tài; Sát mạnh thì lấy Bính hoá Sát.' },
    { p: 263, lenh: 'Tài', uu: 'Bính Mậu', nhuoc: 'Mậu Bính', tom: 'Điều hậu là gấp, trước dùng Bính sưởi; Bính kỵ Nhâm Quý khắc nên cần Mậu cứu. Tài nhiều thân yếu thì Mậu trước Bính sau.' },
    { p: 264, lenh: 'Tỷ Kiên', uu: 'Bính Giáp', tom: 'Đất ẩm lạnh: được Bính sưởi ấm, Giáp sinh hoá là Quan Ấn sinh nhau. Kỵ Nhâm Quý lộ làm ruộng ngập; thuỷ nhiều thì cần Mậu chế.' },
  ],
  [ // Canh
    { p: 265, lenh: 'Tài', uu: 'Bính Giáp', nhuoc: 'Kỷ Canh Tân', tom: 'Còn rét, trước dùng hoả sưởi ấm. Tài vượng thân yếu thì cần Canh Tân, Thân Dậu giúp; dùng Ấn thì Mậu dày dễ vùi kim, nên thích Kỷ hơn. Thân mạnh thì Bính lộ là quý, Giáp lộ là giàu.' },
    { p: 265, lenh: 'Tài', uu: 'Canh Tân', cuong: 'Giáp Đinh', tom: 'Tài vượng thân yếu: chuyên dùng Tỷ Kiếp, có Thân Dậu càng tốt; dùng Ấn thì cần hoả tiết mộc trước. Thân mạnh thì Giáp Đinh cùng lộ là quý.' },
    { p: 266, lenh: 'Ấn', uu: 'Giáp Đinh', nhuoc: 'Kỷ Canh Tân', tom: 'Mậu thổ dày, sợ mẹ vượng làm vùi con. Thân mạnh dùng Giáp phá Ấn, thích Đinh luyện kim; thân yếu trước dùng Kỷ, sau dùng Canh Tân, Thân Dậu.' },
    { p: 267, lenh: 'Thất Sát', uu: 'Nhâm Quý', tom: 'Canh trường sinh ở Tỵ nhưng hoả nóng đất khô: điều hậu là gấp, lấy Nhâm Quý làm dụng; thân mạnh hay yếu đều xét Nhâm Quý trước.' },
    { p: 268, lenh: 'Chính Quan', uu: 'Nhâm Quý Canh Tân', nhuoc: 'Kỷ', tom: 'Giữa hè, điều hậu là gấp: chuyên dùng Nhâm, sau mới Quý; thuỷ yếu nên thích Canh Tân. Không có thuỷ mà thân yếu thì có thể lấy Kỷ thổ.' },
    { p: 269, lenh: 'Ấn', uu: 'Đinh Giáp Nhâm', nhuoc: 'Kỷ Canh Tân', tom: 'Trước Đại Thử xét như tháng năm. Sau Đại Thử kim dần tiến: thân mạnh thích Đinh luyện, thổ dày thì cần phối Giáp. Thân yếu trước dùng Kỷ Ấn, sau Canh Tân.' },
    { p: 269, lenh: 'Lộc của Canh', uu: 'Đinh Giáp', nhuoc: 'Kỷ', tom: 'Thân mạnh: chuyên dùng Đinh luyện kim, sau dùng Giáp sinh Đinh; không có Đinh thì dùng Bính. Không có hoả thì dùng Nhâm tiết tú.' },
    { p: 270, lenh: 'Dương Nhận', uu: 'Đinh Giáp Bính', tom: 'Như tháng bảy: chuyên dùng Đinh Giáp; khí lạnh dần nên cần Bính. Kim cục mà không có hoả thì dùng Nhâm tiết tú.' },
    { p: 271, lenh: 'Ấn', uu: 'Giáp Nhâm', cuong: 'Đinh', nhuoc: 'Kỷ Canh Tân', tom: 'Mậu thổ nắm quyền, kỵ thổ dày vùi kim: thân mạnh trước dùng Giáp khai thổ, sau dùng Nhâm rửa kim; thích Đinh luyện. Thân yếu dùng Kỷ hoặc Canh Tân.' },
    { p: 272, lenh: 'Thực Thần', uu: 'Bính Đinh', tom: 'Đầu đông, điều hậu là gấp: chuyên dùng Bính hoả. Bính Đinh kỵ Nhâm Quý lộ; nếu lộ thì cần Mậu Kỷ chế.' },
    { p: 272, lenh: 'Thương Quan', uu: 'Bính Đinh Giáp', nhuoc: 'Mậu Bính', tom: 'Điều hậu là gấp, trước dùng Bính. Thuỷ nhiều thân yếu thì cần Mậu cứu (Ấn chế Thực), nhưng phải có Bính sưởi. Thân mạnh thì Đinh Giáp cùng lộ là quý.' },
    { p: 273, lenh: 'Ấn', uu: 'Bính Đinh Giáp', nhuoc: 'Kỷ Bính', tom: 'Điều hậu là gấp, Bính ưu tiên. Thân yếu chuyên dùng Kỷ thổ nhưng không thể thiếu Bính; thân mạnh thì Bính Giáp Đinh cùng lộ là đẹp.' },
  ],
  [ // Tân
    { p: 274, lenh: 'Tài', uu: 'Kỷ Nhâm Canh', cuong: 'Nhâm', nhuoc: 'Canh Kỷ', tom: 'Còn rét, mừng có Bính sưởi; nhưng Tân mềm yếu, kỵ Quan mạnh thành Sát. Thân yếu chuyên dùng Tỷ Kiếp, dùng Kỷ Ấn cũng cần Canh; Tân thích Nhâm rửa sạch, thân mạnh thấy Nhâm là quý.' },
    { p: 275, lenh: 'Tài', uu: 'Canh Tân', cuong: 'Nhâm Giáp Đinh', nhuoc: 'Kỷ', tom: 'Tài nhiều thân yếu: chuyên dùng Tỷ Kiếp. Thân mạnh dùng Nhâm hoặc Đinh, nhưng không dùng cùng lúc (hoả kỵ thuỷ). Thân yếu dùng Kỷ thì đừng có Giáp lộ.' },
    { p: 276, lenh: 'Ấn', uu: 'Nhâm Giáp', nhuoc: 'Kỷ Canh', tom: 'Mậu thổ nắm quyền, thổ dày sợ vùi kim: tốt nhất có Nhâm Quý tiết tú; dùng Nhâm thì kỵ Mậu, Mậu lộ cần Giáp phá. Thân yếu vẫn dùng Kỷ Ấn hoặc Tỷ Kiếp.' },
    { p: 276, lenh: 'Chính Quan', uu: 'Nhâm Canh Giáp', tom: 'Tân như châu ngọc, kỵ lửa khắc, kỵ thổ dày vùi: trước dùng Nhâm điều hậu, sau dùng Canh giúp thân. Mậu lộ thì cần Giáp cứu. Thân mạnh hay yếu đều xét Nhâm Quý trước.' },
    { p: 277, lenh: 'Thất Sát', uu: 'Nhâm Canh Tân', nhuoc: 'Kỷ Nhâm', tom: 'Điều hậu là gấp: trước dùng Nhâm thuỷ, thích Canh Tân, Thân Dậu trợ giúp. Thân yếu dùng Kỷ Ấn nhưng cũng cần thuỷ, không thì đất khô không sinh được kim.' },
    { p: 278, lenh: 'Ấn', uu: 'Nhâm Canh', tom: 'Mùi là đất khô: lấy Nhâm thuỷ làm ưu tiên, thổ dày thì phụ thêm Canh. Dùng Nhâm rất sợ Mậu Kỷ làm đục; khi đó cần Giáp cứu.' },
    { p: 279, lenh: 'Kiếp Tài', uu: 'Nhâm Giáp', nhuoc: 'Canh Kỷ', tom: 'Tân được Canh giúp, tự mạnh: chuyên dùng Nhâm trong Thân tiết tú; dùng Nhâm thì kỵ Mậu, có Giáp cứu thì đỡ. Thân yếu dùng Canh Kiếp hoặc Kỷ.' },
    { p: 280, lenh: 'Lộc của Tân', uu: 'Nhâm', nhuoc: 'Tân Kỷ', tom: 'Thân mạnh: chuyên dùng Nhâm thuỷ tiết tú (kim trắng nước trong); không có Nhâm thì dùng Đinh, kém hơn. Thân yếu nhờ Tỷ trợ hoặc Kỷ sinh.' },
    { p: 280, lenh: 'Ấn', uu: 'Nhâm Giáp', nhuoc: 'Kỷ Canh Tân', tom: 'Thân không lo yếu, chỉ sợ thổ dày vùi kim: thân mạnh chuyên dùng Nhâm, phối Giáp chế Mậu. Thân yếu vẫn dùng Kỷ hoặc Canh Tân; không có Nhâm thì Quý kém hơn.' },
    { p: 281, lenh: 'Thương Quan', uu: 'Bính Nhâm', nhuoc: 'Mậu Bính', tom: 'Đầu đông, điều hậu là gấp: trước dùng Bính. Thân bị tiết nên cần mạnh, có Canh Tân hay chữ Dậu giúp là cao. Thuỷ quá vượng thì Mậu ngăn nước trước, Bính sau.' },
    { p: 282, lenh: 'Thực Thần', uu: 'Bính Nhâm', nhuoc: 'Bính Kỷ', tom: 'Điều hậu là gấp, trước dùng Bính; Bính Nhâm cùng lộ là đẹp. Thân yếu dùng Bính Kỷ (Quan Ấn sinh nhau) hoặc Canh Tân; thuỷ quá nhiều thì dùng Mậu chế, vẫn cần Bính.' },
    { p: 283, lenh: 'Ấn', uu: 'Bính Nhâm', nhuoc: 'Kỷ Bính', tom: 'Tân không yếu, nhưng đất đông nước lạnh: trước dùng Bính. Thân yếu dùng Kỷ trong Sửu nhưng cần thấy Bính; thân mạnh thích Nhâm tiết tú.' },
  ],
  [ // Nhâm
    { p: 284, lenh: 'Thực Thần', uu: 'Canh Bính', cuong: 'Mậu Bính Giáp', nhuoc: 'Canh', tom: 'Nhâm từ vượng chuyển suy, mộc lại tiết khí nên lo thân yếu: chuyên dùng gốc Canh kim phát nguồn; còn rét nên tốt nhất có Bính. Thân mạnh dùng Giáp Bính Mậu.' },
    { p: 285, lenh: 'Thương Quan', uu: 'Canh Tân', cuong: 'Mậu Bính', tom: 'Mộc quá mạnh, thuỷ bị tiết: thân yếu chuyên dùng Canh Tân; mộc lộ thì không thể thiếu Canh. Thân mạnh chuyên dùng Mậu ngăn thuỷ, thích Bính trợ.' },
    { p: 285, lenh: 'Thất Sát', uu: 'Canh Giáp', cuong: 'Mậu Giáp', tom: 'Mậu thổ nắm quyền, thổ dày lấp thuỷ: thân yếu trước dùng Canh tiết thổ sinh thuỷ, sau dùng Giáp chế thổ. Thân mạnh dùng Mậu chế hoặc Giáp tiết.' },
    { p: 286, lenh: 'Tài', uu: 'Nhâm Tân', cuong: 'Bính Mậu', tom: 'Tài mạnh thân yếu: trước dùng Tỷ Kiếp chia Tài, sau dùng Tân Ấn sinh thân; kim thuỷ cần có nhau. Thuỷ cục quá mạnh thì lấy Bính Mậu.' },
    { p: 287, lenh: 'Tài', uu: 'Quý Canh', cuong: 'Đinh Kỷ', tom: 'Tài mạnh thân yếu, cần Tỷ Kiếp; dùng Nhâm thì sợ Đinh hợp, dùng Tân thì sợ Đinh hại, nên chuyên dùng Quý và Canh. Thân mạnh mới lấy Đinh Kỷ.' },
    { p: 288, lenh: 'Chính Quan', uu: 'Canh Tân Giáp', cuong: 'Đinh Kỷ Bính Mậu', tom: 'Trước Đại Thử xét như tháng năm. Sau đó Kỷ thổ nắm quyền, Nhâm bị khắc: thân yếu dùng Canh Tân, thích Giáp chế thổ; kỵ Đinh. Thân mạnh có thể dùng Đinh Kỷ, Bính Mậu.' },
    { p: 289, lenh: 'Ấn', uu: 'Mậu Đinh', nhuoc: 'Canh', tom: 'Kim thuỷ sinh nhau, Nhâm khá mạnh: trước dùng Mậu chế, sau dùng Đinh chế Canh (Tài giúp Sát). Kỵ Kỷ làm thuỷ đục. Thân yếu thì dùng Canh trong Thân.' },
    { p: 289, lenh: 'Ấn', uu: 'Giáp', nhuoc: 'Tân', tom: 'Mẹ vượng con mạnh: thuỷ mạnh thì lấy Giáp tiết là đẹp (thuỷ mộc thanh hoa). Thân yếu chuyên dùng Tân kim trong tháng.' },
    { p: 290, lenh: 'Thất Sát', uu: 'Canh Tân Giáp', nhuoc: 'Canh Tân Nhâm Quý', tom: 'Thuỷ đang tiến khí nhưng Mậu thổ nắm quyền: thân yếu dùng Canh Tân, hoặc Tỷ Kiếp; Mậu Kỷ lộ mà Sát mạnh thì phải có Giáp chế. Thuỷ cục thì lấy Giáp tiết là hay.' },
    { p: 291, lenh: 'Lộc của Nhâm', uu: 'Bính Mậu', nhuoc: 'Canh Tân Bính', tom: 'Nhâm như sông lớn, điều hậu là gấp: trước dùng Bính sưởi; thuỷ tràn thì mừng có Mậu; Bính Mậu cùng lộ là đẹp. Thân yếu quá thì dùng Canh Tân nhưng vẫn cần Bính.' },
    { p: 292, lenh: 'Dương Nhận', uu: 'Bính Mậu', nhuoc: 'Canh Tân Bính', tom: 'Thuỷ vượng cực, điều hậu là gấp: thân mạnh trước dùng Bính, sau dùng Mậu ngăn nước. Thuỷ quá vượng thì chuyên dùng Giáp tiết. Thân yếu dùng Ấn Tỷ nhưng không thể thiếu Bính.' },
    { p: 292, lenh: 'Chính Quan', uu: 'Bính', nhuoc: 'Canh Tân Bính', tom: 'Điều hậu là gấp, chuyên dùng Bính. Nửa đầu tháng xét như tháng Tý; nửa sau Kỷ thổ nắm quyền, thân yếu dùng Canh Tân nhưng vẫn cần Bính. Mậu Kỷ lộ thì cần Giáp chế.' },
  ],
  [ // Quý
    { p: 293, lenh: 'Thương Quan', uu: 'Tân Bính', cuong: 'Giáp', tom: 'Mộc vượng tiết thuỷ, lại còn rét: dùng Kiếp Ấn giúp thân, mừng Bính sưởi. Thân yếu dùng Tân sinh thuỷ, Bính sưởi ấm; Tân Bính cùng lộ mà không hợp nhau là đẹp. Thân mạnh dùng Giáp tiết tú.' },
    { p: 294, lenh: 'Thực Thần', uu: 'Canh Tân', cuong: 'Đinh Kỷ', tom: 'Mộc mạnh, thuỷ bị tiết: thân yếu chuyên dùng Canh phá Ất, phụ Tân; kỵ Đinh khắc. Thuỷ mạnh mà kim nhiều thì dùng Đinh Kỷ (Tài phá Ấn sinh Sát).' },
    { p: 295, lenh: 'Chính Quan', uu: 'Bính Canh Tân', tom: 'Mậu thổ nắm lệnh, Quý yếu: dùng Canh Tân hoá Sát sinh thân; Mậu Kỷ lộ thì cần Giáp. Trước Cốc Vũ hoả khí chưa mạnh, chuyên dùng Bính; sau Cốc Vũ Quý yếu dần, phải thấy Canh Tân.' },
    { p: 296, lenh: 'Tài', uu: 'Nhâm Tân', cuong: 'Bính Mậu', tom: 'Quý ở đất tuyệt, thân yếu: chuyên dùng Nhâm chế hoả, Tân sinh thuỷ; kỵ Đinh. Thuỷ cục mạnh thì lấy Bính Mậu trong Tỵ.' },
    { p: 297, lenh: 'Tài', uu: 'Nhâm Canh', cuong: 'Đinh Kỷ', tom: 'Đinh Kỷ nắm quyền, Quý rất yếu: trước dùng Nhâm, sau dùng Canh, Kiếp Ấn cùng dùng. Thuỷ chuyên mạnh thì dùng Đinh Kỷ trong tháng.' },
    { p: 297, lenh: 'Thất Sát', uu: 'Nhâm Canh', tom: 'Trước Đại Thử xét như tháng năm, chuyên dùng Nhâm Canh. Sau Đại Thử hoả lui kim tiến, thân yếu dùng Canh Ấn nhưng sợ Đinh phá, nên có Nhâm Quý ở trên là hơn.' },
    { p: 298, lenh: 'Ấn', uu: 'Đinh Mậu', nhuoc: 'Canh Nhâm', tom: 'Kim thuỷ sinh nhau, Quý không yếu: thân mạnh mà kim nhiều thì cần Đinh (Tài), hoặc Mậu có Đinh (Tài sinh Quan). Thân yếu thì dùng kim thuỷ trong Thân.' },
    { p: 299, lenh: 'Ấn', uu: 'Tân Bính', cuong: 'Mậu', tom: 'Kim trắng nước trong: Tân là gốc nguồn, có Bính sưởi ấm cả cục; thân yếu mà Bính Tân cùng lộ, không hợp nhau là đẹp; kỵ Đinh. Thuỷ cục mạnh thì cần Mậu.' },
    { p: 300, lenh: 'Chính Quan', uu: 'Tân Giáp Bính', cuong: 'Mậu', tom: 'Mậu thổ nắm quyền, Quý bị chế: thân yếu chuyên dùng Tân Ấn hoá Sát; hoặc Giáp phá thổ (Thực chế Sát) nhưng cần có gốc; khí lạnh dần nên phối Bính. Thân mạnh thì thích Mậu.' },
    { p: 301, lenh: 'Kiếp Tài', uu: 'Bính', cuong: 'Kỷ Bính', nhuoc: 'Canh Tân', tom: 'Đầu đông, điều hậu là gấp: trước dùng Bính. Thân mạnh dùng Kỷ Sát, nhưng phải có Bính trợ; thân yếu dùng Canh Tân.' },
    { p: 302, lenh: 'Lộc của Quý', uu: 'Bính', nhuoc: 'Canh Tân Bính', tom: 'Điều hậu là gấp, chuyên dùng Bính. Thân yếu trước dùng Canh Tân nhưng không thể thiếu Bính; thuỷ cục tràn thì cần Mậu chế, vẫn cần Bính.' },
    { p: 302, lenh: 'Thất Sát', uu: 'Bính', cuong: 'Mậu Kỷ Bính', nhuoc: 'Canh Tân', tom: 'Điều hậu là gấp, chuyên dùng Bính. Thân mạnh thích Mậu Kỷ, có Bính phụ; thân yếu cần Canh Tân, nhưng trong cục cũng không thể thiếu Bính, Ngọ, Dần.' },
  ],
];

const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const HANH_CAN: readonly Hanh[] = ['Mộc', 'Mộc', 'Hoả', 'Hoả', 'Thổ', 'Thổ', 'Kim', 'Kim', 'Thuỷ', 'Thuỷ'];
export const THANG_TEN = ['tháng giêng (Dần)', 'tháng hai (Mão)', 'tháng ba (Thìn)', 'tháng tư (Tỵ)', 'tháng năm (Ngọ)', 'tháng sáu (Mùi)', 'tháng bảy (Thân)', 'tháng tám (Dậu)', 'tháng chín (Tuất)', 'tháng mười (Hợi)', 'tháng mười một (Tý)', 'tháng chạp (Sửu)'];

/** Chi tháng (Tý = 0) → thứ tự tháng trong sách (Dần = 0). */
export const thangOfChi = (monthChi: number) => (monthChi + 10) % 12;
export const thuongLyOf = (dm: number, monthChi: number): ThuongLy => THUONG_LY[dm][thangOfChi(monthChi)];
export const canList = (s: string | undefined): number[] => (s ? s.split(' ').map((x) => CAN.indexOf(x)) : []);
export const hanhOfCan = (c: number): Hanh => HANH_CAN[c];

export const THUONG_LY_NOTE = 'Đây là lẽ thường sách nêu chung cho mọi người cùng Can ngày, cùng tháng sinh; chính sách cũng kể nhiều ngoại lệ tuỳ cả lá số. App tóm tắt bằng lời của mình, xem nguyên văn ở trang sách ghi kèm. Nội dung mang tính văn hoá, để tham khảo.';

const canHanh = (s: string) => canList(s).map((c) => CAN[c] + ' (' + hanhOfCan(c) + ')').join(', ');

/** Mục "Lời sách cho Can ngày theo tháng sinh". cachDung: Dụng thần của mục Cách cục, để nói hai bên có cùng hướng không. */
export function thuongLySection(dm: number, monthChi: number, cachDung: Hanh): Section {
  const t = thuongLyOf(dm, monthChi);
  const first = hanhOfCan(canList(t.uu)[0]);
  const blocks: Block[] = [
    p('thuongly.dau', '<b>' + CAN[dm] + '</b> sinh ' + THANG_TEN[thangOfChi(monthChi)] + ': ' + t.lenh + ' nắm lệnh tháng. ' + t.tom),
    p('thuongly.uu', '<b>Can sách xét trước:</b> ' + canHanh(t.uu) + '.'
      + (t.cuong ? ' <b>Thân mạnh:</b> ' + canHanh(t.cuong) + '.' : '')
      + (t.nhuoc ? ' <b>Thân yếu:</b> ' + canHanh(t.nhuoc) + '.' : '')),
    p('thuongly.so', first === cachDung
      ? 'Hành đứng đầu trong lời sách (' + first + ') trùng với Dụng thần ở mục Cách cục.'
      : 'Hành đứng đầu trong lời sách là ' + first + ', còn mục Cách cục chọn ' + cachDung + '. '
        + (canList(t.cuong).some((c) => hanhOfCan(c) === cachDung) ? 'Hành ' + cachDung + ' cũng có trong lời sách cho người thân mạnh. '
          : canList(t.nhuoc).some((c) => hanhOfCan(c) === cachDung) ? 'Hành ' + cachDung + ' cũng có trong lời sách cho người thân yếu. '
          : canList(t.uu).some((c) => hanhOfCan(c) === cachDung) ? 'Hành ' + cachDung + ' cũng có trong các can sách xét. ' : '')
        + 'Lời sách ở đây là lẽ chung theo tháng, mục Cách cục xét riêng cả bốn trụ, nên có lúc khác nhau.'),
    p('thuongly.trang', 'Nguồn: phụ lục "Bát tự dụng thần đề yếu" trong bản dịch Tử Bình Chân Thuyên, trang ' + t.p + '.'),
    note('thuongly.note', THUONG_LY_NOTE),
  ];
  return { id: 'thuongly', title: '', blocks };
}

/** Một câu cho Thầy đọc. */
export function thuongLySpeech(dm: number, monthChi: number): string {
  const t = thuongLyOf(dm, monthChi);
  return 'Phụ lục của sách nói chung về ' + CAN[dm] + ' sinh ' + THANG_TEN[thangOfChi(monthChi)].replace(/ \(.*\)/, '') + ': ' + t.tom;
}

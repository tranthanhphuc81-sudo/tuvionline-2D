import { useMemo, useState } from 'react';
import { quickProfile, type BirthInput, type Gender } from './core';

const GIO = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const GIO_RANGE = ['23–01', '01–03', '03–05', '05–07', '07–09', '09–11', '11–13', '13–15', '15–17', '17–19', '19–21', '21–23'];

// Các công cụ sẽ được dựng lại thành màn hình native-style ở Phase 3–5 của PROMPT-KIT.
// Trong lúc đó, bản web đầy đủ đã kiểm chứng vẫn mở được ngay trong app.
const TOOLS = [
  { key: 'tuvi', icon: '🔮', name: 'Tử Vi Đẩu Số', legacy: 'legacy/lyso-toolkit.html#tuvi' },
  { key: 'battu', icon: '📜', name: 'Bát Tự', legacy: 'legacy/lyso-toolkit.html#battu' },
  { key: 'kinhdich', icon: '☯', name: 'Lục Hào', legacy: 'legacy/lyso-toolkit.html#kinhdich' },
  { key: 'phongthuy', icon: '🧭', name: 'Bát Trạch', legacy: 'legacy/lyso-toolkit.html#phongthuy' },
  { key: 'napam', icon: '🌙', name: 'Nạp Âm', legacy: 'legacy/lyso-toolkit.html#napam' },
  { key: 'tonghop', icon: '📊', name: 'Tổng Hợp', legacy: 'legacy/lyso-toolkit.html#tonghop' },
  { key: 'laban', icon: '🧭', name: 'La Bàn Phong Thủy', legacy: 'legacy/la-ban-phong-thuy.html' },
];

export default function App() {
  const [form, setForm] = useState<BirthInput>({ gender: 'M', dd: 15, mm: 6, yy: 1996, hourIdx: 6, lateTy: false });
  const [submitted, setSubmitted] = useState<BirthInput>(form);

  const result = useMemo(() => {
    try {
      return { ok: true as const, data: quickProfile(submitted) };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [submitted]);

  const num = (k: 'dd' | 'mm' | 'yy') => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: parseInt(e.target.value, 10) });

  return (
    <main className="app">
      <header className="hero">
        <div className="eyebrow">Lý Số Trọn Bộ · bản khởi tạo 0.1</div>
        <h1>Tra nhanh mệnh lý</h1>
        <p>Nhập ngày sinh dương lịch để xem nhanh 4 hệ thống. Các màn hình chi tiết đang được dựng lại; trong lúc đó bạn vẫn mở được bản web đầy đủ ở phần dưới.</p>
      </header>

      <form
        className="card"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(form);
        }}
      >
        <div className="seg" role="radiogroup" aria-label="Giới tính">
          {(['M', 'F'] as Gender[]).map((g) => (
            <button key={g} type="button" aria-pressed={form.gender === g} onClick={() => setForm({ ...form, gender: g })}>
              {g === 'M' ? 'Nam' : 'Nữ'}
            </button>
          ))}
        </div>
        <div className="grid3">
          <label>Ngày<input type="number" inputMode="numeric" min={1} max={31} value={form.dd || ''} onChange={num('dd')} /></label>
          <label>Tháng<input type="number" inputMode="numeric" min={1} max={12} value={form.mm || ''} onChange={num('mm')} /></label>
          <label>Năm<input type="number" inputMode="numeric" min={1900} max={2100} value={form.yy || ''} onChange={num('yy')} /></label>
        </div>
        <label>
          Giờ sinh
          <select value={form.hourIdx} onChange={(e) => setForm({ ...form, hourIdx: parseInt(e.target.value, 10) })}>
            {GIO.map((g, i) => (
              <option key={g} value={i}>Giờ {g} ({GIO_RANGE[i]})</option>
            ))}
          </select>
        </label>
        {form.hourIdx === 0 && (
          <label className="check">
            <input type="checkbox" checked={!!form.lateTy} onChange={(e) => setForm({ ...form, lateTy: e.target.checked })} />
            Sinh 23:00–23:59 (Tý muộn) — tính sang ngày hôm sau
          </label>
        )}
        <button className="primary" type="submit">Xem kết quả</button>
      </form>

      {!result.ok && <div className="error" role="alert">{result.error}</div>}

      {result.ok && (
        <section className="results" aria-live="polite">
          <article className="card">
            <h2>🔮 Tử Vi</h2>
            <p>Âm lịch {result.data.tuvi.lunar.day}/{result.data.tuvi.lunar.month}{result.data.tuvi.lunar.leap ? ' (nhuận)' : ''}/{result.data.tuvi.lunar.year}</p>
            <p>Cung Mệnh <b>{result.data.tuvi.menhChi}</b>{result.data.tuvi.menhStars.length ? ` — ${result.data.tuvi.menhStars.join(', ')}` : ' — Vô Chính Diệu'} · Cung Thân <b>{result.data.tuvi.thanChi}</b></p>
            <p>Cục <b>{result.data.tuvi.cucTen}</b></p>
          </article>
          <article className="card">
            <h2>📜 Bát Tự</h2>
            <p className="pillars">{result.data.battu.pillars.join(' · ')}</p>
            <p>Nhật Chủ <b>{result.data.battu.nhatChu}</b> (hành {result.data.battu.nhatChuHanh})</p>
          </article>
          <article className="card">
            <h2>🧭 Bát Trạch</h2>
            <p>Mệnh Quái <b>{result.data.battrach.quai}</b> (hành {result.data.battrach.hanh}) · {result.data.battrach.nhom}</p>
            {result.data.battrach.beforeLapXuan && <p className="muted">Sinh trước Lập Xuân → tính theo năm {result.data.battrach.lySoYear}</p>}
          </article>
          <article className="card">
            <h2>🌙 Nạp Âm</h2>
            <p><b>{result.data.napam.ten}</b> — {result.data.napam.canChiTen} (hành {result.data.napam.hanh})</p>
            {result.data.napam.beforeTet && <p className="muted">Sinh trước Tết → thuộc năm âm lịch {result.data.napam.lunar.year}</p>}
          </article>
        </section>
      )}

      <section>
        <h2 className="section-title">Bộ công cụ đầy đủ (bản web đã kiểm chứng)</h2>
        <div className="tools">
          {TOOLS.map((t) => (
            <a key={t.key} className="tool" href={t.legacy}>
              <span aria-hidden="true">{t.icon}</span> {t.name}
            </a>
          ))}
        </div>
      </section>

      <footer className="muted">Công cụ mang tính văn hoá, tham khảo — không phải căn cứ để đưa ra quyết định quan trọng.</footer>
    </main>
  );
}

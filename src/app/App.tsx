/* Khung app: thanh trên (tiêu đề, chip người đang xem, ⚙) + 5 tab giữ nguyên khi ẩn + thanh tab dưới. */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useAppCtx, useApp, useNav } from './context';
import { TABS, type Route, type TabId } from './routes';
import { useStore } from '../state/store';
import { recordVisit, selectActiveProfile } from '../state/actions';
import { StudyScreen, AskTalk } from '../features/study/StudyScreen';
import { lazyScreen } from './lazyScreen';
import { ScreenBoundary } from './ScreenBoundary';
import { studyTitle } from '../content/study';
import { ProfileSheet } from '../features/profiles/ProfileSheet';
import { PALM_RESULT_TITLE, PALM_TITLE } from '../content/palm/ui';
import { XEMNGAY_TITLE } from '../content/xemngay';
import { initials } from '../features/profiles/format';
import { Journey } from '../features/journey/Journey';
import { recordEntry, todayEntry, type TodayEntry } from '../features/journey/gate';
import { onPause } from '../platform/lifecycle';
import { setPreferredVoice, stopReading } from '../platform/tts';
import { ReadingBar } from '../ui/components/ReadingBar';
import s from './App.module.css';

/* Nạp khi cần (ARCHITECTURE 4.2): Xem chỉ tay (đo 13/11/2026), và từ 27/11/2026 bốn tab Tử Vi, Bát Tự, Lục Hào, Phong thủy
   (dựng ở lần đầu bấm vào tab, rồi giữ mount như cũ) cùng các màn con Tổng hợp, Xem ngày, Cài đặt, Hồ sơ; khung Hỏi chuyện
   Thầy nạp ở StudyScreen. Gói chính chỉ còn Tĩnh thất,
   lối vào và phần dùng chung, để app mở nhanh hơn trên máy yếu. */
const PalmScreen = lazyScreen(() => import('../features/palm/PalmScreen'), (m) => m.PalmScreen);
const PalmResultScreen = lazyScreen(() => import('../features/palm/PalmResultScreen'), (m) => m.PalmResultScreen);
const HomeScreen = lazyScreen(() => import('../features/home/HomeScreen'), (m) => m.HomeScreen);
const TuViScreen = lazyScreen(() => import('../features/tuvi/TuViScreen'), (m) => m.TuViScreen);
const BatTuScreen = lazyScreen(() => import('../features/battu/BatTuScreen'), (m) => m.BatTuScreen);
const LucHaoScreen = lazyScreen(() => import('../features/luchao/LucHaoScreen'), (m) => m.LucHaoScreen);
const PhongThuyScreen = lazyScreen(() => import('../features/phongthuy/PhongThuyScreen'), (m) => m.PhongThuyScreen);
const XemNgayScreen = lazyScreen(() => import('../features/xemngay/XemNgayScreen'), (m) => m.XemNgayScreen);
const SettingsScreen = lazyScreen(() => import('../features/settings/SettingsScreen'), (m) => m.SettingsScreen);
const ProfilesScreen = lazyScreen(() => import('../features/profiles/ProfilesScreen'), (m) => m.ProfilesScreen);
const ProfileEditScreen = lazyScreen(() => import('../features/profiles/ProfileEditScreen'), (m) => m.ProfileEditScreen);
/** Gói nạp sau, tải sẵn theo thứ tự hay dùng. */
const LATER = [HomeScreen, AskTalk, TuViScreen, BatTuScreen, LucHaoScreen, PhongThuyScreen, XemNgayScreen, SettingsScreen, ProfilesScreen, ProfileEditScreen, PalmScreen, PalmResultScreen];
/** Tải mọi gói nạp sau; test gọi trước khi dựng app để màn hình hiện ngay như khi đã tải sẵn. */
export const preloadLater = () => Promise.all(LATER.map((x) => x.preload()));
/** Tải sẵn các gói nạp sau khi app rảnh (vài giây sau khi mở) để lần đầu bấm vào không khựng, và để APK thử (tải giao diện
    từ Cloudflare) vẫn mở được các tab khi mạng rớt sau đó. Lỗi mạng thì bỏ qua: lúc mở màn sẽ tải lại. Chỉ tải mã JS,
    không tải mô hình MediaPipe. */
const PREFETCH_DELAY_MS = 4000;
function prefetchLater(): () => void {
  let idle: number | undefined;
  const run = () => { for (const x of LATER) x.preload().catch(() => {}); };
  const timer = setTimeout(() => {
    if (typeof window.requestIdleCallback === 'function') idle = window.requestIdleCallback(run, { timeout: 5000 });
    else run();
  }, PREFETCH_DELAY_MS);
  return () => { clearTimeout(timer); if (idle !== undefined) window.cancelIdleCallback?.(idle); };
}

function routeTitle(r: Route): string {
  switch (r.name) {
    case 'home': return studyTitle(new Date());
    case 'tonghop': return 'Tổng hợp';
    case 'tuvi': return 'Tử Vi Đẩu Số';
    case 'battu': return 'Bát Tự';
    case 'luchao': return 'Lục Hào';
    case 'phongthuy': return 'Phong thủy';
    case 'palm': return PALM_TITLE;
    case 'palm.result': return PALM_RESULT_TITLE;
    case 'xemngay': return XEMNGAY_TITLE;
    case 'profiles': return 'Quản lý hồ sơ';
    case 'profiles.edit': return r.id ? 'Sửa hồ sơ' : 'Thêm hồ sơ';
    case 'settings': return 'Cài đặt';
  }
}

function renderRoute(r: Route): ReactNode {
  switch (r.name) {
    case 'home': return <StudyScreen />;
    case 'tonghop': return <ScreenBoundary what="Tổng hợp" retry={HomeScreen.preload} className={s.screen}><HomeScreen /></ScreenBoundary>;
    case 'tuvi': return <ScreenBoundary what="Tử Vi" retry={TuViScreen.preload} className={s.screen}><TuViScreen /></ScreenBoundary>;
    case 'battu': return <ScreenBoundary what="Bát Tự" retry={BatTuScreen.preload} className={s.screen}><BatTuScreen /></ScreenBoundary>;
    case 'luchao': return <ScreenBoundary what="Lục Hào" retry={LucHaoScreen.preload} className={s.screen}><LucHaoScreen /></ScreenBoundary>;
    case 'phongthuy': return <ScreenBoundary what="Phong thủy" retry={PhongThuyScreen.preload} className={s.screen}><PhongThuyScreen sub={r.sub} /></ScreenBoundary>;
    case 'palm': return <ScreenBoundary what="Xem chỉ tay" retry={PalmScreen.preload} className={s.screen}><PalmScreen /></ScreenBoundary>;
    case 'palm.result': return <ScreenBoundary what="kết quả chỉ tay" retry={PalmResultScreen.preload} className={s.screen}><PalmResultScreen id={r.id} /></ScreenBoundary>;
    case 'xemngay': return <ScreenBoundary what="Xem ngày" retry={XemNgayScreen.preload} className={s.screen}><XemNgayScreen /></ScreenBoundary>;
    case 'profiles': return <ScreenBoundary what="hồ sơ" retry={ProfilesScreen.preload} className={s.screen}><ProfilesScreen /></ScreenBoundary>;
    case 'profiles.edit': return <ScreenBoundary what="hồ sơ" retry={ProfileEditScreen.preload} className={s.screen}><ProfileEditScreen id={r.id} /></ScreenBoundary>;
    case 'settings': return <ScreenBoundary what="Cài đặt" retry={SettingsScreen.preload} className={s.screen}><SettingsScreen /></ScreenBoundary>;
  }
}

function TopBar() {
  const nav = useNav();
  const profile = useApp(selectActiveProfile);
  const [sheet, setSheet] = useState(false);
  return (
    <header className={s.topbar}>
      {nav.depth > 1 && (
        <button type="button" className={s.iconBtn} aria-label="Quay lại" onClick={nav.back}>
          <span aria-hidden="true">←</span>
        </button>
      )}
      <h1 className={s.title}>{routeTitle(nav.route)}</h1>
      <button type="button" className={s.chip} aria-label={profile ? `Đang xem: ${profile.name}. Đổi hồ sơ` : 'Chọn hoặc thêm hồ sơ'} onClick={() => setSheet(true)}>
        <span className={s.chipAvatar} aria-hidden="true">{profile ? initials(profile.name) : '＋'}</span>
        <span className={s.chipName}>{profile ? profile.name : 'Hồ sơ'}</span>
      </button>
      {nav.route.name !== 'settings' && (
        <button type="button" className={s.iconBtn} aria-label="Cài đặt" onClick={() => nav.push({ name: 'settings' })}>
          <span aria-hidden="true">⚙</span>
        </button>
      )}
      <ProfileSheet open={sheet} onClose={() => setSheet(false)} />
    </header>
  );
}

/** Một tab: dựng ở lần đầu được chọn rồi luôn mount (ẩn bằng `hidden`), giữ vị trí cuộn riêng; các màn hình dưới đỉnh ngăn
    xếp cũng giữ mount. Chưa chọn lần nào thì khung trống, để gói của tab chưa phải nạp lúc mở app (ARCHITECTURE 4.2). */
function TabPanel({ tab, active }: { tab: TabId; active: boolean }) {
  const { nav } = useAppCtx();
  const seen = useRef(false);
  if (active) seen.current = true;
  const stack = useStore(nav, (x) => x.stacks[tab]);
  const ref = useRef<HTMLDivElement>(null);
  const scroll = useRef(new Map<number, number>());
  const depth = stack.length;
  useLayoutEffect(() => {
    if (active && ref.current) ref.current.scrollTop = scroll.current.get(depth) ?? 0;
  }, [active, depth]);
  return (
    <div
      ref={ref}
      className={s.panel}
      hidden={!active}
      role="tabpanel"
      id={`panel-${tab}`}
      aria-labelledby={`tab-${tab}`}
      onScroll={(e) => scroll.current.set(depth, e.currentTarget.scrollTop)}
    >
      {seen.current && stack.map((r, i) => (
        <div key={i + ':' + r.name} hidden={i !== depth - 1} className={s.screen}>{renderRoute(r)}</div>
      ))}
    </div>
  );
}

function TabBar() {
  const nav = useNav();
  return (
    <nav className={s.tabbar} aria-label="Công cụ">
      <div role="tablist" className={s.tablist}>
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            type="button"
            role="tab"
            aria-selected={nav.tab === t.id}
            aria-controls={`panel-${t.id}`}
            className={s.tab}
            onClick={() => nav.selectTab(t.id)}
          >
            <span className={s.tabIcon} aria-hidden="true">{t.icon}</span>
            <span className={s.tabLabel}>{t.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/** `journey` chỉ bật ở main.tsx; test khung app không chạy hành trình. */
export function App({ journey = false }: { journey?: boolean }) {
  const nav = useNav();
  const { store, epoch } = useAppCtx();
  const journeySound = useApp((x) => x.settings.journeySound);
  const [entry, setEntry] = useState<TodayEntry>(() => (journey ? todayEntry(store) : { plan: 'none', today: '' }));
  useEffect(() => recordEntry(store, entry), [store, entry]);
  // sổ ghé thăm ở Tĩnh thất (ARCHITECTURE 16.2); chỉ app thật, test khung app không ghi
  useEffect(() => { if (journey) recordVisit(store); }, [store, journey]);
  const activeId = useApp((x) => x.activeProfileId);
  // Đọc thành lời tự dừng khi rời màn hình, đổi người đang xem hoặc app vào nền
  const routeKey = nav.tab + JSON.stringify(nav.route);
  useEffect(() => stopReading, [routeKey, activeId]);
  useEffect(() => onPause(stopReading), []);
  const ttsVoice = useApp((x) => x.settings.ttsVoice);
  useEffect(() => setPreferredVoice(ttsVoice ?? null), [ttsVoice]);
  useEffect(() => (journey ? prefetchLater() : undefined), [journey]);
  return (
    <div className={s.shell}>
      <TopBar />
      <main key={epoch} className={s.content}>
        {TABS.map((t) => <TabPanel key={t.id} tab={t.id} active={nav.tab === t.id} />)}
      </main>
      <ReadingBar />
      <TabBar />
      {entry.plan !== 'none' && <Journey plan={entry.plan} sound={journeySound} onDone={() => setEntry({ plan: 'none', today: '' })} />}
    </div>
  );
}

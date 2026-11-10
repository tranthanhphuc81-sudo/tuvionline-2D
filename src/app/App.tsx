/* Khung app: thanh trên (tiêu đề, chip người đang xem, ⚙) + 5 tab giữ nguyên khi ẩn + thanh tab dưới. */
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useAppCtx, useApp, useNav } from './context';
import { TABS, type Route, type TabId } from './routes';
import { useStore } from '../state/store';
import { selectActiveProfile } from '../state/actions';
import { HomeScreen } from '../features/home/HomeScreen';
import { StudyScreen } from '../features/study/StudyScreen';
import { studyTitle } from '../content/study';
import { ProfilesScreen } from '../features/profiles/ProfilesScreen';
import { ProfileEditScreen } from '../features/profiles/ProfileEditScreen';
import { ProfileSheet } from '../features/profiles/ProfileSheet';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { PhongThuyScreen } from '../features/phongthuy/PhongThuyScreen';
import { TuViScreen } from '../features/tuvi/TuViScreen';
import { BatTuScreen } from '../features/battu/BatTuScreen';
import { LucHaoScreen } from '../features/luchao/LucHaoScreen';
import { PalmScreen } from '../features/palm/PalmScreen';
import { PalmResultScreen } from '../features/palm/PalmResultScreen';
import { PALM_RESULT_TITLE, PALM_TITLE } from '../content/palm/ui';
import { initials } from '../features/profiles/format';
import { Journey } from '../features/journey/Journey';
import { recordEntry, todayEntry, type TodayEntry } from '../features/journey/gate';
import { onPause } from '../platform/lifecycle';
import { setPreferredVoice, stopReading } from '../platform/tts';
import { ReadingBar } from '../ui/components/ReadingBar';
import s from './App.module.css';

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
    case 'profiles': return 'Quản lý hồ sơ';
    case 'profiles.edit': return r.id ? 'Sửa hồ sơ' : 'Thêm hồ sơ';
    case 'settings': return 'Cài đặt';
  }
}

function renderRoute(r: Route): ReactNode {
  switch (r.name) {
    case 'home': return <StudyScreen />;
    case 'tonghop': return <HomeScreen />;
    case 'tuvi': return <TuViScreen />;
    case 'battu': return <BatTuScreen />;
    case 'luchao': return <LucHaoScreen />;
    case 'phongthuy': return <PhongThuyScreen sub={r.sub} />;
    case 'palm': return <PalmScreen />;
    case 'palm.result': return <PalmResultScreen id={r.id} />;
    case 'profiles': return <ProfilesScreen />;
    case 'profiles.edit': return <ProfileEditScreen id={r.id} />;
    case 'settings': return <SettingsScreen />;
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

/** Một tab: luôn mount (ẩn bằng `hidden`), giữ vị trí cuộn riêng; các màn hình dưới đỉnh ngăn xếp cũng giữ mount. */
function TabPanel({ tab, active }: { tab: TabId; active: boolean }) {
  const { nav } = useAppCtx();
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
      {stack.map((r, i) => (
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
  const activeId = useApp((x) => x.activeProfileId);
  // Đọc thành lời tự dừng khi rời màn hình, đổi người đang xem hoặc app vào nền
  const routeKey = nav.tab + JSON.stringify(nav.route);
  useEffect(() => stopReading, [routeKey, activeId]);
  useEffect(() => onPause(stopReading), []);
  const ttsVoice = useApp((x) => x.settings.ttsVoice);
  useEffect(() => setPreferredVoice(ttsVoice ?? null), [ttsVoice]);
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

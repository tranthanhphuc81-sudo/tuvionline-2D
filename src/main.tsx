import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './ui/fonts';
import './ui/tokens.css';
import './ui/base.css';
import { App } from './app/App';
import { AppProvider } from './app/context';
import { boot } from './app/boot';

const root = createRoot(document.getElementById('root')!);
boot().then(
  ({ store, nav, notice }) => {
    root.render(
      <StrictMode>
        <AppProvider store={store} nav={nav} notice={notice}>
          <App />
        </AppProvider>
      </StrictMode>,
    );
  },
  (e: unknown) => {
    root.render(<p style={{ padding: 16 }}>Không khởi động được ứng dụng: {String(e)}</p>);
  },
);

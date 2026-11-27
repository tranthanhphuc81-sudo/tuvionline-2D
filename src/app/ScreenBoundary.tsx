/* Bọc một màn nạp khi cần (ARCHITECTURE 4.2): tải gói lỗi (APK thử mất mạng trước khi kịp tải sẵn) thì chỉ màn đó báo lỗi
   kèm nút "Thử lại", phần còn lại của app vẫn chạy. Không có khung này thì lỗi của React.lazy làm trắng cả app. */
import { Component, Suspense, type ReactNode } from 'react';
import ui from '../ui/components/ui.module.css';

interface Props { what: string; retry(): Promise<unknown>; children: ReactNode; className?: string }
interface State { failed: boolean; trying: boolean; round: number }

export class ScreenBoundary extends Component<Props, State> {
  state: State = { failed: false, trying: false, round: 0 };
  static getDerivedStateFromError(): Partial<State> { return { failed: true }; }
  private again = () => {
    this.setState({ trying: true });
    // Tải lại được thì dựng lại màn (key mới): lazyScreen thấy gói đã có nên dựng thẳng, không dùng lại lần nạp đã lỗi
    this.props.retry().then(
      () => this.setState((s) => ({ failed: false, trying: false, round: s.round + 1 })),
      () => this.setState({ trying: false }),
    );
  };
  render() {
    const { what, children, className } = this.props;
    if (this.state.failed) {
      return (
        <div className={className} role="alert">
          <p>Chưa mở được {what}: có thể mạng đang chập chờn. Kiểm tra kết nối rồi thử lại.</p>
          <button type="button" className={`${ui.btn} ${ui.block}`} disabled={this.state.trying} onClick={this.again}>
            {this.state.trying ? 'Đang thử lại…' : 'Thử lại'}
          </button>
        </div>
      );
    }
    return <Suspense key={this.state.round} fallback={<p className={className} role="status">Đang mở {what}…</p>}>{children}</Suspense>;
  }
}

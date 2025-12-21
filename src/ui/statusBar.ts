import { Plugin, setIcon } from 'obsidian';
import { Quote } from '../services/hitokoto';

export class StatusBarComponent {
    private statusBarItem: HTMLElement;
    private textEl: HTMLElement;
    private tooltipEl: HTMLElement;
    private currentQuote: Quote | null = null;
    private onClickCallback: () => void;

    constructor(plugin: Plugin, onClickCallback: () => void) {
        this.statusBarItem = plugin.addStatusBarItem();
        this.onClickCallback = onClickCallback;

        // 添加自定义类，设置为相对定位
        this.statusBarItem.addClass("marginalia-status-item");

        // 创建气泡元素：默认隐藏
        this.tooltipEl = this.statusBarItem.createDiv({ cls: "marginalia-tooltip" });

        // 创建图标容器
        const iconEl = this.statusBarItem.createSpan({ cls: "marginalia-icon" });
        // 设置图标
        setIcon(iconEl, "quote-glyph");

        // 创建文字容器并保存引用
        this.textEl = this.statusBarItem.createSpan({ cls: "marginalia-text" });

        // 绑定事件
        this.bindEvents();
    }

    private bindEvents(): void {
        // 左键点击刷新
        this.statusBarItem.addEventListener('click', (e: MouseEvent) => {
            if (e.button === 0) { // 左键
                this.onClickCallback();
            }
        });

        // 右键点击复制到剪贴板
        this.statusBarItem.addEventListener('contextmenu', (e: MouseEvent) => {
            e.preventDefault();
            void this.copyQuoteToClipboard();
        });
    }

    updateQuote(quote: Quote): void {
        this.currentQuote = quote;

        // 更新状态栏显示
        this.textEl.textContent = quote.content;

        // 更新自定义气泡提示内容
        this.tooltipEl.setText(quote.source ? `from ${quote.source}` : "from Unknown");
    }

    private async copyQuoteToClipboard(): Promise<void> {
        if (!this.currentQuote) {
            return;
        }

        const textToCopy = this.currentQuote.content;

        try {
            await navigator.clipboard.writeText(textToCopy);

            // 可以添加一个短暂的提示
            this.showTemporaryMessage('已复制到剪贴板');
        } catch (err) {
            console.error('Failed to copy quote:', err);
        }
    }

    private showTemporaryMessage(message: string): void {
    // 保存当前的文本和提示
    const originalText = this.textEl.textContent || '';
    
    // 显示临时消息
    this.textEl.textContent = `✓ ${message}`;
    this.tooltipEl.setText(message);
    
    // 2秒后恢复原状
    setTimeout(() => {
      if (this.currentQuote) {
        this.updateQuote(this.currentQuote);
      } else {
        this.textEl.textContent = originalText;
        this.tooltipEl.setText('');
      }
    }, 2000);
  }

  clear(): void {
    this.textEl.textContent = '';
    this.tooltipEl.setText('');
    this.currentQuote = null;
  }

  remove(): void {
    this.statusBarItem.parentElement?.removeChild(this.statusBarItem);
  }

  getCurrentQuote(): Quote | null {
    return this.currentQuote;
  }
}

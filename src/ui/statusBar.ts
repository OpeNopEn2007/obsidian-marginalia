import { Plugin, setIcon } from 'obsidian';
import { Quote } from '../services/hitokoto';
import { t } from '../lang/locale';

export class StatusBarComponent {
    private statusBarItem: HTMLElement;
    private textEl: HTMLElement;
    private tooltipEl: HTMLElement;
    private currentQuote: Quote | null = null;
    private onClickCallback: () => void;
    private plugin: Plugin;

    constructor(plugin: Plugin, onClickCallback: () => void) {
        this.plugin = plugin;
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
        // 使用 registerDomEvent 以符合 Obsidian 插件规范
        this.plugin.registerDomEvent(this.statusBarItem, 'click', (e: MouseEvent) => {
            if (e.button === 0) { // 左键
                this.onClickCallback();
            }
        });

        this.plugin.registerDomEvent(this.statusBarItem, 'contextmenu', (e: MouseEvent) => {
            e.preventDefault();
            void this.copyQuoteToClipboard();
        });
    }

    updateQuote(quote: Quote): void {
        this.currentQuote = quote;

        // 更新状态栏显示
        this.textEl.textContent = quote.content;

        // 更新自定义气泡提示内容
        // 使用 — 作为通用分隔符，避免 "from" 的翻译问题
        this.tooltipEl.setText(quote.author ? `— ${quote.author}` : t("from Unknown"));
    }

    private async copyQuoteToClipboard(): Promise<void> {
        if (!this.currentQuote) {
            return;
        }

        try {
            await navigator.clipboard.writeText(this.currentQuote.content);

            // 可以添加一个短暂的提示
            this.showTemporaryMessage(t('Copied to clipboard'));
        } catch (err) {
            console.error('Failed to copy quote:', err);
        }
    }

    private showTemporaryMessage(message: string): void {
    // 保存当前的文本和提示
    const originalText = this.textEl.textContent || '';
    const originalTooltipText = this.tooltipEl.textContent || '';
    
    // 显示临时消息
    this.textEl.textContent = `✓ ${message}`;
    this.tooltipEl.setText(message);
    
    // 2秒后恢复原状
    setTimeout(() => {
      // If quote hasn't changed, restore.
      // But check if currentQuote is still the same?
      // The original code re-called updateQuote(this.currentQuote).
      if (this.currentQuote) {
        this.updateQuote(this.currentQuote);
      } else {
        this.textEl.textContent = originalText;
        this.tooltipEl.setText(originalTooltipText);
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

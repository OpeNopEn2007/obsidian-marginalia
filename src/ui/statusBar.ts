import { Plugin, Platform } from 'obsidian';
import { Quote } from '../services/hitokoto';

export class StatusBarComponent {
    private statusBarItem: HTMLElement;
    private currentQuote: Quote | null = null;
    private onClickCallback: () => void;

    constructor(plugin: Plugin, onClickCallback: () => void) {
        this.statusBarItem = plugin.addStatusBarItem();
        this.statusBarItem.style.textAlign = 'center';
        this.onClickCallback = onClickCallback;

        
        this.statusBarItem.title = '点击刷新格言，右键复制';

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
            this.copyQuoteToClipboard();
        });
    }

    updateQuote(quote: Quote): void {
        this.currentQuote = quote;

        // 更新状态栏显示
        this.statusBarItem.textContent = `💡 ${quote.content}`;

        // 更新悬浮提示，只显示来源
        this.statusBarItem.title = `from ${quote.source || 'Unknown'}`;
    }

    private async copyQuoteToClipboard(): Promise<void> {
        if (!this.currentQuote) {
            return;
        }

        const textToCopy = this.currentQuote.content;

        try {
            if (Platform.isDesktopApp) {
                // 桌面端使用剪贴板 API
                await navigator.clipboard.writeText(textToCopy);
            } else {
                // 移动端或其他环境使用 fallback
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }

            // 可以添加一个短暂的提示
            this.showTemporaryMessage('已复制到剪贴板');
        } catch (err) {
            console.error('Failed to copy quote:', err);
        }
    }

    private showTemporaryMessage(message: string): void {
    // 保存当前的文本和提示
    const originalText = this.statusBarItem.textContent || '';
    const originalTooltip = this.statusBarItem.title;
    
    // 显示临时消息
    this.statusBarItem.textContent = `✓ ${message}`;
    this.statusBarItem.title = message;
    
    // 2秒后恢复原状
    setTimeout(() => {
      if (this.currentQuote) {
        this.updateQuote(this.currentQuote);
      } else {
        this.statusBarItem.textContent = originalText;
        this.statusBarItem.title = originalTooltip;
      }
    }, 2000);
  }

  clear(): void {
    this.statusBarItem.textContent = '';
    this.statusBarItem.title = '';
    this.currentQuote = null;
  }

  remove(): void {
    this.statusBarItem.parentElement?.removeChild(this.statusBarItem);
  }

  getCurrentQuote(): Quote | null {
    return this.currentQuote;
  }
}

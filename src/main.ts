import { Plugin, Notice, moment } from 'obsidian';
import { MarginaliaSettings, DEFAULT_SETTINGS, MarginaliaSettingTab } from './settings';
import { HitokotoService, Quote } from './services/hitokoto';
import { QuotableService } from './services/quotable';
import { QuoteManager } from './services/quoteManager';
import { StatusBarComponent } from './ui/statusBar';
import { t } from './lang/locale';

export default class MarginaliaPlugin extends Plugin {
  public settings!: MarginaliaSettings;
  private hitokotoService!: HitokotoService;
  private quotableService!: QuotableService;
  private quoteManager!: QuoteManager;
  private statusBarComponent!: StatusBarComponent;
  private refreshTimer: number | null = null;

  onload(): void {
    void this.initialize();
  }

  private async initialize(): Promise<void> {
    await this.loadSettings();

    this.hitokotoService = new HitokotoService();
    this.quotableService = new QuotableService();
    const customQuotes = this.settings.customQuotes?.trim()
      ? this.settings.customQuotes
      : t("Default Custom Quotes");
    this.quoteManager = new QuoteManager(customQuotes);

    this.statusBarComponent = new StatusBarComponent(this, () => void this.refreshQuote());

    this.addSettingTab(new MarginaliaSettingTab(this.app, this));

    void this.refreshQuote();
    this.updateRefreshTimer();
  }

  onunload(): void {
    // 清理定时器
    this.clearRefreshTimer();

    if (this.statusBarComponent) {
      this.statusBarComponent.remove();
    }
    
    // 重点：直接调用，不要加 return，前面可以加个 void 确保类型安全
    void this.saveSettings();
  }

  async loadSettings() {
    const loadedData = (await this.loadData()) as Partial<MarginaliaSettings> | null;
    const isZh = moment.locale().startsWith('zh');
    
    // 智能默认值逻辑：仅当首次安装（无数据或无 dataSource）时执行
    const defaultSource: 'hitokoto' | 'quotable' = isZh ? 'hitokoto' : 'quotable';
    
    // 构造有效的默认设置
    const effectiveDefaults = Object.assign({}, DEFAULT_SETTINGS, { 
        dataSource: defaultSource
    });

    this.settings = { ...effectiveDefaults, ...(loadedData ?? {}) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
    // 更新本地格言管理器
    const customQuotes = this.settings.customQuotes?.trim() ? this.settings.customQuotes : t("Default Custom Quotes");
    this.quoteManager.loadQuotes(customQuotes);
  }

  async refreshQuote() {
    try {
      let quote: Quote;

      if (this.settings.dataSource === 'hitokoto') {
        // 从一言API获取
        quote = await this.hitokotoService.getRandomQuote(this.settings.hitokotoCategories);
        
        // 检查是否与当前显示的内容相同，如果相同则重试一次
        const currentQuote = this.statusBarComponent.getCurrentQuote();
        if (currentQuote && quote.content === currentQuote.content) {
          quote = await this.hitokotoService.getRandomQuote(this.settings.hitokotoCategories);
        }
      } else if (this.settings.dataSource === 'quotable') {
        // 从 Quotable API 获取 (含 ZenQuotes 回退)
        quote = await this.quotableService.getRandomQuote();
      } else {
        // 从本地自定义列表获取
        quote = this.quoteManager.getRandomQuote() ?? {
          content: t('Please add custom quotes in settings'),
          author: 'Marginalia'
        };
      }

      // 更新状态栏显示
      this.statusBarComponent.updateQuote(quote);
      
      // 根据引用类型显示不同的通知
      if (quote.type === 'error') {
          // 如果是 Hitokoto 返回的错误对象
          new Notice(`Marginalia Error: ${quote.content}`);
      } else {
          // 显示刷新成功提示
          new Notice(t('Quote refreshed'));
      }
    } catch (error) {
      console.error('Failed to refresh quote:', error);
      // 显示错误提示
      this.statusBarComponent.updateQuote({
        content: t('Fetch Error'),
        author: 'Marginalia'
      });
      
      // 显示错误通知
      if (error instanceof Error) {
          new Notice(`Marginalia Error: ${error.message}`);
      } else {
          new Notice(`Marginalia Error: ${t('Fetch Error')}`);
      }
    }
  }

  public updateRefreshTimer() {
    // 清除现有定时器
    this.clearRefreshTimer();

    // 如果启用了自动刷新，设置新的定时器
    if (this.settings.autoRefresh && this.settings.refreshInterval > 0) {
      const intervalMs = this.settings.refreshInterval * 60 * 1000;
      // 使用 window.setInterval 获取 ID
      const id = window.setInterval(() => {
        void this.refreshQuote();
      }, intervalMs);
      
      // 注册 interval 以便 Obsidian 管理
      this.registerInterval(id);
      this.refreshTimer = id;
    }
  }

  private clearRefreshTimer() {
    if (this.refreshTimer) {
      window.clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

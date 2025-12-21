import { Plugin, Notice } from 'obsidian';
// Test auto sync functionality
import { MarginaliaSettings, DEFAULT_SETTINGS, MarginaliaSettingTab } from './settings';
import { HitokotoService, Quote } from './services/hitokoto';
import { QuoteManager } from './services/quoteManager';
import { StatusBarComponent } from './ui/statusBar';

export default class MarginaliaPlugin extends Plugin {
  public settings!: MarginaliaSettings;
  private hitokotoService!: HitokotoService;
  private quoteManager!: QuoteManager;
  private statusBarComponent!: StatusBarComponent;
  private refreshTimer: number | null = null;

  async onload() {
    // 加载设置
    await this.loadSettings();

    // 初始化服务
    this.hitokotoService = new HitokotoService();
    this.quoteManager = new QuoteManager(this.settings.customQuotes);

    // 创建状态栏组件
    this.statusBarComponent = new StatusBarComponent(this, () => void this.refreshQuote());

    // 注册设置面板
    this.addSettingTab(new MarginaliaSettingTab(this.app, this));

    // 初始加载格言
    void this.refreshQuote();

    // 设置定时刷新
    this.updateRefreshTimer();
  }

  onunload() {
    // 清理定时器
    this.clearRefreshTimer();

    // 移除状态栏组件
    this.statusBarComponent.remove();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
    // 更新本地格言管理器
    this.quoteManager.loadQuotes(this.settings.customQuotes);
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
      } else {
        // 从本地自定义列表获取
        const randomQuote = this.quoteManager.getRandomQuote();
        if (randomQuote) {
          quote = randomQuote;
        } else {
          // 如果本地列表为空，显示提示信息
          quote = {
            content: '请在设置中添加自定义格言',
            source: 'Marginalia'
          };
        }
      }

      // 更新状态栏显示
      this.statusBarComponent.updateQuote(quote);
      // 显示刷新成功提示
      new Notice('格言已刷新');
    } catch (error) {
      console.error('Failed to refresh quote:', error);
      // 显示错误提示
      this.statusBarComponent.updateQuote({
        content: '获取格言失败，请检查网络或设置',
        source: 'Marginalia'
      });
    }
  }

  public updateRefreshTimer() {
    // 清除现有定时器
    this.clearRefreshTimer();

    // 如果启用了自动刷新，设置新的定时器
    if (this.settings.autoRefresh && this.settings.refreshInterval > 0) {
      const intervalMs = this.settings.refreshInterval * 60 * 1000;
      this.refreshTimer = window.setInterval(() => {
        void this.refreshQuote();
      }, intervalMs);
    }
  }

  private clearRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}

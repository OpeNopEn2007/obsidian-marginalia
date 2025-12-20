import { Plugin } from 'obsidian';
import { MarginaliaSettings, DEFAULT_SETTINGS, MarginaliaSettingTab } from './settings';
import { HitokotoService, Quote } from './services/hitokoto';
import { QuoteManager } from './services/quoteManager';
import { StatusBarComponent } from './ui/statusBar';

export default class MarginaliaPlugin extends Plugin {
  public settings: MarginaliaSettings;
  private hitokotoService: HitokotoService;
  private quoteManager: QuoteManager;
  private statusBarComponent: StatusBarComponent;
  private refreshTimer: number | null = null;

  async onload() {
    // 加载设置
    await this.loadSettings();

    // 初始化服务
    this.hitokotoService = new HitokotoService();
    this.quoteManager = new QuoteManager(this.settings.customQuotes);

    // 创建状态栏组件
    this.statusBarComponent = new StatusBarComponent(this, () => this.refreshQuote());

    // 注册设置面板
    this.addSettingTab(new MarginaliaSettingTab(this.app, this));

    // 初始加载格言
    this.refreshQuote();

    // 设置定时刷新
    this.updateRefreshTimer();

    // 输出加载信息
    console.log('Marginalia plugin loaded');
  }

  async onunload() {
    // 清理定时器
    this.clearRefreshTimer();

    // 移除状态栏组件
    this.statusBarComponent.remove();

    // 输出卸载信息
    console.log('Marginalia plugin unloaded');
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
    } catch (error) {
      console.error('Failed to refresh quote:', error);
      // 显示错误提示
      this.statusBarComponent.updateQuote({
        content: '获取格言失败，请检查网络或设置',
        source: 'Marginalia'
      });
    }
  }

  private updateRefreshTimer() {
    // 清除现有定时器
    this.clearRefreshTimer();

    // 如果启用了自动刷新，设置新的定时器
    if (this.settings.autoRefresh && this.settings.refreshInterval > 0) {
      const intervalMs = this.settings.refreshInterval * 60 * 1000;
      this.refreshTimer = window.setInterval(() => {
        this.refreshQuote();
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

import { App, PluginSettingTab, Setting, ToggleComponent, Notice, moment } from 'obsidian';
import MarginaliaPlugin from './main';
import { t } from './lang/locale';

export interface MarginaliaSettings {
  dataSource: 'hitokoto' | 'quotable' | 'custom';
  hitokotoCategories: string[];
  customQuotes: string;
  refreshInterval: number; // 分钟
  autoRefresh: boolean;
}

export const DEFAULT_SETTINGS: MarginaliaSettings = {
  dataSource: 'hitokoto',
  hitokotoCategories: ['a', 'b', 'd', 'i', 'k'], // 动画、漫画、文学、诗词、哲学
  customQuotes: '',
  refreshInterval: 5,
  autoRefresh: true
};

export class MarginaliaSettingTab extends PluginSettingTab {
  private plugin: MarginaliaPlugin;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(app: App, plugin: MarginaliaPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName(t('Marginalia')).setHeading();

    // 数据源选择
    new Setting(containerEl)
      .setName(t('Data Source'))
      .setDesc(t('Choose the source of quotes'))
      .addDropdown((dropdown) => {
        dropdown
          .addOption('hitokoto', t('Hitokoto API'))
          .addOption('quotable', t('Quotable API'))
          .addOption('custom', t('Local Custom List'))
          .setValue(this.plugin.settings.dataSource)
          .onChange((value) => {
            this.plugin.settings.dataSource = value as 'hitokoto' | 'quotable' | 'custom';
            void (async () => {
              await this.plugin.saveSettings();
              await this.plugin.refreshQuote();
              // 刷新设置面板，显示/隐藏相关选项
              this.display();
            })();
          });
      });

    // 一言分类设置（仅当数据源为一言时显示）
    if (this.plugin.settings.dataSource === 'hitokoto') {
      new Setting(containerEl).setName(t('Hitokoto Categories')).setHeading();
      containerEl.createEl('p', { text: t('Select categories to fetch:') });

      // 分类列表
      const categoryMap: Record<string, string> = {
        'a': '动画',
        'b': '漫画',
        'c': '游戏',
        'd': '文学',
        'e': '原创',
        'f': '网络',
        'g': '其他',
        'h': '影视',
        'i': '诗词',
        'j': '网易云',
        'k': '哲学',
        'l': '抖机灵'
      };

      // 按类别分组
      const categoryGroups = Object.entries(categoryMap).sort(([, a], [, b]) =>
        String(a).localeCompare(String(b))
      );

      // 创建分类选择区域
      const categoriesContainer = containerEl.createEl('div', { cls: 'marginalia-categories-container' });

      categoryGroups.forEach(([code, name]) => {
        const categoryCode = String(code);
        const categoryName = String(name);
        const categoryItem = categoriesContainer.createEl('div', { cls: 'marginalia-category-item' });
        const toggle = new ToggleComponent(categoryItem);
        
        toggle.setValue(this.plugin.settings.hitokotoCategories.includes(categoryCode));
        toggle.onChange((value) => {
          if (value) {
            if (!this.plugin.settings.hitokotoCategories.includes(categoryCode)) {
              this.plugin.settings.hitokotoCategories.push(categoryCode);
            }
          } else {
            this.plugin.settings.hitokotoCategories = this.plugin.settings.hitokotoCategories.filter(c => c !== categoryCode);
          }
          void (async () => {
            await this.plugin.saveSettings();
            await this.plugin.refreshQuote();
          })();
        });

        categoryItem.createEl('span', { 
          text: categoryName, 
          cls: 'marginalia-category-name' 
        });
      });
    }

    // 自定义格言列表（仅当数据源为自定义时显示）
    if (this.plugin.settings.dataSource === 'custom') {
      new Setting(containerEl)
        .setName(t('Custom Quotes List'))
        .setDesc(t('One quote per line, format: Content | Source'))
        .addTextArea((textarea) => {
          textarea
            .setPlaceholder(t('Default Custom Quotes'))
            .setValue(this.plugin.settings.customQuotes)
            .onChange((value) => {
              // 清除旧的定时器
              if (this.debounceTimer) clearTimeout(this.debounceTimer);
              
              // 设置新的定时器，延迟 1000ms
              this.debounceTimer = setTimeout(() => {
                this.plugin.settings.customQuotes = value;
                void (async () => {
                  await this.plugin.saveSettings();
                  await this.plugin.refreshQuote();
                })();
              }, 1000);
            });
          textarea.inputEl.addClass('marginalia-textarea');
        });
    }

    // 自动刷新设置
    new Setting(containerEl)
      .setName(t('Auto Refresh'))
      .setDesc(t('Whether to refresh quotes automatically'))
      .addToggle((toggle) => {
        toggle
          .setValue(this.plugin.settings.autoRefresh)
          .onChange((value) => {
            this.plugin.settings.autoRefresh = value;
            void (async () => {
              await this.plugin.saveSettings();
              this.plugin.updateRefreshTimer();
            })();
          });
      });

    // 刷新间隔设置（仅当自动刷新开启时显示）
    if (this.plugin.settings.autoRefresh) {
      new Setting(containerEl)
        .setName(t('Refresh Interval'))
        .setDesc(t('Interval in minutes'))
        .addSlider((slider) => {
          slider
            .setLimits(1, 60, 1)
            .setValue(this.plugin.settings.refreshInterval)
            .setDynamicTooltip()
            .onChange((value) => {
              this.plugin.settings.refreshInterval = value;
              void (async () => {
                await this.plugin.saveSettings();
                this.plugin.updateRefreshTimer();
              })();
            });
        });
    }

    // 手动刷新按钮
    new Setting(containerEl)
      .setName(t('Manual Refresh'))
      .setDesc(t('Refresh current quote immediately'))
      .addButton((button) => {
        button
          .setButtonText(t('Refresh'))
          .onClick(() => {
            void this.plugin.refreshQuote();
          });
      });

    // 重置设置按钮
    new Setting(containerEl)
      .setName(t('Reset Settings'))
      .setDesc(t('Restore default settings'))
      .addButton((button) => {
        button
          .setButtonText(t('Reset'))
          .setWarning()
          .onClick(() => {
            void (async () => {
              const isZh = moment.locale().startsWith('zh');
              const dynamicDefaults: MarginaliaSettings = {
                ...DEFAULT_SETTINGS,
                dataSource: isZh ? 'hitokoto' : 'quotable'
              };
              
              this.plugin.settings = { ...dynamicDefaults };
              await this.plugin.saveSettings();
              await this.plugin.refreshQuote();
              this.display();
              new Notice(t('Settings reset'));
            })();
          });
      });
  }
}

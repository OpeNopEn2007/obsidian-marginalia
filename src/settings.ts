import { App, PluginSettingTab, Setting, ToggleComponent, Notice } from 'obsidian';
import MarginaliaPlugin from './main';

export interface MarginaliaSettings {
  dataSource: 'hitokoto' | 'custom';
  hitokotoCategories: string[];
  customQuotes: string;
  refreshInterval: number; // 分钟
  autoRefresh: boolean;
}

export const DEFAULT_SETTINGS: MarginaliaSettings = {
  dataSource: 'hitokoto',
  hitokotoCategories: ['a', 'b', 'd', 'i', 'k'], // 动画、漫画、文学、诗词、哲学
  customQuotes: `天天开心！ | 开开
Live long and prosper!
要有天才般的自信，以及蠢才般的谦卑 | Open Open`,
  refreshInterval: 5,
  autoRefresh: true
};

export class MarginaliaSettingTab extends PluginSettingTab {
  private plugin: MarginaliaPlugin;
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor(app: App, plugin: MarginaliaPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName('插件设置').setHeading();

    // 数据源选择
    new Setting(containerEl)
      .setName('数据源')
      .setDesc('选择格言的来源')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('hitokoto', '一言 API')
          .addOption('custom', '本地自定义列表')
          .setValue(this.plugin.settings.dataSource)
          .onChange((value) => {
            this.plugin.settings.dataSource = value as 'hitokoto' | 'custom';
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
      new Setting(containerEl).setName('一言分类').setHeading();
      containerEl.createEl('p', { text: '选择要获取的格言分类：' });

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
      const categoryGroups = Object.entries(categoryMap).sort(([, a], [, b]) => a.localeCompare(b));

      // 创建分类选择区域
      const categoriesContainer = containerEl.createEl('div', { cls: 'marginalia-categories-container' });

      categoryGroups.forEach(([code, name]) => {
        const categoryItem = categoriesContainer.createEl('div', { cls: 'marginalia-category-item' });
        const toggle = new ToggleComponent(categoryItem);
        
        toggle.setValue(this.plugin.settings.hitokotoCategories.includes(code));
        toggle.onChange((value) => {
          if (value) {
            if (!this.plugin.settings.hitokotoCategories.includes(code)) {
              this.plugin.settings.hitokotoCategories.push(code);
            }
          } else {
            this.plugin.settings.hitokotoCategories = this.plugin.settings.hitokotoCategories.filter(c => c !== code);
          }
          void (async () => {
            await this.plugin.saveSettings();
            await this.plugin.refreshQuote();
          })();
        });

        categoryItem.createEl('span', { 
          text: name, 
          cls: 'marginalia-category-name' 
        });
      });
    }

    // 自定义格言列表（仅当数据源为自定义时显示）
    if (this.plugin.settings.dataSource === 'custom') {
      new Setting(containerEl)
        .setName('自定义格言列表')
        .setDesc('一行一条格言，支持格式：内容 | 来源')
        .addTextArea((textarea) => {
          textarea
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
      .setName('自动刷新')
      .setDesc('是否自动刷新格言')
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
        .setName('刷新间隔')
        .setDesc('格言自动刷新的时间间隔（分钟）')
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
      .setName('手动刷新')
      .setDesc('立即刷新当前格言')
      .addButton((button) => {
        button
          .setButtonText('刷新')
          .onClick(() => {
            void this.plugin.refreshQuote();
          });
      });

    // 重置设置按钮
    new Setting(containerEl)
      .setName('重置设置')
      .setDesc('恢复默认设置')
      .addButton((button) => {
        button
          .setButtonText('重置')
          .setWarning()
          .onClick(() => {
            void (async () => {
              this.plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
              await this.plugin.saveSettings();
              await this.plugin.refreshQuote();
              this.display();
              new Notice('设置已重置');
            })();
          });
      });
  }
}

import { moment } from 'obsidian';

const en = {
  // Settings
  "Plugin Settings": "Plugin Settings",
  "Data Source": "Data Source",
  "Choose the source of quotes": "Choose the source of quotes",
  "Hitokoto API": "Hitokoto API (Chinese)",
  "Quotable API": "Quotable API (English)",
  "Local Custom List": "Local Custom List",
  "Hitokoto Categories": "Hitokoto Categories",
  "Select categories to fetch:": "Select categories to fetch:",
  "Custom Quotes List": "Custom Quotes List",
  "One quote per line, format: Content | Source": "One quote per line, format: Content | Source",
  "Auto Refresh": "Auto Refresh",
  "Whether to refresh quotes automatically": "Whether to refresh quotes automatically",
  "Refresh Interval": "Refresh Interval",
  "Interval in minutes": "Interval in minutes",
  "Manual Refresh": "Manual Refresh",
  "Refresh current quote immediately": "Refresh current quote immediately",
  "Refresh": "Refresh",
  "Reset Settings": "Reset Settings",
  "Restore default settings": "Restore default settings",
  "Reset": "Reset",
  
  // UI
  "Copied to clipboard": "Copied to clipboard",
  "Quote refreshed": "Quote refreshed",
  "Settings reset": "Settings reset",
  "from Unknown": "from Unknown",
  "Custom": "Custom",
  
  "Default Custom Quotes": `Be happy every day! | Open Open
Live long and prosper! | Star Trek
Stay hungry, stay foolish. | Steve Jobs`,

  // Errors
  "Fetch Error": "Failed to fetch quote, please check network",
  "Please add custom quotes in settings": "Please add custom quotes in settings",
};

const zhCN: typeof en = {
  // Settings
  "Plugin Settings": "插件设置",
  "Data Source": "数据源",
  "Choose the source of quotes": "选择格言的来源",
  "Hitokoto API": "一言 API (中文)",
  "Quotable API": "Quotable API (英文)",
  "Local Custom List": "本地自定义列表",
  "Hitokoto Categories": "一言分类",
  "Select categories to fetch:": "选择要获取的格言分类：",
  "Custom Quotes List": "自定义格言列表",
  "One quote per line, format: Content | Source": "一行一条格言，支持格式：内容 | 来源",
  "Auto Refresh": "自动刷新",
  "Whether to refresh quotes automatically": "是否自动刷新格言",
  "Refresh Interval": "刷新间隔",
  "Interval in minutes": "格言自动刷新的时间间隔（分钟）",
  "Manual Refresh": "手动刷新",
  "Refresh current quote immediately": "立即刷新当前格言",
  "Refresh": "刷新",
  "Reset Settings": "重置设置",
  "Restore default settings": "恢复默认设置",
  "Reset": "重置",
  
  // UI
  "Copied to clipboard": "已复制到剪贴板",
  "Quote refreshed": "格言已刷新",
  "Settings reset": "设置已重置",
  "from Unknown": "来自 未知",
  "Custom": "自定义",
  
  "Default Custom Quotes": `天天开心！ | 开开
既寿永昌！ | 《星际迷航》
求知若饥，虚心若愚。 | 史蒂夫·乔布斯`,

  // Errors
  "Fetch Error": "获取格言失败，请检查网络",
  "Please add custom quotes in settings": "请在设置中添加自定义格言",
};

export function t(str: keyof typeof en): string {
  const locale = moment.locale();
  if (locale.startsWith('zh')) {
    return zhCN[str];
  }
  return en[str];
}

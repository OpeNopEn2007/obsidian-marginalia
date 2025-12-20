export interface HitokotoResponse {
  id: string;
  hitokoto: string;
  type: string;
  from: string;
  from_who?: string;
  creator: string;
  created_at: string;
}

export interface Quote {
  content: string;
  source: string;
  type?: string;
}

import { request } from 'obsidian';

export class HitokotoService {
  private readonly API_URL = 'https://v1.hitokoto.cn/';

  async getRandomQuote(categories?: string[]): Promise<Quote> {
    try {
      // 必须使用 URLSearchParams 来正确处理重复参数
      const url = new URL(this.API_URL);
      if (categories && categories.length > 0) {
          categories.forEach(category => {
              url.searchParams.append("c", category);
              // 关键点：append 会生成 ?c=a&c=b 而不是 ?c=a,b
          });
      }
      
      const response = await request({
        url: url.toString(),
        method: 'GET'
      });

      const data: HitokotoResponse = JSON.parse(response);
      
      return {
        content: data.hitokoto,
        source: data.from || '未知来源',
        type: data.type
      };
    } catch (error) {
      console.error('Failed to fetch hitokoto:', error);
      // 返回默认值，避免插件崩溃
      return {
        content: '获取格言失败，请检查网络或设置',
        source: 'Marginalia',
        type: 'error'
      };
    }
  }

  getCategoryName(type: string): string {
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
    
    return categoryMap[type] || type;
  }
}

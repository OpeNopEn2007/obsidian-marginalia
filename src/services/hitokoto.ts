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

export class HitokotoService {
  private readonly API_URL = 'https://v1.hitokoto.cn/';

  async getRandomQuote(categories?: string[]): Promise<Quote> {
    try {
      let url = this.API_URL;
      
      if (categories && categories.length > 0) {
        const c = categories.join(',');
        url = `${this.API_URL}?c=${c}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: HitokotoResponse = await response.json();
      
      return {
        content: data.hitokoto,
        source: data.from || '未知来源',
        type: data.type
      };
    } catch (error) {
      console.error('Failed to fetch hitokoto:', error);
      throw error;
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

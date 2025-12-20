import { Quote } from './hitokoto';

export class QuoteManager {
  private quotes: Quote[] = [];

  constructor(quotesString: string = '') {
    this.loadQuotes(quotesString);
  }

  loadQuotes(quotesString: string): void {
    this.quotes = [];
    
    if (!quotesString.trim()) {
      return;
    }

    const lines = quotesString.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // 支持简单的格式：内容 | 来源
        const parts = trimmedLine.split('|').map(p => p.trim());
        
        if (parts.length >= 2) {
          this.quotes.push({
            content: parts[0],
            source: parts[1]
          });
        } else {
          this.quotes.push({
            content: trimmedLine,
            source: '自定义'
          });
        }
      }
    }
  }

  getRandomQuote(): Quote | null {
    if (this.quotes.length === 0) {
      return null;
    }

    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    return this.quotes[randomIndex];
  }

  getQuoteCount(): number {
    return this.quotes.length;
  }

  addQuote(quote: Quote): void {
    this.quotes.push(quote);
  }

  clearQuotes(): void {
    this.quotes = [];
  }

  formatQuotes(): string {
    return this.quotes.map(q => {
      if (q.source && q.source !== '自定义') {
        return `${q.content} | ${q.source}`;
      }
      return q.content;
    }).join('\n');
  }
}

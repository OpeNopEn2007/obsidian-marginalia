import { requestUrl } from 'obsidian';
import { Quote } from './hitokoto';
import { t } from '../lang/locale';

interface QuotableResponse {
  content: string;
  author: string;
}

interface ZenQuotesResponse {
  q: string;
  a: string;
}

export class QuotableService {
  async getRandomQuote(): Promise<Quote> {
    try {
      // Primary: Quotable
      const response = await requestUrl({
        url: 'https://api.quotable.io/random',
        method: 'GET'
      });
      const data = response.json as QuotableResponse;
      return {
        content: data.content,
        author: data.author
      };
    } catch (error) {
      console.warn('Quotable API failed, switching to fallback...', error);
      try {
        // Fallback: ZenQuotes
        const response = await requestUrl({
          url: 'https://zenquotes.io/api/random',
          method: 'GET'
        });
        const data = response.json as ZenQuotesResponse[];
        if (data && data.length > 0) {
            return {
                content: data[0].q,
                author: data[0].a
            };
        }
        throw new Error('ZenQuotes returned empty array');
      } catch (fallbackError) {
        console.error('All quote services failed:', fallbackError);
        throw new Error(t('Fetch Error'));
      }
    }
  }
}

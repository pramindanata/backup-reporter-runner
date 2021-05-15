import { singleton } from 'tsyringe';
import { ConfigHelperContract } from '@/contract';

@singleton()
export class ConfigHelper implements ConfigHelperContract {
  private cache = {} as Record<string, any>;

  constructor(private config: Record<string, any>) {}

  get(key: string): any {
    if (this.cache[key]) {
      return this.cache[key];
    }

    const keyParts = (key as string).split('.');
    const exploredPart: string[] = [];
    let crawled: string | Record<string, any> = this.config;

    keyParts.forEach((part) => {
      exploredPart.push(part);

      if (typeof crawled === 'object') {
        crawled = crawled[part];
      } else {
        const failPath = exploredPart.join('.');

        throw new InvalidConfigKeyException(failPath);
      }
    });

    if (typeof crawled !== 'object') {
      this.cache[key] = crawled;

      return crawled;
    } else {
      const failPath = exploredPart.join('.');

      throw new InvalidConfigKeyException(failPath);
    }
  }
}

class InvalidConfigKeyException extends Error {
  constructor(failPath: string) {
    super(`Invalid config key "${failPath}" given`);
  }
}

import { inject, singleton } from 'tsyringe';
import { ConfigHelperContract, ConfigKey } from '@/contract';
import { Token } from '@/common';

@singleton()
export class ConfigHelper implements ConfigHelperContract<ConfigKey> {
  private cache = {} as Record<string, any>;

  constructor(
    @inject(Token.Config)
    private config: Record<string, any>,
  ) {}

  get<K extends keyof ConfigKey>(key: K): ConfigKey[K] {
    if (this.cache[key]) {
      return this.cache[key];
    }

    const keyParts = (key as string).split('.');
    const exploredPart: string[] = [];
    let narrowedConfig: NarrowedConfig = this.config;

    keyParts.forEach((part) => {
      exploredPart.push(part);

      if (this.shouldTraverseDeep(narrowedConfig)) {
        narrowedConfig = narrowedConfig[part];
      } else {
        const failPath = exploredPart.join('.');

        throw new InvalidConfigKeyException(failPath);
      }
    });

    this.cache[key] = narrowedConfig;

    return narrowedConfig;
  }

  private shouldTraverseDeep(narrowedConfig: NarrowedConfig): boolean {
    return typeof narrowedConfig === 'object';
  }
}

type NarrowedConfig = any | Record<string, any>;

class InvalidConfigKeyException extends Error {
  constructor(failPath: string) {
    super(`Invalid config key "${failPath}" given`);
  }
}

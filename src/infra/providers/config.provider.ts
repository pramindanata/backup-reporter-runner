import { Token } from '@/common';
import { DependencyContainer } from 'tsyringe';
import { getConfig } from '../config';

export function registerConfigProvider(container: DependencyContainer): void {
  container.register(Token.Config, {
    useValue: getConfig(),
  });
}

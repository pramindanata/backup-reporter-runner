import { container } from 'tsyringe';
import { Publisher } from '@/core/publisher';
import { config } from '@/config';
import { FakePublisher } from '@/core/fake/publisher';

container.register(Publisher, {
  useFactory: (baseContainer) => {
    if (config.app.enableReport) {
      return baseContainer.resolve(Publisher);
    }

    return baseContainer.resolve(FakePublisher);
  },
});

export { container };

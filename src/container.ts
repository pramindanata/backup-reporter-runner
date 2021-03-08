import { container } from 'tsyringe';
import { Publisher } from '@/core/publisher';
import { config } from '@/config';
import { FakePublisher } from '@/core/fake/publisher';
import { Interface } from './constant';

container.register(Interface.BasePublisher, {
  useFactory: (baseContainer) => {
    if (config.app.enableReportDelivery) {
      return baseContainer.resolve(Publisher);
    }

    return baseContainer.resolve(FakePublisher);
  },
});

export { container };

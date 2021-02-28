import JSZip from 'jszip';
import { container, instanceCachingFactory } from 'tsyringe';

container.register(JSZip, {
  useFactory: instanceCachingFactory(() => {
    return new JSZip();
  }),
});

export { container };

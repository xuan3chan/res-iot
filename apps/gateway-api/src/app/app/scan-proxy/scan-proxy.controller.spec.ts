import { Test, TestingModule } from '@nestjs/testing';
import { ScanProxyController } from './scan-proxy.controller';

describe('ScanProxyController', () => {
  let controller: ScanProxyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScanProxyController],
    }).compile();

    controller = module.get<ScanProxyController>(ScanProxyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

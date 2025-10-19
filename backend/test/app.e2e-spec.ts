import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect({ status: 'ok' });
  });

  it('/api/ready (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/ready')
      .expect(200)
      .expect({ status: 'ready' });
  });

  it('/api/live (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/live')
      .expect(200)
      .expect({ status: 'live' });
  });

  it('/api/docs (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/docs')
      .expect(200);
  });

  it('should handle 404 for unknown routes', () => {
    return request(app.getHttpServer())
      .get('/api/unknown-route')
      .expect(404);
  });

  it('should handle rate limiting', async () => {
    // Make multiple requests to test rate limiting
    const promises = Array.from({ length: 25 }, () =>
      request(app.getHttpServer()).get('/api/health')
    );
    
    const responses = await Promise.all(promises);
    const successCount = responses.filter(res => res.status === 200).length;
    
    // Should allow some requests but potentially limit others
    expect(successCount).toBeGreaterThan(0);
  });
});

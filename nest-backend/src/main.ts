import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { testConnection } from './utils/pgUtils'

async function bootstrap() {
  const pgCon = await testConnection()
  if (pgCon) {
    const app = await NestFactory.create(AppModule);
    await app.listen(4001);
  } else {
    throw Error('Failed to start due to missing pg connection')
  }
}
bootstrap();

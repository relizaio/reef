import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { GraphQLModule } from '@nestjs/graphql'
import { AccountService } from './services/account.service';
import { AccountResolver } from './resolvers/account.resolver';
import { InstanceService } from './services/instance.service';
import { InstanceResolver } from './resolvers/instance.resolver';
import { SiloResolver } from './resolvers/silo.resolver';
import { SiloService } from './services/silo.service';
import { TemplateService } from './services/template.service';
import { TemplateResolver } from './resolvers/template.resolver';
import { SecretService } from './services/secret.service';
import { CronService } from './services/cron.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, AccountService, AccountResolver, InstanceService, InstanceResolver, SiloService, SiloResolver, TemplateService, TemplateResolver, SecretService, CronService],
})
export class AppModule {}

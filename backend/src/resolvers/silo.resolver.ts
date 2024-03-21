import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql'
import { KeyValueInput } from 'src/graphql';
import { SiloService } from 'src/services/silo.service';
import { TemplateService } from 'src/services/template.service';

@Resolver('Silo')
export class SiloResolver {
    constructor(
            private siloService: SiloService,
            private templateService: TemplateService
    ) {}

    @Query()
    async getSilo(@Args('siloId') siloId: string) {
        return await this.siloService.getSilo(siloId)
    }

    @Query()
    async getAllActiveSilos() {
        return await this.siloService.getAllActiveSilos()
    }

    @Mutation()
    async createSilo(@Args('templateId') templateId: string, @Args('userVariables') userVariables: KeyValueInput[], @Args('description') description: string) {
        return await this.siloService.createSilo(templateId, userVariables, description)
    }

    @Mutation()
    async updateSilo(@Args('siloId') siloId: string, @Args('templateIds') templateIds: string[]) {
        return await this.siloService.setInstanceTemplatesOnSilo(siloId, templateIds)
    }

    @Mutation()
    async destroySilo(@Args('siloId') siloId: string) {
        await this.siloService.destroySilo(siloId)
        return true
    }

    @ResolveField()
    async template(@Parent() silo) {
      return this.templateService.getTemplate(silo.template_id)
    }
}

import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { TemplateService } from 'src/services/template.service';
import { TemplateInput } from 'src/graphql';

@Resolver('Template')
export class TemplateResolver {
    constructor(
            private templateService: TemplateService
    ) {}

    @Query()
    async getTemplate(@Args('templateId') templateId: string) {
        return await this.templateService.getTemplate(templateId)
    }

    @Query()
    async getAllTemplates() {
        return await this.templateService.listTemplates()
    }

    @Query()
    async getTemplates(@Args('status') status: string) {
        return await this.templateService.listTemplates(status)
    }

    @Mutation()
    async createTemplate(@Args('templateInput') templateInput: TemplateInput) {
        return await this.templateService.createTemplate(templateInput)
    }
}

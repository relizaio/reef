import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { KeyValueInput } from 'src/graphql';
import { InstanceService } from 'src/services/instance.service';

@Resolver('Instance')
export class InstanceResolver {
    constructor(
            private instanceService: InstanceService
    ) {}

    @Query()
    async getInstance(@Args('instanceId') instanceId: string) {
        return await this.instanceService.getInstance(instanceId)
    }

    @Query()
    async getAllActiveInstances() {
        return await this.instanceService.getAllActiveInstances()
    }

    @Query()
    async getInstancesOfSilo(@Args('siloId') siloId: string) {
        return await this.instanceService.getInstancesOfSilo(siloId)
    }

    @Mutation()
    async createInstance(@Args('siloId') siloId: string, @Args('templateId') templateId: string, @Args('instanceId') instanceId?: string, @Args('description') description?: string, @Args('userVariables') userVariables?: KeyValueInput[]) {
        return await this.instanceService.createInstance(siloId, templateId, instanceId, description, userVariables)
    }

    @Mutation()
    async destroyInstance(@Args('instanceId') instanceId?: string) {
        await this.instanceService.destroyInstance(instanceId)
        return true
    }
}

import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { InstanceService } from 'src/services/instance.service';

@Resolver('Instance')
export class InstanceResolver {
    constructor(
            private instanceService: InstanceService
    ) {}

    // @Query()
    // async getAllActiveAccounts() {
    //     return await this.accountService.getAllActiveAccounts();
    // }

    // @Mutation()
    // async createAwsAccount(@Args('awsAccount') awsAccount: AwsAccountInput) {
    //     return await this.accountService.createAwsAccount(awsAccount)
    // }
}

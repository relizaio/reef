import { Resolver, Query, Mutation, Args } from '@nestjs/graphql'
import { AccountService } from 'src/services/account.service'
import { AwsAccountInput, AzureAccountInput, GitAccountInput } from 'src/graphql'

@Resolver('Account')
export class AccountResolver {
    constructor(
            private accountService: AccountService
    ) {}

    @Query()
    async getAllActiveAccounts() {
        return await this.accountService.getAllActiveAccounts();
    }

    @Mutation()
    async createAwsAccount(@Args('awsAccount') awsAccount: AwsAccountInput) {
        return await this.accountService.createAwsAccount(awsAccount)
    }

    @Mutation()
    async createAzureAccount(@Args('azureAccount') azureAccount: AzureAccountInput) {
        return await this.accountService.createAzureAccount(azureAccount)
    }

    @Mutation()
    async createGitAccount(@Args('gitAccount') gitAccount: GitAccountInput) {
        return await this.accountService.createGitAccount(gitAccount)
    }
//   @ResolveField()
//   async posts(@Parent() author) {
//     const { id } = author;
//     return this.postsService.findAll({ authorId: id });
//   }
}

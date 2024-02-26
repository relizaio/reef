import { Resolver, Query } from '@nestjs/graphql'
import { AccountService } from 'src/accounts/account.service';

@Resolver('Account')
export class AccountResolver {
    constructor(
            private accountService: AccountService
    ) {}

    @Query()
    async getAllActiveAccounts() {
        return this.accountService.getAllActiveAccounts();
    }

//   @ResolveField()
//   async posts(@Parent() author) {
//     const { id } = author;
//     return this.postsService.findAll({ authorId: id });
//   }
}

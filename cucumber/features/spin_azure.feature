Feature: Spin Azure Silo and Instance

    @createSilo
    Scenario: Spin Azure Silo and Instance off Pub Git Repo
        Given I initialize "PUBLIC" scenario
        Then I register Azure account
        Then I register Silo template
        Then I register Instance template
        Then I create Silo
        Then I wait for Silo to become Active
        Then I create Instance
        Then I wait for Instance to become Active
        Then I delete Silo
    
    @createSiloPrivate
    Scenario: Spin Azure Silo and Instance off Private Git Repo
        Given I initialize "PRIVATE" scenario
        Then I register Git account
        Then I register Azure account
        Then I register Silo template
        Then I register Instance template
        Then I create Silo
        Then I wait for Silo to become Active
        Then I create Instance
        Then I wait for Instance to become Active
        Then I delete Silo
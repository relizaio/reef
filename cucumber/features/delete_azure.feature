
Feature: Delete Azure Silo and Instance

    @deleteSilo
    Scenario: Delete Azure Silo and Instance
        Given I delete "silo-680541f8-812b-4158-a79d-da481e2a970c" silo

    @deleteAllSilos
    Scenario: Delete all Azure Silos
        Given I delete all silos

Feature: Delete Azure Silo and Instance

    @deleteSilo
    Scenario: Delete Azure Silo and Instance
        Given I delete "silo-680541f8-812b-4158-a79d-da481e2a970c" silo

    @deleteInstance
    Scenario: Delete Azure Instance
        Given I delete "instance-cd5c9e2f-8138-48b3-8536-8329b7ea6ceb" instance

    @deleteAllSilos
    Scenario: Delete all Azure Silos
        Given I delete all silos
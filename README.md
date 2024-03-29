*N.B. This is an early stage of project to create arbitrarily ephemeral environments with terraform*

*Project Introduction - https://worklifenotes.com/2024/03/23/reef-2-layered-approach-for-ephemeral/*

*If you would like to know more about the project and / or participate in it, contact us via [DevOps and DataOps Discord](https://devopscommunity.org)*

## Running the stack

### 1. With Public Images via Docker Compose:

```
cd docker-compose/registry
docker-compose up -d
```

### 2. With Locally Build images via Docker Compose (useful for Development):
```
cd docker-compose/local
docker-compose up -d
```

When running with docker-compose, open http://localhost:8112 in the browser to access UI.

## Tutorial - spin Silo and Instance on Azure (requires paid or trial Azure subscription, you may incur Azure charges)
Pre-requisites - create a resource group in Azure with valid DNS zone in such group - you need to have a valid DNS zone for templates in this tutorial to operate properly.

1. Run the stack via docker-compose as described above
2. In the UI, navigate to the Accounts menu
3. Click on the plus icon to Create Account
4. In the dropdown, choose Azure
5. Enter all fields as per your credentials - refer to [Azure documentation here](https://learn.microsoft.com/en-us/azure/developer/terraform/authenticate-to-azure) on how to obtain them, then click on 'Create Azure Account'
6. Navigate to the Templates menu
7. Click on the plus icon to Create Silo Template
8. Select 'Silo' type
9. Enter 'https://github.com/relizaio/reliza-ephemeral-framework' in the 'Git Repo URL' field
10. Enter 'terraform_templates/silos/azure_k3s_vnet_silo' in the 'Git Repo Path' field
11. Enter 'main' in the 'Git Repo Pointer' field
12. Choose 'Azure' in the 'Providers' field
13. Select Azure auth account created earlier in this tutorial in the 'Authentication Accounts' field
14. Click on 'Create'
15. Click on the plus icon to Create Instance Template
16. Enter 'https://github.com/relizaio/reliza-ephemeral-framework' in the 'Git Repo URL' field
17. Enter 'terraform_templates/instances/azure_k3s_instance' in the 'Git Repo Path' field
18. Enter 'main' in the 'Git Repo Pointer' field
19. Choose 'Azure' in the 'Providers' field
20. Select Azure auth account created earlier in this tutorial in the 'Authentication Accounts' field
21. Choose Azure Silo template created earlier in this tutorial in the 'Parent Templates' field
22. Navigate to the Silos menu
23. Click on the plus icon to Create Silo
24. Enter pre-created resource group name (refer to pre-requisites) in the 'resource_group_name' field
25. Leave the 'silo_identifier' field empty, it will be set to a random UUID generated by the system (later we plan to also have an option to pin silo id to arbitrary identifier)
26. Enter pre-created DNS zone url in the 'dnz_zone_name', i.e. `demo.myzone.com`
27. Click on 'Create'
28. Navigate to the Instances menu
29. Click on the plus icon to Create Instance
30. Select previously created Silo in the Silo field
31. Select previously created Instance template in the Template field
32. Click Create
33. This will trigger OpenTofu process to create requested epehemeral instances


## Development Instructions

### Run local db:

```
docker run -d --name reliza-ephemeral-postgres -e POSTGRES_PASSWORD=password -p 5439:5432 postgres:16
```

### Flyway command:

```
cd backend
docker run --rm -v ./migrations:/flyway/sql flyway/flyway -url=jdbc:postgresql://host.docker.internal:5439/postgres -user=postgres -password=password -defaultSchema=reef -schemas='reef' migrate
```

### Flyway for PowerShell:
```
cd backend
docker run --rm -v ${PWD}/migrations:/flyway/sql flyway/flyway -url=jdbc:postgresql://host.docker.internal:5439/postgres -user=postgres -password=password -defaultSchema=reef -schemas='reef' migrate
```

### Run test sample:

```
cd backend
node --import tsx --test tests/test2.ts
```

### Run cucumber tests:
Create test wrapper, such as following, and run from cucumber directory:

```
#!/bin/bash
export REEF_TEST_AZURE_CLIENTID="123"
export REEF_TEST_AZURE_CLIENTSECRET="123"
export REEF_TEST_AZURE_RESOURCEGROUPNAME="123"
export REEF_TEST_AZURE_SUBSCRIPTIONID="123"
export REEF_TEST_AZURE_TENANTID="123"
npm test
```

To run a single feature / scenario by tag, use wrapper as following:


```
#!/bin/bash
export REEF_TEST_AZURE_CLIENTID="123"
export REEF_TEST_AZURE_CLIENTSECRET="123"
export REEF_TEST_AZURE_RESOURCEGROUPNAME="123"
export REEF_TEST_AZURE_SUBSCRIPTIONID="123"
export REEF_TEST_AZURE_TENANTID="123"
node_modules/@cucumber/cucumber/bin/cucumber-js --tags "@deleteSilo"
```

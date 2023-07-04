*N.B. This is an early stage of project to create arbitrarily ephemeral environments with terraform*

*This is not yet a working version. If you would like to know more about the project and / or participate in it, contact us via [DevOps and DataOps Discord](https://devopscommunity.org)*


## Development Instructions

### Run local db:

```
docker run -d --name reliza-ephemeral-postgres -e POSTGRES_PASSWORD=password -p 5439:5432 postgres:15
```

### Flyway command:

```
cd backend
docker run --rm -v ./migrations:/flyway/sql flyway/flyway -url=jdbc:postgresql://host.docker.internal:5439/postgres -user=postgres -password=password -defaultSchema=ref -schemas='ref' migrate
```

### Flyway for PowerShell:
```
cd backend
docker run --rm -v ${PWD}/migrations:/flyway/sql flyway/flyway -url=jdbc:postgresql://host.docker.internal:5439/postgres -user=postgres -password=password -defaultSchema=ref -schemas='ref' migrate
```

### Run test sample:

```
cd backend
node --loader tsx --test tests/test2.ts
```

### Run cucumber tests:
Create test wrapper, such as following, and run from cucumber directory:

```
#!/bin/bash
export REF_TEST_AZURE_CLIENTID="123"
export REF_TEST_AZURE_CLIENTSECRET="123"
export REF_TEST_AZURE_RESOURCEGROUPNAME="123"
export REF_TEST_AZURE_SUBSCRIPTIONID="123"
export REF_TEST_AZURE_TENANTID="123"
npm test
```

To run a single feature / scenario by tag, use wrapper as following:


```
#!/bin/bash
export REF_TEST_AZURE_CLIENTID="123"
export REF_TEST_AZURE_CLIENTSECRET="123"
export REF_TEST_AZURE_RESOURCEGROUPNAME="123"
export REF_TEST_AZURE_SUBSCRIPTIONID="123"
export REF_TEST_AZURE_TENANTID="123"
node_modules/@cucumber/cucumber/bin/cucumber-js --tags "@deleteSilo"
```
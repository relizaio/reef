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
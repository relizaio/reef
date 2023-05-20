Run local db:

docker run -d --name reliza-ephemeral-postgres -e POSTGRES_PASSWORD=password -p 5439:5432 postgres:15

Flyway command:

docker run --rm -v ./migrations:/flyway/sql flyway/flyway -url=jdbc:postgresql://host.docker.internal:5439/postgres -user=postgres -password=password -defaultSchema=ref -schemas='ref' migrate

Flyway for PowerShell:
docker run --rm -v ${PWD}/migrations:/flyway/sql flyway/flyway -url=jdbc:postgresql://host.docker.internal:5439/postgres -user=postgres -password=password -defaultSchema=ref -schemas='ref' migrate
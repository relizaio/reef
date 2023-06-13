CREATE TABLE silos (
    uuid uuid NOT NULL UNIQUE PRIMARY KEY default gen_random_uuid(),
    created_date timestamptz NOT NULL default now(),
    last_updated_date timestamptz NOT NULL default now(),
    schema_version integer NOT NULL default 0,
    status text NOT NULL default 'ACTIVE',
    properties jsonb NULL
);

CREATE TABLE instances (
    uuid uuid NOT NULL UNIQUE PRIMARY KEY default gen_random_uuid(),
    created_date timestamptz NOT NULL default now(),
    last_updated_date timestamptz NOT NULL default now(),
    schema_version integer NOT NULL default 0,
    silo_id uuid NOT NULL,
    status text NOT NULL default 'ACTIVE',
    properties jsonb NULL
);

CREATE TABLE templates (
    uuid uuid NOT NULL UNIQUE PRIMARY KEY default gen_random_uuid(),
    created_date timestamptz NOT NULL default now(),
    last_updated_date timestamptz NOT NULL default now(),
    schema_version integer NOT NULL default 0,
    status text NOT NULL default 'ACTIVE',
    record_data jsonb NULL
);
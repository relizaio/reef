CREATE TABLE silos (
    uuid uuid NOT NULL UNIQUE PRIMARY KEY default gen_random_uuid(),
    created_date timestamptz NOT NULL default now(),
    last_updated_date timestamptz NOT NULL default now(),
    schema_version integer NOT NULL default 0,
    status text NOT NULL default 'ACTIVE',
    template_id uuid NULL,
    template_pointer text NULL,
    description text NULL,
    properties jsonb NULL,
    permissions jsonb NULL,
    instance_templates jsonb NULL
);

CREATE TABLE instances (
    uuid uuid NOT NULL UNIQUE PRIMARY KEY default gen_random_uuid(),
    created_date timestamptz NOT NULL default now(),
    last_updated_date timestamptz NOT NULL default now(),
    schema_version integer NOT NULL default 0,
    silo_id uuid NOT NULL,
    template_id uuid NOT NULL,
    template_pointer text NULL,
    status text NOT NULL default 'ACTIVE',
    description text NULL,
    permissions jsonb NULL,
    properties jsonb NULL
);

CREATE TABLE templates (
    uuid uuid NOT NULL UNIQUE PRIMARY KEY default gen_random_uuid(),
    created_date timestamptz NOT NULL default now(),
    last_updated_date timestamptz NOT NULL default now(),
    schema_version integer NOT NULL default 0,
    status text NOT NULL default 'ACTIVE',
    description text NULL,
    permissions jsonb NULL,
    record_data jsonb NULL
);

CREATE TABLE accounts (
    uuid uuid NOT NULL UNIQUE PRIMARY KEY default gen_random_uuid(),
    created_date timestamptz NOT NULL default now(),
    last_updated_date timestamptz NOT NULL default now(),
    schema_version integer NOT NULL default 0,
    status text NOT NULL default 'ACTIVE',
    description text NULL,
    permissions jsonb NULL,
    record_data jsonb NULL
);

CREATE TABLE secrets (
    uuid uuid NOT NULL UNIQUE PRIMARY KEY default gen_random_uuid(),
    created_date timestamptz NOT NULL default now(),
    last_updated_date timestamptz NOT NULL default now(),
    schema_version integer NOT NULL default 0,
    description text NULL,
    permissions jsonb NULL,
    secret jsonb NOT NULL
);
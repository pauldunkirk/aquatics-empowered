CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    name text NOT NULL,
    users_id integer[],
    street_address text NOT NULL,
    city text NOT NULL,
    state character varying(2) NOT NULL,
    zip text NOT NULL,
    pool_type text,
    description text,
    handicap_accessibility boolean,
    level integer,
    image_url text,
    url text,
    approved boolean,
    coords float(12)[2] UNIQUE,
    date_added timestamp NOT NULL DEFAULT(now()),
    last_updated timestamp,
    google_place_id text
);

CREATE TABLE facility_availability (
    id SERIAL PRIMARY KEY,
    facility_id integer references facilities,
    date date,
    start_time time without time zone[],
    end_time time without time zone[]
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username text NOT NULL,
    password text NOT NULL,
    user_type text,
    first_name text,
    last_name text,
    street_address text,
    city text,
    state character varying(2),
    zip integer,
    phone_number character varying(20)
);

CREATE TABLE facility_reservation (
    id SERIAL PRIMARY KEY,
    facility_availability_id integer references facility_availability,
    approved boolean,
    user_id integer references users
);

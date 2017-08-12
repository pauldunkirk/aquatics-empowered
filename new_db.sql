CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    name text,
    users_id integer,
    street_address character varying(80),
    city character varying(80),
    state character varying(2),
    zip integer,
    description text,
    handicap_accessibility boolean,
    level integer,
    image_url text,
    cost boolean,
    approved boolean
);

CREATE TABLE facility_availability (
    id SERIAL PRIMARY KEY,
    facility_id integer references facilities,
    date date,
    start_time time without time zone,
    end_time time without time zone
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username text NOT NULL,
    password character varying(255) NOT NULL,
    user_type character varying(80),
    first_name character varying(80),
    last_name character varying(80),
    street_address character varying(80),
    city character varying(80),
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

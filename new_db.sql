CREATE FUNCTION field(anyelement, VARIADIC anyarray) RETURNS integer AS $$
  SELECT
    COALESCE(
     ( SELECT i FROM generate_subscripts($2, 1) gs(i)
       WHERE $2[i] = $1 ),
     0);
$$ LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.last_updated = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE google_radar_results (
	id serial primary key,
	coords float[2],
	place_id text UNIQUE,
  coord_list text,
	keyword text,
  date_added timestamp with time zone default now(),
  last_updated timestamp with time zone default now()
);

CREATE TRIGGER update_google_radar_results_changetimestamp BEFORE UPDATE
ON google_radar_results FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();

CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    google_place_id text UNIQUE,
    users_id integer[],
    name text,
    street_address text,
    city text,
    state character varying(2),
    zip text,
    phone text,
    description text,
    image_url text,
    url text,
    coords float[2],
    keyword text,
    ae_details jsonb,
    google_places_data jsonb,
    date_added timestamp with time zone NOT NULL DEFAULT now(),
    last_updated timestamp with time zone default now()
);

CREATE TRIGGER update_facilities_changetimestamp BEFORE UPDATE
ON facilities FOR EACH ROW EXECUTE PROCEDURE
update_timestamp();



Pauls-MacBook-Air:bcae paulcdunkirk$ heroku addons:create heroku-postgresql:hobby-basic --app aquaticsemp
Creating heroku-postgresql:hobby-basic on ⬢ aquaticsemp... !
 ▸    Invalid credentials provided.
Enter your Heroku credentials:
Email: pauldunkirk@gmail.com
Password: **********
Creating heroku-postgresql:hobby-basic on ⬢ aquaticsemp... $9/month
Database has been created and is available
 ! This database is empty. If upgrading, you can transfer
 ! data from another database with pg:copy
Created postgresql-round-49014 as HEROKU_POSTGRESQL_CYAN_URL
Use heroku addons:docs heroku-postgresql to view documentation
Pauls-MacBook-Air:bcae paulcdunkirk$ heroku pg:copy DATABASE_URL HEROKU_POSTGRESQL_CYAN_URL --app aquaticsemp
 ▸    WARNING: Destructive action
 ▸    This command will remove all data from
 ▸    CYAN
 ▸    Data from DATABASE will then be
 ▸    transferred to CYAN
 ▸    To proceed, type aquaticsemp or
 ▸    re-run this command with --confirm
 ▸    aquaticsemp

> aquaticsemp
Starting copy of DATABASE to CYAN... done
Copying... done
Pauls-MacBook-Air:bcae paulcdunkirk$ heroku pg:promote HEROKU_POSTGRESQL_CYAN
 ▸    No app specified
Pauls-MacBook-Air:bcae paulcdunkirk$ heroku pg:promote HEROKU_POSTGRESQL_CYAN --app aquaticsemp
Ensuring an alternate alias for existing DATABASE_URL... HEROKU_POSTGRESQL_COPPER_URL
Promoting postgresql-round-49014 to DATABASE_URL on ⬢ aquaticsemp... done
Pauls-MacBook-Air:bcae paulcdunkirk$

Pauls-MacBook-Air:bcae paulcdunkirk$  heroku pg:info --app aquaticsemp
=== DATABASE_URL, HEROKU_POSTGRESQL_CYAN_URL
Plan:                  Hobby-basic
Status:                Available
Connections:           0/20
PG Version:            10.1
Created:               2017-12-20 00:54 UTC
Data Size:             8.7 MB
Tables:                2
Rows:                  164/10000000 (In compliance)
Fork/Follow:           Unsupported
Rollback:              Unsupported
Continuous Protection: Off
Add-on:                postgresql-round-49014

=== HEROKU_POSTGRESQL_COPPER_URL
Plan:                  Hobby-dev
Status:                Available
Connections:           0/20
PG Version:            9.6.4
Created:               2017-08-31 01:42 UTC
Data Size:             9.7 MB
Tables:                2
Rows:                  143/10000 (In compliance)
Fork/Follow:           Unsupported
Rollback:              Unsupported
Continuous Protection: Off
Add-on:                postgresql-metric-79730

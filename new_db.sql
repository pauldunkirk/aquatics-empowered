


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

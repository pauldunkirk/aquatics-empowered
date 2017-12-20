




Pauls-MacBook-Air:bcae paulcdunkirk$ pg_dump aquatics
--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.2
-- Dumped by pg_dump version 9.6.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: facilities; Type: TABLE; Schema: public; Owner: paulcdunkirk
--

CREATE TABLE facilities (
    id integer NOT NULL,
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


ALTER TABLE facilities OWNER TO paulcdunkirk;

--
-- Name: facilities_id_seq; Type: SEQUENCE; Schema: public; Owner: paulcdunkirk
--

CREATE SEQUENCE facilities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE facilities_id_seq OWNER TO paulcdunkirk;

--
-- Name: facilities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: paulcdunkirk
--

ALTER SEQUENCE facilities_id_seq OWNED BY facilities.id;


--
-- Name: facility_availability; Type: TABLE; Schema: public; Owner: paulcdunkirk
--

CREATE TABLE facility_availability (
    id integer NOT NULL,
    facility_id integer,
    date date,
    start_time time without time zone,
    end_time time without time zone
);


ALTER TABLE facility_availability OWNER TO paulcdunkirk;

--
-- Name: facility_availability_id_seq; Type: SEQUENCE; Schema: public; Owner: paulcdunkirk
--

CREATE SEQUENCE facility_availability_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE facility_availability_id_seq OWNER TO paulcdunkirk;

--
-- Name: facility_availability_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: paulcdunkirk
--

ALTER SEQUENCE facility_availability_id_seq OWNED BY facility_availability.id;


--
-- Name: facility_reservation; Type: TABLE; Schema: public; Owner: paulcdunkirk
--

CREATE TABLE facility_reservation (
    id integer NOT NULL,
    reservation_id integer,
    facility_availability_id integer,
    approved boolean
);


ALTER TABLE facility_reservation OWNER TO paulcdunkirk;

--
-- Name: facility_reservation_id_seq; Type: SEQUENCE; Schema: public; Owner: paulcdunkirk
--

CREATE SEQUENCE facility_reservation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE facility_reservation_id_seq OWNER TO paulcdunkirk;

--
-- Name: facility_reservation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: paulcdunkirk
--

ALTER SEQUENCE facility_reservation_id_seq OWNED BY facility_reservation.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: paulcdunkirk
--

CREATE TABLE users (
    id integer NOT NULL,
    username text NOT NULL,
    password character varying(255) NOT NULL,
    user_type character varying(80),
    first_name character varying(80),
    last_name character varying(80),
    street_address character varying(80),
    city character varying(80),
    state character varying(2),
    zip integer,
    phone_number character varying(10)
);


ALTER TABLE users OWNER TO paulcdunkirk;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: paulcdunkirk
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE users_id_seq OWNER TO paulcdunkirk;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: paulcdunkirk
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: facilities id; Type: DEFAULT; Schema: public; Owner: paulcdunkirk
--

ALTER TABLE ONLY facilities ALTER COLUMN id SET DEFAULT nextval('facilities_id_seq'::regclass);


--
-- Name: facility_availability id; Type: DEFAULT; Schema: public; Owner: paulcdunkirk
--

ALTER TABLE ONLY facility_availability ALTER COLUMN id SET DEFAULT nextval('facility_availability_id_seq'::regclass);


--
-- Name: facility_reservation id; Type: DEFAULT; Schema: public; Owner: paulcdunkirk
--

ALTER TABLE ONLY facility_reservation ALTER COLUMN id SET DEFAULT nextval('facility_reservation_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: paulcdunkirk
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Data for Name: facilities; Type: TABLE DATA; Schema: public; Owner: paulcdunkirk
--

COPY facilities (id, name, users_id, street_address, city, state, zip, description, handicap_accessibility, level, image_url, cost, approved) FROM stdin;
1	Jeremy's Pool	\N	555 Cool Lane	Minneapolis	MN	55403	Sweet Pool!	t	2	\N	t	t
\.


--
-- Name: facilities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: paulcdunkirk
--

SELECT pg_catalog.setval('facilities_id_seq', 1, true);


--
-- Data for Name: facility_availability; Type: TABLE DATA; Schema: public; Owner: paulcdunkirk
--

COPY facility_availability (id, facility_id, date, start_time, end_time) FROM stdin;
1	1	2017-06-23	00:00:00	23:00:00
\.


--
-- Name: facility_availability_id_seq; Type: SEQUENCE SET; Schema: public; Owner: paulcdunkirk
--

SELECT pg_catalog.setval('facility_availability_id_seq', 1, true);


--
-- Data for Name: facility_reservation; Type: TABLE DATA; Schema: public; Owner: paulcdunkirk
--

COPY facility_reservation (id, reservation_id, facility_availability_id, approved) FROM stdin;
\.


--
-- Name: facility_reservation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: paulcdunkirk
--

SELECT pg_catalog.setval('facility_reservation_id_seq', 1, false);


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: paulcdunkirk
--

COPY users (id, username, password, user_type, first_name, last_name, street_address, city, state, zip, phone_number) FROM stdin;
1	paul	paul	\N	Paul	Dunkirk	7140 Utica Lane	Chanhassen	MN	55317	7015555555
2	pauldunkirk@gmail.com	$2a$10$BSSvoXhpDz/DuCXQ9k6bke7UYHMBhgZjB.5CsqLqU1g.TG3PxLvr2	user	Paul	Charles	7140 Utica Lane	Chanhassen	MN	55317	6124187694
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: paulcdunkirk
--

SELECT pg_catalog.setval('users_id_seq', 2, true);


--
-- Name: facilities facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: paulcdunkirk
--

ALTER TABLE ONLY facilities
    ADD CONSTRAINT facilities_pkey PRIMARY KEY (id);


--
-- Name: facility_availability facility_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: paulcdunkirk
--

ALTER TABLE ONLY facility_availability
    ADD CONSTRAINT facility_availability_pkey PRIMARY KEY (id);


--
-- Name: facility_reservation facility_reservation_pkey; Type: CONSTRAINT; Schema: public; Owner: paulcdunkirk
--

ALTER TABLE ONLY facility_reservation
    ADD CONSTRAINT facility_reservation_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: paulcdunkirk
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: paulcdunkirk
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: facilities facilities_users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paulcdunkirk
--

ALTER TABLE ONLY facilities
    ADD CONSTRAINT facilities_users_id_fkey FOREIGN KEY (users_id) REFERENCES users(id);


--
-- Name: facility_availability facility_availability_facility_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paulcdunkirk
--

ALTER TABLE ONLY facility_availability
    ADD CONSTRAINT facility_availability_facility_id_fkey FOREIGN KEY (facility_id) REFERENCES facilities(id);


--
-- Name: facility_reservation facility_reservation_facility_availability_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paulcdunkirk
--

ALTER TABLE ONLY facility_reservation
    ADD CONSTRAINT facility_reservation_facility_availability_id_fkey FOREIGN KEY (facility_availability_id) REFERENCES facility_availability(id);


--
-- Name: facility_reservation facility_reservation_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: paulcdunkirk
--

ALTER TABLE ONLY facility_reservation
    ADD CONSTRAINT facility_reservation_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES users(id);


--
-- PostgreSQL database dump complete
--

Pauls-MacBook-Air:bcae paulcdunkirk$

	create table venues (
	venue_id int2 not null primary key,
	venue_name varchar(30) not null,
	address varchar(50) not null,
	suburb varchar(20) not null,
	state varchar(10) not null,
	postcode int2 not null,
	"from" varchar(40) not null,
	venue_type varchar(15) not null,
	barcode bool default false,
	created_at timestamp default now()
)

create table users (
	user_id serial not null,
	venue_id int2 not null,
	name varchar(50) not null,
	email varchar(60),
	mobile varchar(15),
	username varchar(20) not null,
	password text not null,
	status bool not null,
	shop bool not null,
		primary key (user_id, username),
		CONSTRAINT users_venues_venue_id_fkey FOREIGN KEY (venue_id)
		REFERENCES venues(venue_id) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION
)

create table staff (
	staff_id serial not null primary key,
	username varchar(20) not null unique,
	password text not null,
	name varchar(50) not null,
	access_level varchar(20) not null
)

create table venue_players (
	player_id int4 not null unique,
	venue_id int2 not null,
	first_name varchar(30) not null,
	last_name varchar(30) not null,
	birthday date check(birthday < current_date),
	email varchar(60),
	mobile varchar(15),
	address varchar(50),
	suburb varchar(20),
	state varchar(10),
	postcode int2,
	status bool not null,
	mail_okay bool not null,
		primary key(player_id, venue_id),
		CONSTRAINT players_venues_venue_id_fkey FOREIGN KEY (venue_id)
		REFERENCES venues(venue_id) MATCH SIMPLE
		ON UPDATE NO ACTION ON DELETE NO ACTION
)


create table player_visits (
	player_id int4 not null,
	venue_id int2 not null,
	date_visit date not null check (date_visit <= current_date),
		constraint player_visits_players_player_id_fkey foreign key (player_id)
		references venue_players(player_id) match simple
		on update no action on delete no action,
		constraint player_visits_players_venue_id_fkey foreign key (player_id, venue_id)
		references venue_players(player_id, venue_id) match simple
		on update no action on delete no action
)


create table mailout_templates (
	"date" date not null,
	"type" varchar(7) not null check ("type" in ('mailout', 'bday', 'email')),
	text1 text default null,
	text2 text default null,
	text3 text default null,
	text4 text default null,
	text5 text default null,
	text6 text default null,
	start_date date not null,
	end_date date not null check (end_date > start_date),
		primary key ("date", "type")
)


create table venue_subs (
	venue_id int2 not null,
	sub_date date not null,
	"type" varchar(7) not null check ("type" in ('mailout', 'bday', 'email')),
	text1 text default null,
	text2 text default null,
	text3 text default null,
	text4 text default null,
	text5 text default null,
	text6 text default null,
	filters json default null,
		constraint venue_subs_venues_venue_id_fkey foreign key (venue_id)
		references venues(venue_id) match simple
		on update no action on delete no action,
		constraint venue_subs_mailout_templates_date_fkey foreign key (sub_date, "type")
		references mailout_templates("date", "type") match simple
		on update no action on delete no action
)
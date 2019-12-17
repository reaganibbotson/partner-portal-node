--delete from venues
--
--delete from staff
--
--delete from venue_subs
--
--delete from mailout_templates
--
--select * from venues
--
--select * from staff
--
--select * from venue_subs
--
--select * from mailout_templates

insert into staff (username, password, name, access_level) values
('PVSTest', 'Password1', 'Hello Test', 'PVS')

insert into venues values 
(7322, 'Abruzzo Club', '377 Lygon Street', 'Brunswick East', 'VIC', 3057, 'Frank DiIorio', 'PVS', false, now(), 'President'),
(92, 'Taylors Lakes Hotel', '7 Melton Hwy', 'Taylors Lakes', 'VIC', 3038, 'Eric Visscher', 'PVS', false, now(), 'General Manager')

insert into mailout_templates values
(
	'2019-10-01'::date, 
	'mailout', 
	'You have the chance to win these weekly prizes in December: Week 1 & 3 prizes: A $250 Christmas Hamper will be drawn at 11am on Monday 9 and 23 December 2019. Week 2 & 4 prizes: A $200 Bunnings Gift Card will be drawn at 11am on Monday 16 and 30 December 2019. Remember to bring in your four weekly entry coupons when visiting the venue to enter into each weekly prize draw for your chance to win. We look forward to seeing you soon.', 
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Abruzzo Club between 1 to 8 December 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Abruzzo Club between 9 to 15 December 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Abruzzo Club between 16 to 22 December 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Abruzzo Club between 23 to 29 December 2019. Not valid with any other offer.',
	'practice marketing text',
	'2019-10-01'::date,
	'2019-10-25'::date
),
(
	'2019-10-01'::date,
	'bday',
	'Wishing you a very Happy Birthday and a wonderful year ahead. To help celebrate your Birthday, please find attached two special offers for you to use throughout the month. We look forward to seeing you soon.', 
	'Present this voucher to receive a complimentary Drink (Cascade Light or VB or glass of house wine). Only valid at Abruzzo Club between 1 to 15 December 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary Drink (Cascade Light or VB or glass of house wine). Only valid at Abruzzo Club between 16 to 31 December 2019. Not valid with any other offer.',
	'',
	'',
	'',
	'2019-10-01'::date,
	'2019-10-25'::date
),
(
	'2019-11-01'::date,
	'bday',
	'Wishing you a very Happy Birthday and a wonderful year ahead. To help celebrate your Birthday, please find attached two special offers for you to use throughout the month. We look forward to seeing you soon.', 
	'Present this voucher to receive a complimentary Drink (Cascade Light or VB or glass of house wine). Only valid at Abruzzo Club between 1 to 15 December 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary Drink (Cascade Light or VB or glass of house wine). Only valid at Abruzzo Club between 16 to 31 December 2019. Not valid with any other offer.',
	'',
	'',
	'',
	'2019-11-01'::date,
	'2019-11-27'::date
),
(
	'2019-12-01'::date, 
	'mailout', 
	'You have the chance to win these weekly prizes in December: Week 1 & 3 prizes: A $250 Christmas Hamper will be drawn at 11am on Monday 9 and 23 December 2019. Week 2 & 4 prizes: A $200 Bunnings Gift Card will be drawn at 11am on Monday 16 and 30 December 2019. Remember to bring in your four weekly entry coupons when visiting the venue to enter into each weekly prize draw for your chance to win. We look forward to seeing you soon.', 
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Taylors Lakes Hotel between 1 to 8 December 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Taylors Lakes Hotel between 9 to 15 December 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Taylors Lakes Hotel between 16 to 22 December 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Taylors Lakes Hotel between 23 to 29 December 2019. Not valid with any other offer.',
	'venue designated page filler',
	'2019-12-01'::date,
	'2019-12-31'::date
)

insert into venue_subs values
(
	7322, 
	'2019-10-01'::date, 
	'mailout', 
	'You have the chance to win these weekly prizes in December: Week 1 & 3 prizes: A $250 Christmas Hamper will be drawn at 11am on Monday 9 and 23 December 2019. Week 2 & 4 prizes: A $200 Bunnings Gift Card will be drawn at 11am on Monday 16 and 30 December 2019. Remember to bring in your four weekly entry coupons when visiting the venue to enter into each weekly prize draw for your chance to win. We look forward to seeing you soon.', 
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Abruzzo Club between 1 to 8 December 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Abruzzo Club between 9 to 15 December 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Abruzzo Club between 16 to 22 December 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Abruzzo Club between 23 to 29 December 2019. Not valid with any other offer.',
	'practice marketing text',
	'{"filters": []}'
),
(
	7322,
	'2019-10-01'::date,
	'bday',
	'Wishing you a very Happy Birthday and a wonderful year ahead. To help celebrate your Birthday, please find attached two special offers for you to use throughout the month. We look forward to seeing you soon.', 
	'Present this voucher to receive a complimentary Drink (Cascade Light or VB or glass of house wine). Only valid at Abruzzo Club between 1 to 15 December 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary Drink (Cascade Light or VB or glass of house wine). Only valid at Abruzzo Club between 16 to 31 December 2019. Not valid with any other offer.',
	'text 4 filler',
	'text 5 filler',
	'text 6 filler',
	'{"filters": []}'
),
(
	92, 
	'2019-10-01'::date, 
	'mailout', 
	'You have the chance to win these weekly prizes in December: Week 1 & 3 prizes: A $250 Christmas Hamper will be drawn at 11am on Monday 9 and 23 December 2019. Week 2 & 4 prizes: A $200 Bunnings Gift Card will be drawn at 11am on Monday 16 and 30 December 2019. Remember to bring in your four weekly entry coupons when visiting the venue to enter into each weekly prize draw for your chance to win. We look forward to seeing you soon.', 
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Taylors Lakes Hotel between 1 to 8 October 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Taylors Lakes Hotel between 9 to 15 October 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Taylors Lakes Hotel between 16 to 22 October 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Taylors Lakes Hotel between 23 to 29 October 2019. Not valid with any other offer.',
	'practice marketing text',
	'{"filters": []}'
),
(
	7322,
	'2019-11-01'::date,
	'bday',
	'Wishing you a very Happy Birthday and a wonderful year ahead. To help celebrate your Birthday, please find attached two special offers for you to use throughout the month. We look forward to seeing you soon.', 
	'Present this voucher to receive a complimentary Drink (Cascade Light or VB or glass of house wine). Only valid at Abruzzo Club between 1 to 15 December 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary Drink (Cascade Light or VB or glass of house wine). Only valid at Abruzzo Club between 16 to 31 December 2019. Not valid with any other offer.',
	'text 4 filler',
	'text 5 filler',
	'text 6 filler',
	'{"filters": []}'
),
(
	92, 
	'2019-11-01'::date, 
	'bday', 
	'Wishing you a very Happy Birthday and a wonderful year ahead. To help celebrate your Birthday, please find attached two special offers for you to use throughout the month. We look forward to seeing you soon.', 
	'Present this voucher to receive a complimentary Drink (Cascade Light or VB or glass of house wine). Only valid at Taylors Lakes Hotel between 1 to 15 December 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary Drink (Cascade Light or VB or glass of house wine). Only valid at Taylors Lakes Hotel between 16 to 31 December 2019. Not valid with any other offer.',
	'text 4 filler',
	'text 5 filler',
	'text 6 filler',
	'{"filters": []}'
),
(
	92, 
	'2019-12-01'::date, 
	'mailout', 
	'You have the chance to win these weekly prizes in December: Week 1 & 3 prizes: A $250 Christmas Hamper will be drawn at 11am on Monday 9 and 23 December 2019. Week 2 & 4 prizes: A $200 Bunnings Gift Card will be drawn at 11am on Monday 16 and 30 December 2019. Remember to bring in your four weekly entry coupons when visiting the venue to enter into each weekly prize draw for your chance to win. We look forward to seeing you soon.', 
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Taylors Lakes Hotel between 1 to 8 December 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Taylors Lakes Hotel between 9 to 15 December 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Taylors Lakes Hotel between 16 to 22 December 2019. Not valid with any other offer.',
	'Present this voucher to receive a complimentary drink (Glass of house wine or glass of soft drink). Only valid at Taylors Lakes Hotel between 23 to 29 December 2019. Not valid with any other offer.',
	'practice marketing text',
	'{"filters": []}'
)
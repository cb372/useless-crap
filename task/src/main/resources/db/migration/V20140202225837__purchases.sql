create table purchases (
  id integer auto_increment primary key not null,
  user_id bigint not null,
  amount numeric not null,
  created_at timestamp not null);
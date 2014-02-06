create table tags(
    id serial not null primary key,
    name varchar not null unique);

create table purchases_tags(
    purchase_id int not null references purchases(id),
    tag_id int not null references tags(id));
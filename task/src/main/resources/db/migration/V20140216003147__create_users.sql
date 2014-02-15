create table user( -- Can't call it users because this conflicts with a built-in h2 table
    id bigint not null primary key,
    joined_at timestamp not null default current_timestamp,
    currency varchar(1) not null default '¥'
);
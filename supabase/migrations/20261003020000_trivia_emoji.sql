-- Emoji de cada jugador, para que se encuentre rápido en la TV. Lo asigna el server al
-- primer ingreso (lib/trivia/emojis.ts) y queda fijo en todas sus partidas.

alter table trivia_players add column emoji text check (char_length(emoji) <= 16);

-- Cambia el tipo de retorno: hay que recrearlas.
drop function trivia_day_board();
drop function trivia_export(date);

create function trivia_day_board()
returns table (
  player_id uuid, name text, emoji text, city text, hidden boolean, best int, games int
)
language sql
stable
set search_path = public
as $$
  select p.id, p.name, p.emoji, p.city, p.hidden, max(s.score)::int, count(*)::int
  from trivia_game_scores s
  join trivia_games g on g.id = s.game_id
  join trivia_players p on p.id = s.player_id
  where g.podium_at <= now()
    and (g.started_at at time zone 'America/Argentina/Cordoba')::date
      = (now() at time zone 'America/Argentina/Cordoba')::date
  group by p.id
  order by max(s.score) desc, min(g.started_at) asc
$$;

create function trivia_export(p_day date)
returns table (
  game int, started_at timestamptz, player_id uuid, name text, emoji text, city text,
  province text, email text, hidden boolean, score int
)
language sql
stable
set search_path = public
as $$
  select g.number, g.started_at, p.id, p.name, p.emoji, p.city, p.province, p.email,
    p.hidden, s.score
  from trivia_game_scores s
  join trivia_games g on g.id = s.game_id
  join trivia_players p on p.id = s.player_id
  where g.started_at is not null
    and (g.started_at at time zone 'America/Argentina/Cordoba')::date = p_day
  order by g.number, s.score desc
$$;

revoke execute on function trivia_day_board(), trivia_export(date)
  from public, anon, authenticated;
grant execute on function trivia_day_board(), trivia_export(date) to service_role;

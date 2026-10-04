-- Reiniciar el ranking del día desde el stand: no borra nada (el CSV sigue completo para el
-- sorteo), solo el ranking de la TV y de los celulares empieza a contar desde ese momento.

alter table trivia_settings add column ranking_reset_at timestamptz;

create or replace function trivia_day_board()
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
    and g.started_at >= coalesce(
      (select ranking_reset_at from trivia_settings where id = 1), '-infinity')
  group by p.id
  order by max(s.score) desc, min(g.started_at) asc
$$;

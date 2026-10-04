-- Cupo de la sala configurable desde el stand. 500 es el techo: es lo que el server lee de
-- una partida (lib/trivia/server.ts, loadGameData).

alter table trivia_settings
  add column max_players int not null default 500 check (max_players between 1 and 500);

-- Igual que antes, pero con la sala llena no anota a nadie nuevo (los que ya están, siguen).
create or replace function trivia_join(
  p_player uuid,
  p_extend_s int,
  p_extend_max_s int
) returns uuid
language plpgsql
set search_path = public
as $$
declare
  s trivia_settings;
  g trivia_games;
  last_end timestamptz;
  start_at timestamptz;
  extended timestamptz;
begin
  select * into s from trivia_settings where id = 1 for update;
  select * into g from trivia_games where started_at is null limit 1 for update;
  if not found then
    raise exception 'trivia: no hay lobby';
  end if;

  if not exists (select 1 from trivia_entries where game_id = g.id and player_id = p_player)
    and (select count(*) from trivia_entries where game_id = g.id) >= s.max_players then
    raise exception 'trivia: sala llena';
  end if;

  insert into trivia_entries (game_id, player_id)
  values (g.id, p_player)
  on conflict do nothing;

  if s.paused or s.manual_lobby then
    return g.id;
  end if;

  if g.lobby_ends_at is null then
    -- Con una partida manual en curso, la cuenta arranca (trivia_tick) cuando termine.
    if trivia_manual_running() then
      return g.id;
    end if;
    -- Primer jugador: arranca la cuenta (después de la partida en curso, si hay una).
    select max(ends_at) into last_end from trivia_games where started_at is not null;
    start_at := greatest(now(), coalesce(last_end, now()))
      + make_interval(secs => (g.timeline ->> 'lobby')::numeric);
    update trivia_games
    set lobby_ends_at = start_at,
        lobby_max_at = start_at + make_interval(secs => p_extend_max_s)
    where id = g.id;
  else
    -- Entró sobre el final: la cuenta vuelve a p_extend_s, sin pasar el tope.
    extended := least(
      coalesce(g.lobby_max_at, g.lobby_ends_at),
      now() + make_interval(secs => p_extend_s)
    );
    if extended > g.lobby_ends_at then
      update trivia_games set lobby_ends_at = extended where id = g.id;
    end if;
  end if;

  return g.id;
end;
$$;

-- Lobby que espera a la gente: la cuenta regresiva arranca con el primer jugador (no al
-- crearse el lobby) y se estira si alguien entra sobre el final, con un tope. Escanear y
-- completar nombre y ciudad lleva 20-40 s: con una cuenta fija, mucha gente quedaba
-- afuera por segundos.
--
-- `lobby_ends_at` null ahora significa "esperando jugadores" (o loop en pausa, según
-- `trivia_settings.paused`). `lobby_max_at` es el tope de las extensiones.

alter table trivia_games add column lobby_max_at timestamptz;

update trivia_settings
set timeline = jsonb_set(timeline, '{lobby}', '45')
where (timeline ->> 'lobby')::int = 30;

alter table trivia_settings alter column timeline set default
  '{"lobby":45,"mc":15,"tf":10,"price":20,"reveal":6,"priceReveal":8,"top5":5,"podium":15}';

-- El lobby en curso pasa a esperar jugadores si todavía no tiene ninguno.
update trivia_games g
set lobby_ends_at = null
where g.started_at is null
  and not exists (select 1 from trivia_entries e where e.game_id = g.id);

create or replace function trivia_tick(
  p_timeline jsonb,
  p_play_ms int,
  p_podium_ms int,
  p_question_ids text[]
) returns jsonb
language plpgsql
set search_path = public
as $$
declare
  s trivia_settings;
  g trivia_games;
  players int;
begin
  select * into s from trivia_settings where id = 1 for update;

  for i in 1..10 loop
    select * into g from trivia_games where started_at is null order by number desc limit 1;

    if not found then
      -- El lobby nuevo espera al primer jugador (trivia_join arranca la cuenta).
      insert into trivia_games (lobby_ends_at, timeline, play_ms, podium_ms, question_ids)
      values (null, p_timeline, p_play_ms, p_podium_ms, p_question_ids);
      continue;
    end if;

    exit when g.lobby_ends_at is null or now() < g.lobby_ends_at;

    select count(*) into players from trivia_entries where game_id = g.id;
    if players = 0 then
      -- No debería pasar (la cuenta arranca con un jugador): vuelve a esperar.
      update trivia_games set lobby_ends_at = null, lobby_max_at = null where id = g.id;
      exit;
    end if;

    update trivia_games
    set started_at = g.lobby_ends_at,
        podium_at = g.lobby_ends_at + make_interval(secs => (g.play_ms - g.podium_ms) / 1000.0),
        ends_at = g.lobby_ends_at + make_interval(secs => g.play_ms / 1000.0)
    where id = g.id;
  end loop;

  return jsonb_build_object(
    'now', now(),
    'paused', s.paused,
    'timeline', s.timeline,
    'lobby', (select to_jsonb(x) from trivia_games x where started_at is null limit 1),
    'current', (
      select to_jsonb(x) from trivia_games x
      where started_at is not null and ends_at > now()
      order by number desc limit 1
    )
  );
end;
$$;

-- Anota al jugador en el lobby y maneja la cuenta regresiva. Corre después de
-- trivia_tick (el route handler la llama), con el mismo bloqueo de trivia_settings.
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

  insert into trivia_entries (game_id, player_id)
  values (g.id, p_player)
  on conflict do nothing;

  if s.paused then
    return g.id;
  end if;

  if g.lobby_ends_at is null then
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

revoke execute on function trivia_join(uuid, int, int) from public, anon, authenticated;
grant execute on function trivia_join(uuid, int, int) to service_role;

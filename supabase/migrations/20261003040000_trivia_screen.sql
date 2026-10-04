-- La trivia solo está abierta mientras la pantalla del stand (/juegos/trivia, detrás del
-- PIN) está encendida: la TV avisa cada pocos segundos (`trivia_screen_ping`) y si deja de
-- hacerlo, nadie puede sumarse y no arranca ninguna partida. Así, alguien que entra a
-- /trivia fuera de la feria no puede jugar solo.
--
-- Sin pantalla, el lobby frena su cuenta (los anotados siguen anotados); cuando vuelve,
-- `trivia_tick` la arranca de nuevo. Una partida en curso termina igual.
--
-- SCREEN_TIMEOUT_S en lib/trivia/config.ts tiene que coincidir con los 25 s de acá.

alter table trivia_settings add column screen_seen_at timestamptz;

create or replace function trivia_screen_live(s trivia_settings) returns boolean
language sql
stable
as $$
  select s.screen_seen_at is not null and s.screen_seen_at > now() - interval '25 seconds'
$$;

-- Aviso de la TV. Devuelve true si la pantalla recién aparece (para avisar a los celulares).
create or replace function trivia_screen_ping(p_leave boolean default false) returns boolean
language plpgsql
set search_path = public
as $$
declare
  s trivia_settings;
begin
  select * into s from trivia_settings where id = 1 for update;
  update trivia_settings
  set screen_seen_at = case when p_leave then null else now() end
  where id = 1;
  return not p_leave and not trivia_screen_live(s);
end;
$$;

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
  live boolean;
  last_end timestamptz;
  start_at timestamptz;
begin
  select * into s from trivia_settings where id = 1 for update;
  live := trivia_screen_live(s);

  for i in 1..10 loop
    select * into g from trivia_games where started_at is null order by number desc limit 1;

    if not found then
      -- El lobby nuevo espera al primer jugador (trivia_join arranca la cuenta).
      insert into trivia_games (lobby_ends_at, timeline, play_ms, podium_ms, question_ids)
      values (null, p_timeline, p_play_ms, p_podium_ms, p_question_ids);
      continue;
    end if;

    if not live then
      -- Sin pantalla no arranca nada: la cuenta se frena.
      if g.lobby_ends_at is not null then
        update trivia_games set lobby_ends_at = null, lobby_max_at = null where id = g.id;
      end if;
      exit;
    end if;

    exit when s.paused;

    select count(*) into players from trivia_entries where game_id = g.id;

    if g.lobby_ends_at is null then
      -- Volvió la pantalla con gente esperando: arranca la cuenta (como en trivia_join;
      -- los 30 s de tope son LOBBY_EXTEND_MAX_S).
      if players > 0 then
        select max(ends_at) into last_end from trivia_games where started_at is not null;
        start_at := greatest(now(), coalesce(last_end, now()))
          + make_interval(secs => (g.timeline ->> 'lobby')::numeric);
        update trivia_games
        set lobby_ends_at = start_at,
            lobby_max_at = start_at + interval '30 seconds'
        where id = g.id;
      end if;
      exit;
    end if;

    exit when now() < g.lobby_ends_at;

    if players = 0 then
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
    'open', live,
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

revoke execute on function trivia_screen_live(trivia_settings), trivia_screen_ping(boolean)
  from public, anon, authenticated;
grant execute on function trivia_screen_live(trivia_settings), trivia_screen_ping(boolean)
  to service_role;

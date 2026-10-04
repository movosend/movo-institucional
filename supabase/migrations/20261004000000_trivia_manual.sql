-- Controles manuales del stand, independientes entre sí:
--
-- * Lobby manual (`manual_lobby`): el lobby no arranca solo. Los jugadores se suman sin
--   cuenta regresiva y el stand inicia la partida (`trivia_start_lobby`).
-- * Pantallas manuales (`manual_slides`): las preguntas corren y cierran solas; la
--   revelación, el top 5 y el podio quedan quietos hasta que el stand pasa a la siguiente
--   (`trivia_advance`).
--
-- Las fases se calculan desde started_at (lib/trivia/engine.ts). Para frenar una partida
-- alcanza con congelar su reloj: `hold_ms` es el instante del reloj de la partida (ms desde
-- started_at) donde se detiene, siempre al final de una pantalla que no es pregunta. Al
-- avanzar, started_at se corre para que el segmento actual termine ahora y el reloj se
-- vuelve a congelar al final de la próxima de esas pantallas. Como `hold_ms` es relativo a
-- started_at, correr started_at (por ejemplo al cerrar una pregunta antes de tiempo, ver
-- trivia_close_question) lo mueve solo.
--
-- Mientras una partida está en manual no se sabe cuándo termina: `ends_at` queda 12 h
-- adelante y `podium_at` también, hasta que llega al podio. Al avanzar desde el podio la
-- partida termina (`ends_at` = ahora).

alter table trivia_settings
  add column manual_lobby boolean not null default false,
  add column manual_slides boolean not null default false;

alter table trivia_games add column hold_ms int;

-- Hay una partida en curso con las pantallas en manual (no sabe cuándo termina).
create or replace function trivia_manual_running() returns boolean
language sql
stable
as $$
  select exists (
    select 1 from trivia_games
    where started_at is not null and hold_ms is not null and ends_at > now()
  )
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

    if s.manual_lobby then
      -- Lobby manual: nunca arranca solo (trivia_start_lobby).
      if g.lobby_ends_at is not null then
        update trivia_games set lobby_ends_at = null, lobby_max_at = null where id = g.id;
      end if;
      exit;
    end if;

    select count(*) into players from trivia_entries where game_id = g.id;

    if g.lobby_ends_at is null then
      -- Volvió la pantalla (o terminó la partida manual) con gente esperando: arranca la
      -- cuenta (como en trivia_join; los 30 s de tope son LOBBY_EXTEND_MAX_S). Con una
      -- partida manual en curso no se sabe cuándo termina: espera.
      if players > 0 and not trivia_manual_running() then
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

    -- Con las pantallas en manual, la primera pregunta corre sola y la partida se frena al
    -- final de su revelación (el primer lugar del template es de multiple choice:
    -- GAME_TEMPLATE).
    update trivia_games
    set started_at = g.lobby_ends_at,
        podium_at = case when s.manual_slides
          then g.lobby_ends_at + interval '12 hours'
          else g.lobby_ends_at + make_interval(secs => (g.play_ms - g.podium_ms) / 1000.0) end,
        ends_at = case when s.manual_slides
          then g.lobby_ends_at + interval '12 hours'
          else g.lobby_ends_at + make_interval(secs => g.play_ms / 1000.0) end,
        hold_ms = case when s.manual_slides
          then (((g.timeline ->> 'mc')::numeric + (g.timeline ->> 'reveal')::numeric) * 1000)::int - 1
          else null end
    where id = g.id;
  end loop;

  return jsonb_build_object(
    'now', now(),
    'paused', s.paused,
    'open', live,
    'manualLobby', s.manual_lobby,
    'manualSlides', s.manual_slides,
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

-- Igual que antes, pero con el lobby manual o una partida manual en curso solo anota: la
-- cuenta no arranca sola.
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

-- Inicia ahora la partida del lobby (lobby manual). false si no se puede: ya empezó, hay otra
-- en curso, la pantalla del stand está apagada o no hay jugadores.
create or replace function trivia_start_lobby(p_game uuid) returns boolean
language plpgsql
set search_path = public
as $$
declare
  s trivia_settings;
  g trivia_games;
  players int;
begin
  select * into s from trivia_settings where id = 1 for update;
  select * into g from trivia_games where id = p_game for update;
  if not found or g.started_at is not null then
    return false;
  end if;
  if not trivia_screen_live(s) then
    return false;
  end if;
  if exists (select 1 from trivia_games where started_at is not null and ends_at > now()) then
    return false;
  end if;
  select count(*) into players from trivia_entries where game_id = g.id;
  if players = 0 then
    return false;
  end if;

  update trivia_games
  set lobby_ends_at = null,
      lobby_max_at = null,
      started_at = now(),
      podium_at = case when s.manual_slides
        then now() + interval '12 hours'
        else now() + make_interval(secs => (g.play_ms - g.podium_ms) / 1000.0) end,
      ends_at = case when s.manual_slides
        then now() + interval '12 hours'
        else now() + make_interval(secs => g.play_ms / 1000.0) end,
      hold_ms = case when s.manual_slides
        then (((g.timeline ->> 'mc')::numeric + (g.timeline ->> 'reveal')::numeric) * 1000)::int - 1
        else null end
  where id = g.id;
  return true;
end;
$$;

-- Pasa a la siguiente pantalla de una partida manual. Los ms los calcula el route handler
-- con el motor (lib/trivia/engine.ts, `manualStep`): fin del segmento actual, `hold_ms` que
-- corresponde después de avanzar (null si el actual es el podio: la partida termina) e
-- inicio del podio.
-- `p_started_at` es el que vio el route handler: si otro pedido ya movió la partida, no
-- coincide y no se hace nada.
create or replace function trivia_advance(
  p_game uuid,
  p_started_at timestamptz,
  p_cur_to_ms int,
  p_next_hold_ms int,
  p_podium_from_ms int
) returns boolean
language plpgsql
set search_path = public
as $$
declare
  g trivia_games;
  new_start timestamptz;
begin
  perform 1 from trivia_settings where id = 1 for update;
  select * into g from trivia_games where id = p_game for update;
  if not found or g.started_at is distinct from p_started_at or g.hold_ms is null then
    return false;
  end if;

  if p_next_hold_ms is null then
    update trivia_games set hold_ms = null, ends_at = now() where id = p_game;
    return true;
  end if;

  new_start := now() - make_interval(secs => p_cur_to_ms / 1000.0);
  update trivia_games
  set started_at = new_start,
      hold_ms = p_next_hold_ms,
      podium_at = case when p_cur_to_ms >= p_podium_from_ms
        then new_start + make_interval(secs => p_podium_from_ms / 1000.0)
        else new_start + interval '12 hours' end,
      ends_at = new_start + interval '12 hours'
  where id = p_game;
  return true;
end;
$$;

-- Prende o apaga las pantallas manuales, también con una partida en curso. Al prenderlas,
-- `p_hold_ms` frena la partida en la próxima pantalla que no es pregunta y la cuenta del
-- lobby se frena (no se sabe cuándo termina); al apagarlas, el reloj sigue desde donde estaba.
create or replace function trivia_set_manual_slides(p_on boolean, p_hold_ms int)
returns void
language plpgsql
set search_path = public
as $$
begin
  perform 1 from trivia_settings where id = 1 for update;
  update trivia_settings set manual_slides = p_on, updated_at = now() where id = 1;

  if p_on then
    update trivia_games set lobby_ends_at = null, lobby_max_at = null where started_at is null;
    if p_hold_ms is not null then
      update trivia_games
      set hold_ms = p_hold_ms,
          ends_at = started_at + interval '12 hours',
          podium_at = case when podium_at > now() then started_at + interval '12 hours' else podium_at end
      where started_at is not null and ends_at > now() and hold_ms is null;
    end if;
  else
    update trivia_games g
    set started_at = now() - least(now() - g.started_at, make_interval(secs => g.hold_ms / 1000.0)),
        podium_at = now() - least(now() - g.started_at, make_interval(secs => g.hold_ms / 1000.0))
          + make_interval(secs => (g.play_ms - g.podium_ms) / 1000.0),
        ends_at = now() - least(now() - g.started_at, make_interval(secs => g.hold_ms / 1000.0))
          + make_interval(secs => g.play_ms / 1000.0),
        hold_ms = null
    where g.started_at is not null and g.hold_ms is not null and g.ends_at > now();
  end if;
end;
$$;

revoke execute on function
  trivia_manual_running(),
  trivia_start_lobby(uuid),
  trivia_advance(uuid, timestamptz, int, int, int),
  trivia_set_manual_slides(boolean, int)
  from public, anon, authenticated;
grant execute on function
  trivia_manual_running(),
  trivia_start_lobby(uuid),
  trivia_advance(uuid, timestamptz, int, int, int),
  trivia_set_manual_slides(boolean, int)
  to service_role;

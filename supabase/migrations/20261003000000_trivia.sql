-- Trivia de la feria (/trivia + /juegos/trivia). Proyecto de Supabase propio del evento:
-- no comparte nada con el backend de Movo. Todo el acceso pasa por los route handlers de
-- Next con la service role key; anon no puede leer ni escribir ninguna tabla (RLS sin
-- políticas + revoke). Al navegador solo llega la anon key para el canal broadcast `trivia`.
--
-- Cómo funciona el loop: siempre hay exactamente una partida en lobby (started_at null).
-- `trivia_tick()` la arranca cuando vence su lobby (si tiene jugadores; si no, reinicia la
-- cuenta) y crea la siguiente al instante, así quien escanea con una partida en curso ya
-- queda anotado en la próxima. Las fases de cada partida se calculan con el reloj a partir
-- de started_at y del timeline congelado en la fila (lib/trivia/engine.ts).

create table trivia_settings (
  id int primary key default 1 check (id = 1),
  paused boolean not null default false,
  -- Duraciones en segundos (ver DEFAULT_TIMELINE en lib/trivia/config.ts).
  timeline jsonb not null default
    '{"lobby":30,"mc":15,"tf":10,"price":20,"reveal":6,"priceReveal":8,"top5":5,"podium":15}',
  updated_at timestamptz not null default now()
);
insert into trivia_settings default values;

create table trivia_games (
  id uuid primary key default gen_random_uuid(),
  number int generated always as identity unique,
  created_at timestamptz not null default now(),
  -- null = loop pausado desde el stand (lobby sin cuenta regresiva).
  lobby_ends_at timestamptz,
  started_at timestamptz,
  podium_at timestamptz,
  ends_at timestamptz,
  timeline jsonb not null,
  -- Desde started_at hasta el fin del podio, y duración del podio (calculados en TS).
  play_ms int not null check (play_ms > 0),
  podium_ms int not null check (podium_ms > 0),
  -- Ids del banco de preguntas (lib/trivia/questions.ts), en orden.
  question_ids text[] not null
);
create index trivia_games_started_idx on trivia_games (started_at);
-- Una sola partida en lobby a la vez.
create unique index trivia_games_one_lobby on trivia_games ((true)) where started_at is null;

create table trivia_players (
  id uuid primary key,
  name text not null check (char_length(name) between 1 and 12),
  city text not null check (char_length(city) between 1 and 60),
  province text check (char_length(province) <= 40),
  email text check (char_length(email) <= 254),
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table trivia_entries (
  game_id uuid not null references trivia_games (id) on delete cascade,
  player_id uuid not null references trivia_players (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (game_id, player_id)
);
create index trivia_entries_player_idx on trivia_entries (player_id);

create table trivia_answers (
  game_id uuid not null,
  player_id uuid not null,
  q smallint not null check (q between 0 and 19),
  choice smallint,
  price int,
  -- Tiempo que tardó en responder, medido en el celular (validado en el server).
  client_ms int not null check (client_ms >= 0),
  points int not null check (points >= 0),
  received_at timestamptz not null default now(),
  primary key (game_id, player_id, q),
  foreign key (game_id, player_id) references trivia_entries (game_id, player_id) on delete cascade
);

alter table trivia_settings enable row level security;
alter table trivia_games enable row level security;
alter table trivia_players enable row level security;
alter table trivia_entries enable row level security;
alter table trivia_answers enable row level security;

-- Puntaje de cada jugador en cada partida.
create view trivia_game_scores with (security_invoker = true) as
select e.game_id, e.player_id, coalesce(sum(a.points), 0)::int as score
from trivia_entries e
left join trivia_answers a on a.game_id = e.game_id and a.player_id = e.player_id
group by e.game_id, e.player_id;

-- Loop de partidas. Los parámetros son la partida "propuesta" (timeline vigente y preguntas
-- sorteadas en TS): solo se usan si hay que crear una partida nueva.
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
  last_end timestamptz;
begin
  select * into s from trivia_settings where id = 1 for update;

  for i in 1..10 loop
    select * into g from trivia_games where started_at is null order by number desc limit 1;

    if not found then
      select max(ends_at) into last_end from trivia_games;
      insert into trivia_games (lobby_ends_at, timeline, play_ms, podium_ms, question_ids)
      values (
        case when s.paused then null
          else greatest(now(), coalesce(last_end, now()))
            + make_interval(secs => (p_timeline ->> 'lobby')::numeric)
        end,
        p_timeline, p_play_ms, p_podium_ms, p_question_ids
      );
      continue;
    end if;

    exit when g.lobby_ends_at is null or now() < g.lobby_ends_at;

    select count(*) into players from trivia_entries where game_id = g.id;
    if players = 0 then
      -- Nadie se sumó: el lobby vuelve a empezar.
      update trivia_games
      set lobby_ends_at = now() + make_interval(secs => (g.timeline ->> 'lobby')::numeric)
      where id = g.id;
      exit;
    end if;

    update trivia_games
    set started_at = g.lobby_ends_at,
        podium_at = g.lobby_ends_at + make_interval(secs => (g.play_ms - g.podium_ms) / 1000.0),
        ends_at = g.lobby_ends_at + make_interval(secs => g.play_ms / 1000.0)
    where id = g.id;
    -- La próxima vuelta crea el lobby siguiente.
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

-- Ranking del día (hora de Argentina): mejor partida terminada de cada jugador. Una partida
-- cuenta desde que empieza su podio.
create or replace function trivia_day_board()
returns table (player_id uuid, name text, city text, hidden boolean, best int, games int)
language sql
stable
set search_path = public
as $$
  select p.id, p.name, p.city, p.hidden, max(s.score)::int, count(*)::int
  from trivia_game_scores s
  join trivia_games g on g.id = s.game_id
  join trivia_players p on p.id = s.player_id
  where g.podium_at <= now()
    and (g.started_at at time zone 'America/Argentina/Cordoba')::date
      = (now() at time zone 'America/Argentina/Cordoba')::date
  group by p.id
  order by max(s.score) desc, min(g.started_at) asc
$$;

-- CSV del stand: una fila por jugador y partida del día indicado.
create or replace function trivia_export(p_day date)
returns table (
  game int, started_at timestamptz, player_id uuid, name text, city text, province text,
  email text, hidden boolean, score int
)
language sql
stable
set search_path = public
as $$
  select g.number, g.started_at, p.id, p.name, p.city, p.province, p.email, p.hidden, s.score
  from trivia_game_scores s
  join trivia_games g on g.id = s.game_id
  join trivia_players p on p.id = s.player_id
  where g.started_at is not null
    and (g.started_at at time zone 'America/Argentina/Cordoba')::date = p_day
  order by g.number, s.score desc
$$;

-- Solo la service role (route handlers) accede.
revoke all on trivia_settings, trivia_games, trivia_players, trivia_entries, trivia_answers,
  trivia_game_scores from anon, authenticated;
revoke execute on function trivia_tick(jsonb, int, int, text[]), trivia_day_board(),
  trivia_export(date) from public, anon, authenticated;
grant execute on function trivia_tick(jsonb, int, int, text[]), trivia_day_board(),
  trivia_export(date) to service_role;

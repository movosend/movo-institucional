-- Si todos los jugadores de la partida ya respondieron la pregunta en curso, no tiene
-- sentido esperar el resto del tiempo: la partida se adelanta para que la pregunta cierre
-- en `p_buffer_ms`. Como las fases se calculan desde started_at (lib/trivia/engine.ts),
-- alcanza con correr started_at, podium_at y ends_at hacia atrás. El lobby siguiente, si ya
-- tiene cuenta (arrancó con el fin de esta partida, ver trivia_join), se corre lo mismo.
--
-- `p_started_at` y `p_q_end` son los que vio el route handler: si otro pedido ya movió la
-- partida, started_at no coincide y no se hace nada.

create or replace function trivia_close_question(
  p_game uuid,
  p_started_at timestamptz,
  p_q smallint,
  p_q_end timestamptz,
  p_buffer_ms int
) returns boolean
language plpgsql
set search_path = public
as $$
declare
  g trivia_games;
  players int;
  answered int;
  shift interval;
begin
  -- Mismo orden de bloqueo que trivia_join (settings y después la partida).
  perform 1 from trivia_settings where id = 1 for update;
  select * into g from trivia_games where id = p_game for update;
  if not found or g.started_at is distinct from p_started_at then
    return false;
  end if;

  shift := p_q_end - (now() + make_interval(secs => p_buffer_ms / 1000.0));
  if shift <= interval '1 second' then
    return false;
  end if;

  select count(*) into players from trivia_entries where game_id = p_game;
  select count(*) into answered from trivia_answers where game_id = p_game and q = p_q;
  if players = 0 or answered < players then
    return false;
  end if;

  update trivia_games
  set lobby_ends_at = lobby_ends_at - shift,
      lobby_max_at = lobby_max_at - shift
  where started_at is null and lobby_ends_at >= g.ends_at;

  update trivia_games
  set started_at = started_at - shift,
      podium_at = podium_at - shift,
      ends_at = ends_at - shift
  where id = p_game;

  return true;
end;
$$;

revoke execute on function trivia_close_question(uuid, timestamptz, smallint, timestamptz, int)
  from public, anon, authenticated;
grant execute on function trivia_close_question(uuid, timestamptz, smallint, timestamptz, int)
  to service_role;

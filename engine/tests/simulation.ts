import {
  applyMove,
  createBotVsBotGame,
  getBotConfigForStake,
  getBotMove,
  getLegalMoves,
} from '../index';

const SIMULATION_GAMES = 1000;
const PLAYER_COUNT = 2;

interface SimResult {
  wins: Record<string, number>;
  totalMoves: number;
  errors: number;
}

function runSingleGame(seed: string): SimResult {
  let state = createBotVsBotGame(PLAYER_COUNT, seed);
  const wins: Record<string, number> = {};
  let totalMoves = 0;
  let errors = 0;

  const maxMoves = 500;

  while (state.status === 'active' && totalMoves < maxMoves) {
    const playerId = state.currentPlayerId;
    const config = getBotConfigForStake('bronze');

    const opponentCardCounts: Record<string, number> = {};
    for (const player of state.players) {
      opponentCardCounts[player.id] =
        state.hands[player.id]?.length ?? 0;
    }

    const move = getBotMove({
      botId: playerId,
      state,
      opponentCardCounts,
      config,
      calibrateDown: false,
    });

    if (!move) {
      const legal = getLegalMoves(state, playerId);
      if (legal.length === 0) {
        errors += 1;
        break;
      }
      errors += 1;
      break;
    }

    try {
      state = applyMove(state, move);
      totalMoves += 1;
    } catch {
      errors += 1;
      break;
    }
  }

  if (state.winnerId) {
    wins[state.winnerId] = 1;
  }

  return { wins, totalMoves, errors };
}

function main(): void {
  console.log(`Running ${SIMULATION_GAMES} bot vs bot simulations...`);

  let totalWins: Record<string, number> = {};
  let totalMoves = 0;
  let totalErrors = 0;
  let completedGames = 0;

  for (let i = 0; i < SIMULATION_GAMES; i += 1) {
    const result = runSingleGame(`sim-seed-${i}`);
    totalMoves += result.totalMoves;
    totalErrors += result.errors;

    for (const [id, count] of Object.entries(result.wins)) {
      totalWins[id] = (totalWins[id] ?? 0) + count;
      completedGames += count;
    }
  }

  console.log('\n--- Simulation Results ---');
  console.log(`Games completed: ${completedGames}/${SIMULATION_GAMES}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(`Avg moves per game: ${(totalMoves / SIMULATION_GAMES).toFixed(1)}`);
  console.log('Win distribution:', totalWins);

  if (totalErrors > SIMULATION_GAMES * 0.05) {
    console.error('FAIL: Error rate exceeds 5%');
    process.exit(1);
  }

  if (completedGames < SIMULATION_GAMES * 0.9) {
    console.error('FAIL: Completion rate below 90%');
    process.exit(1);
  }

  console.log('\nPASS: Engine simulation healthy');
}

main();

let tournamentMatchPlayers = [];

function checkAIName(name)
{
	// Remove white spaces and convert to uppercase
    name = name.replace(/\s+/g, '').toUpperCase();
    if (/^AI[1-9]$|^AI1[0-5]$|^AI$/.test(name))
		return true;
	return false;
}

/* Displays toast message with the winner of the tournament */
function displayWinner()
{
	let winner = tournamentManager.getTournamentWinner().displayName;
	let toast = document.getElementById('toast-winner');
	toast.textContent = `${winner} won the tournament!`;
	toast.style.visibility = "visible";
	setTimeout(function () { toast.style.visibility = "hidden"; }, 5000);
}

/* Clears the toast message with the winner of the tournament */
function clearDisplayWinner() {
	document.getElementById('toast-winner').style.visibility = "hidden";
}

document.addEventListener('DOMContentLoaded', function () {

	if (tournamentManager.isTournamentComplete()) {
		displayWinner();
		document.getElementById('next-match').style.display = "none";
		document.getElementById('start-next-match').style.display = "none";
	}

	document.getElementById('next-match').addEventListener('click', function () {
		handleNextMatch();
	});
	document.getElementById('start-next-match').addEventListener('click', async function () {
		await handleStartMatch();
	});
	document.getElementById('continue-tournament').addEventListener('click', function () {
		handleContinueTournament();
	});
});

function handleContinueTournament() {
	goToPage(TOURNAMENT_BRACKET_HREF);
	tournamentManager.renderTournament();
	if (tournamentManager.isTournamentComplete()) {
		console.log('tournament is complete and display winner');
		displayWinner();
		tournamentManager.resetTournament();
		document.getElementById('next-match').style.display = "none";
		document.getElementById('start-next-match').style.display = "none";
	}
}

async function handleStartMatch() {
	const match = tournamentManager.getNextMatch();
	const player1 = match.player1;
	const player2 = match.player2;

	document.getElementById('hidden-next-match').click();

	await new Promise((resolve) => {
		document.addEventListener('gameOver', resolve, { once: true });
	});

	document.getElementById('play-1-vs-1-local').style.display = 'none';
	document.getElementById('pong').style.display = 'none';
	document.getElementById('start-next-match').style.display = "none";
	document.getElementById('tournament-match').style.display = "block";
	document.getElementById('continue-tournament').style.display = "block";

	if (tournamentManager.isRoundComplete()) {
		tournamentManager.advanceToNextRound();
		tournamentManager.setupRound();
	}
}

function handleNextMatch() {
	goToPage(TOURNAMENT_MATCH_HREF);
	document.getElementById("t-player-score-1").style.display = "none";
	document.getElementById("t-player-score-2").style.display = "none";
	document.getElementById('start-next-match').style.display = "block";
	document.getElementById('continue-tournament').style.display = "none";

	let match = tournamentManager.getNextMatch();

	createMatchCard(match.player1.displayName, match.player2.displayName);
}


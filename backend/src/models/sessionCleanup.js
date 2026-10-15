// Live sessions that are still waiting for the host to press Start can be left behind
// when a host reopens the same quiz or closes the page. A new player must never land
// in one of those, because the join code belongs to the quiz, not to a single session.

function closeWaitingSessions(sessions, matches) {
  const closed = [];
  for (const [id, session] of Object.entries(sessions)) {
    if (session.status === 'waiting' && matches(session)) {
      clearTimeout(session.timer);
      delete sessions[id];
      closed.push(id);
    }
  }
  return closed;
}

// When a host starts a new session for a quiz, older waiting sessions of that quiz are closed
function closeWaitingSessionsOfQuiz(sessions, quizId) {
  return closeWaitingSessions(sessions, (s) => s.quizId === quizId);
}

// When a host leaves, the waiting sessions that host opened are closed
function closeWaitingSessionsOfHost(sessions, hostSocketId) {
  return closeWaitingSessions(sessions, (s) => s.hostId === hostSocketId);
}

module.exports = { closeWaitingSessionsOfQuiz, closeWaitingSessionsOfHost };

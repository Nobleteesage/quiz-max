const { v4: uuidv4 } = require('uuid');
const { quizzes, sessions } = require('../models/quizStore');

const handleSocketEvents = (io) => {

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // HOST CREATES A SESSION
    socket.on('host:create_session', ({ quizId }) => {
      const quiz = quizzes[quizId];
      if (!quiz) {
        socket.emit('error', { message: 'Quiz not found' });
        return;
      }

      const sessionId = uuidv4();
      sessions[sessionId] = {
        id: sessionId,
        quizId,
        hostId: socket.id,
        participants: {},
        currentQuestion: -1,
        status: 'waiting',
        startTime: null,
        timer: null
      };

      socket.join(sessionId);
      socket.emit('session:created', {
        sessionId,
        joinCode: quiz.joinCode,
        quiz
      });

      console.log('Session created: ' + sessionId);
    });

    // PARTICIPANT JOINS
    socket.on('participant:join', ({ joinCode, name }) => {
      const session = Object.values(sessions).find(
        (s) => quizzes[s.quizId] && quizzes[s.quizId].joinCode === joinCode && s.status === 'waiting'
      );

      if (!session) {
        socket.emit('error', { message: 'Invalid join code or quiz already started' });
        return;
      }

      session.participants[socket.id] = {
        id: socket.id,
        name,
        score: 0,
        answers: [],
        joinedAt: new Date().toISOString(),
        finishedAt: null
      };

      socket.join(session.id);

      socket.emit('participant:joined', {
        sessionId: session.id,
        quizTitle: quizzes[session.quizId].title,
        participantName: name
      });

      io.to(session.hostId).emit('host:participant_joined', {
        participants: Object.values(session.participants)
      });

      console.log(name + ' joined session: ' + session.id);
    });

    // HOST STARTS THE QUIZ
    socket.on('host:start_quiz', ({ sessionId }) => {
      const session = sessions[sessionId];
      if (!session || session.hostId !== socket.id) {
        socket.emit('error', { message: 'Unauthorized or session not found' });
        return;
      }

      const quiz = quizzes[session.quizId];
      if (quiz.questions.length === 0) {
        socket.emit('error', { message: 'Quiz has no questions' });
        return;
      }

      session.status = 'active';
      session.startTime = new Date().toISOString();
      session.currentQuestion = 0;

      sendQuestion(io, session, quiz);
    });

    // PARTICIPANT SUBMITS ANSWER
    socket.on('participant:answer', ({ sessionId, answerIndex }) => {
      const session = sessions[sessionId];
      if (!session || session.status !== 'active') return;

      const participant = session.participants[socket.id];
      if (!participant) return;

      const quiz = quizzes[session.quizId];
      const currentQ = quiz.questions[session.currentQuestion];

      if (participant.answers[session.currentQuestion] !== undefined) return;

      const isCorrect = answerIndex === currentQ.correctAnswer;
      const pointsEarned = isCorrect ? currentQ.points : -quiz.penaltyPoints;

      participant.score += pointsEarned;
      participant.answers[session.currentQuestion] = {
        answerIndex,
        isCorrect,
        pointsEarned
      };

      socket.emit('answer:result', {
        isCorrect,
        pointsEarned,
        currentScore: participant.score
      });

      const allAnswered = Object.values(session.participants).every(
        (p) => p.answers[session.currentQuestion] !== undefined
      );

      if (allAnswered) {
        clearTimeout(session.timer);
        moveToNext(io, session, quiz);
      }
    });

    // HOST MOVES TO NEXT QUESTION MANUALLY
    socket.on('host:next_question', ({ sessionId }) => {
      const session = sessions[sessionId];
      if (!session || session.hostId !== socket.id) return;

      const quiz = quizzes[session.quizId];
      clearTimeout(session.timer);
      moveToNext(io, session, quiz);
    });

    // DISCONNECT
    socket.on('disconnect', () => {
      console.log('User disconnected: ' + socket.id);

      for (const session of Object.values(sessions)) {
        if (session.participants[socket.id]) {
          delete session.participants[socket.id];
          io.to(session.hostId).emit('host:participant_left', {
            participants: Object.values(session.participants)
          });
        }
      }
    });
  });

  // HELPER FUNCTIONS
  const sendQuestion = (io, session, quiz) => {
    const question = quiz.questions[session.currentQuestion];
    const timeLimit = quiz.timeLimit;

    io.to(session.id).emit('quiz:question', {
      questionIndex: session.currentQuestion,
      totalQuestions: quiz.questions.length,
      text: question.text,
      options: question.options,
      points: question.points,
      timeLimit
    });

    console.log('Question ' + (session.currentQuestion + 1) + ' sent');

    session.timer = setTimeout(() => {
      moveToNext(io, session, quiz);
    }, timeLimit * 1000);
  };

  const moveToNext = (io, session, quiz) => {
    session.currentQuestion += 1;

    if (session.currentQuestion >= quiz.questions.length) {
      endQuiz(io, session);
    } else {
      sendQuestion(io, session, quiz);
    }
  };

  const endQuiz = (io, session) => {
    session.status = 'finished';

    const results = Object.values(session.participants)
      .map((p) => ({
        name: p.name,
        score: p.score,
        joinedAt: p.joinedAt,
        finishedAt: new Date().toISOString(),
        timeTaken: Math.round((new Date() - new Date(session.startTime)) / 1000) + 's'
      }))
      .sort((a, b) => b.score - a.score);

    io.to(session.id).emit('quiz:finished', { results });
    console.log('Quiz finished for session: ' + session.id);
  };
};

module.exports = { handleSocketEvents };
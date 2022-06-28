import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useSubjectData } from 'hooks/useSubjectData/useSubjectData';
import { Question as QuestionType } from 'validators/subjects';
import { Question } from 'views/SubjectAllQuestions/Question/Question';
import { ContentWrapper } from 'components/ContentWrapper/ContentWrapper';
import { Box, Button, CircularProgress, Typography } from '@material-ui/core';
import { Header } from 'components/Header/Header';
import { Helmet } from 'react-helmet';
import { Alert } from '@material-ui/lab';
import { useStyles } from './Exam.styles';
import {
  countTrue,
  formatForPercentage,
  getAlertSeverity,
  getObjectValue,
  getRandomQuestions,
  parseSearch,
} from './Exam.utils';

export const Exam = () => {
  const classes = useStyles();
  const location = useLocation();
  const { questionsCount = 10, successThreshold } = parseSearch(
    location.search,
  );

  const { subjectId } = useParams<{ subjectId: string }>();
  const subjectData = useSubjectData(subjectId);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [completed, setCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, boolean[]>>({});

  useEffect(() => {
    if (subjectData.state !== 'done') {
      return;
    }

    setQuestions(getRandomQuestions(subjectData.data.data, questionsCount));
  }, [questionsCount, subjectData]);

  const scrollToTop = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  const onReset = () => {
    if (subjectData.state !== 'done') {
      return;
    }

    setQuestions(getRandomQuestions(subjectData.data.data, questionsCount));
    setCompleted(false);
    setUserAnswers({});
    scrollToTop();
  };

  const onSubmit = () => {
    setCompleted(true);
    scrollToTop();
  };

  const onAnswerPick = (
    questionId: string,
    answerIndex: number,
    answerValue: boolean,
  ) => {
    const previousAnswer = getObjectValue(userAnswers, questionId);

    if (previousAnswer === undefined) {
      const question = questions.find(({ id }) => questionId === id);
      const answers = question?.answers ?? [];
      const booleanAnswers = answers.map((_, i) =>
        i === answerIndex ? answerValue : false,
      );

      setUserAnswers({ ...userAnswers, [questionId]: booleanAnswers });
      return;
    }

    const newBooleanAnswers = previousAnswer.map((oldValue, i) =>
      i === answerIndex ? answerValue : oldValue,
    );

    setUserAnswers({ ...userAnswers, [questionId]: newBooleanAnswers });
  };

  const questionsOutcomes = useMemo(() => {
    if (!completed) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(userAnswers).map(
        ([questionId, currentQuestionUserAnswers]) => {
          const question = questions.find(({ id }) => questionId === id);
          const answers = question?.answers ?? [];
          const answersValues = answers.map(({ correct }) => correct);

          const areAllCorrect = answersValues.every(
            (value, i) => value === (currentQuestionUserAnswers[i] ?? false),
          );

          return [questionId, areAllCorrect] as const;
        },
      ),
    );
  }, [completed, questions, userAnswers]);

  const correctQuestions = countTrue(Object.values(questionsOutcomes));
  const percentage = correctQuestions / questionsCount;

  if (subjectData.state === 'error' && subjectData.is404) {
    return (
      <>
        <Helmet>
          <title>{subjectId} | Generatory 3.0</title>
        </Helmet>
        <ContentWrapper noHeader>
          <Typography variant="h4" component="h1" align="center">
            Przedmiot nie został znaleziony
          </Typography>
          <Box display="flex" width="100%" justifyContent="center">
            <Button component={Link} to="/" variant="contained" color="primary">
              Wróć do Strony Głównej
            </Button>
          </Box>
        </ContentWrapper>
      </>
    );
  }

  if (subjectData.state === 'loading' || subjectData.state === 'error') {
    return (
      <>
        <Helmet>
          <title>{subjectId} | Generatory 3.0</title>
        </Helmet>
        <ContentWrapper noHeader>
          <Box display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        </ContentWrapper>
      </>
    );
  }

  return (
    <>
      <Header backButton backUrl={`/${subjectId}`}>
        {subjectData.data.title}
      </Header>
      <ContentWrapper>
        {completed && (
          <Alert
            severity={getAlertSeverity(percentage, successThreshold)}
            classes={{
              icon: classes.icon,
            }}
          >
            <Typography variant="h6" component="h2">
              Twój wynik: {correctQuestions} / {questionsCount} (
              {formatForPercentage(percentage)}%)
            </Typography>
          </Alert>
        )}
        {questions.map((question) => (
          <Question
            question={question}
            key={question.id}
            showUserSelect
            disableUserSelect={completed}
            showCorrect={completed}
            onAnswerPick={onAnswerPick}
            wasUserSelectCorrect={questionsOutcomes[question.id]}
          />
        ))}
        {!completed ? (
          <Button variant="contained" color="primary" onClick={onSubmit}>
            Sprawdź
          </Button>
        ) : (
          <Box display="flex" width="100%" style={{ gap: '16px' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={onReset}
              style={{ flex: '2' }}
            >
              Wygeneruj nowy test
            </Button>
            <Button
              variant="outlined"
              component={Link}
              style={{ flex: '1' }}
              to={{
                pathname: `/${subjectId}`,
                state: { testSettings: true },
              }}
            >
              Zmień parametry testu
            </Button>
          </Box>
        )}
      </ContentWrapper>
    </>
  );
};
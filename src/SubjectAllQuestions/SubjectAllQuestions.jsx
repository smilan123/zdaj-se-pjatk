import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';
import {
  Typography, Divider, CircularProgress, Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import ContentWrapper from '../ContentWrapper';
import Header from '../Header';
import Comments from '../Comments';

const useStyles = makeStyles({
  root: {
    padding: '1.5rem',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridGap: '1.5rem',
  },
  button: {
    textTransform: 'none',
  },
  questionHeader: {
    padding: '1rem',
  },
  text: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 'bold',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    height: '2.625rem',
    marginLeft: '0.5rem',
  },
});

const SubjectAllQuestions = () => {
  const classes = useStyles();
  const { subjectId } = useParams();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch(`/data/${subjectId}.json`).then((res) => res.json());

        setSubject(data);
        setLoading(false);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.errors(error);
      }
    };

    fetchData();
  }, [subjectId]);

  if (loading) {
    return (
      <ContentWrapper>
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      </ContentWrapper>
    );
  }

  const { data } = subject;
  const header = subject.title;

  return (
    <>
      <Header backButton>{header}</Header>
      <ContentWrapper>
        {data.map(({ question, answers, comments }) => (
          <Paper variant="outlined" key={question}>
            <header className={classes.questionHeader}>
              <Typography variant="h5" component="h2">
                {/* eslint-disable-next-line react/no-danger */}
                <span dangerouslySetInnerHTML={{ __html: question.trim().replace(/ - \(\d+\)/, '') }} />
              </Typography>
            </header>
            <List disablePadding>
              {answers.map(({ answer, correct }) => {
                const labelId = `checkbox-list-label-${answer}`;

                return (
                  <React.Fragment key={answer}>
                    <Divider />
                    <ListItem
                      role={undefined}
                      dense
                    >
                      <ListItemText
                        id={labelId}
                        primary={(
                          <Box fontWeight="fontWeightBold">
                            {/* eslint-disable-next-line react/no-danger */}
                            <span dangerouslySetInnerHTML={{ __html: answer }} />
                          </Box>
                      )}
                      />
                      <ListItemIcon>
                        <Checkbox
                          tabIndex={-1}
                          disableRipple
                          inputProps={{ 'aria-labelledby': labelId }}
                          checked={correct}
                          disabled
                        />
                      </ListItemIcon>
                    </ListItem>
                  </React.Fragment>
                );
              })}
              <Comments comments={comments} />
            </List>
          </Paper>
        ))}
      </ContentWrapper>
    </>
  );
};

export default SubjectAllQuestions;

import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';

const styles = theme => ({
  card: {
    display: 'flex',
    width: 300
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
    paddingRight: 0,
    paddingBottom: 0,
    width: 200
  },
  cover: {
    width: 85,
    marginLeft: 15
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 0,
    paddingBottom: 0,
  }
});

function MediaControlCard(props) {
  const { classes, theme } = props;

  return (
    <Card className={classes.card}>
      <div className={classes.details}>
        <CardContent className={classes.content}>
          <Typography variant="subtitle2" color="textSecondary">
            {props.repoTag}
          </Typography>
        </CardContent>
        <div className={classes.controls}>
          <IconButton aria-label="Delete">
          <DeleteIcon/>
          </IconButton>
        </div>
      </div>
      <CardMedia
        className={classes.cover}
        image="https://material-ui.com/static/images/cards/live-from-space.jpg"
        title="Live from space album cover"
      />
    </Card>
  );
}

MediaControlCard.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(MediaControlCard);

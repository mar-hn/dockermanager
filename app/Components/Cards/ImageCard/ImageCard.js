import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { 
  Delete as DeleteIcon,
  GetApp 
} from '@material-ui/icons';
import { 
  Divider, 
  Tooltip,
  Typography,
  IconButton,
  CardContent,
  Card,
  LinearProgress,
} from '@material-ui/core';
import DeleteImageConfirmationDialog from '../../Dialogs/DeleteImageConfirmationDialog';

const styles = () => ({
  card: {
    display: 'flex',
    // width: 300,
    height: 125
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
    width: 65
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 0,
    paddingBottom: 0,
  },
  media: {
    width: "10px",
    height: "10px"
  }
});


class ImageCard extends React.Component
{
  state = {
    openDeleteDialog: false,
    loading: false,
    pullLayers: {}
  }
  
  componentDidMount()
  {
    const {startDownload} = this.props;
    if(startDownload === true)
    this.handleDownloadClick();
  }

  handleDeleteClick = () =>
  {
    // Opens Confirmation Dialog
    this.setState({openDeleteDialog:true});
  }

  handleDeleteSubmit = () =>
  {     
    this.setState({
      openDeleteDialog:false,
      loading: true
    });

    
    this.deleteImage();
  }

  async deleteImage()
  {
    const { imageId, afterDeleteAction } = this.props;

    try {
        const image = await dockerapi.getImage(imageId);
        await image.remove();        
    } catch(ex)
    {
        console.error('[ERROR] Images->HandleDeleteClick:',ex);
        utils.electron.showError('Error while deleting image', String(ex));
        this.setState({loading: false});
        return;
    }

    afterDeleteAction(imageId);
  }


  handleCloseClick = () =>
  {
    // Close Confirmation Dialog
    this.setState({openDeleteDialog:false});
  }

  handleDownloadClick = () =>
  {
    const {repoTag} = this.props;
    const repository = `${repoTag}:latest`;
    this.setState({ loading: true });

    console.log(`[DEBUG] Initiating pull of ${repoTag}:latest`);

    if(process.platform === "win32")
    {
      utils.docker.pullImage(repository, this.handlePullFinish, this.handlePullProgress);
    }
    else
    {
      dockerapi.pull(repository, (err_, stream) => 
      {
          if(err_)
          {
              console.error('[Error] Image->HandleDownloadClick->Pull():',err_);
              utils.electron.showError('Error while downloading image',String(err_));
              this.setState({ loading: false });
              return;
          }
  
          console.log('[DEBUG] Pull started');        
          dockerapi.modem.followProgress(stream, this.handlePullFinish, this.handlePullProgress);
      });
    }
  }

  getDownloadProgress = () =>
  {
    const {pullLayers} = this.state;
    const totalLayers = Object.keys(pullLayers).length;
    let totalProgress = 0;  

    for(const id in pullLayers)
      totalProgress += (pullLayers[id].downloadProgress) ? pullLayers[id].downloadProgress : 0;

    return totalProgress/Math.max(totalLayers,1);
  }

  getExtractProgress = () =>
  {
    const {pullLayers} = this.state;
    const totalLayers = Object.keys(pullLayers).length;
    let totalProgress = 0;

    for(const id in pullLayers)
      totalProgress += (pullLayers[id].extractProgress) ? pullLayers[id].extractProgress : 0;

    return totalProgress/Math.max(totalLayers,1);
  }  

  handlePullProgress = (event) => 
  {
      if(event.progressDetail && event.progressDetail.current)
      {
        const pullLayers = lodash.cloneDeep(this.state.pullLayers);
        
        if(!pullLayers[event.id])
          pullLayers[event.id] = {};

        if(event.status === "Downloading")
          pullLayers[event.id].downloadProgress = ( (event.progressDetail.current / event.progressDetail.total) * 100 );

        if(event.status === "Extracting")
          pullLayers[event.id].extractProgress = ( (event.progressDetail.current / event.progressDetail.total) * 100 );

        this.setState({pullLayers});
      }   
  };

  handlePullFinish = (err,output) =>
  {
      const { afterDownloadAction } = this.props;

      if(err)
      {
          console.error('[Error] Image->HandleDownloadClick->Onfinished():',err);
          utils.electron.showError('Error while downloading image',String(err));
          this.setState({ loading: false });
          return;
      }

      afterDownloadAction(output);
  }


  render()
  {
    const { openDeleteDialog, loading} = this.state;
    const { 
      classes, 
      repoTag, 
      description,
      afterDeleteAction,
      afterDownloadAction
    } = this.props;

    const downloadProgress = this.getDownloadProgress();
    const extractProgress = this.getExtractProgress();
    
    const arrRepoTag = repoTag.split('/');
    let repoName = arrRepoTag[0];
    let ImageName = arrRepoTag.slice(1).join('/');
  
    if(ImageName === "")
    {
      ImageName = repoName;
      repoName = "🏅Official";
    }
  
    return (
      <Card className={classes.card}>
        <div className={classes.details}>
          <CardContent className={classes.content}>
            <Typography variant="caption" color="textSecondary" noWrap style={{fontWeight:'bold'}} >
              {repoName}
            </Typography>        
            <Tooltip title={ImageName}>
              <Typography variant="caption" color="textSecondary" noWrap >
                {ImageName}
              </Typography>
            </Tooltip>
            { description && description.length > 1 ?
                <Typography variant="caption" color="textSecondary" style={{fontSize:'10px',marginTop:'5px'}} >
                  {description}
                </Typography>
              : null
            }
          </CardContent>
          <Divider/>
          <div className={classes.controls}>
            { afterDeleteAction ?
              <IconButton aria-label="Delete" size="small" onClick={this.handleDeleteClick} disabled={loading}>
                <DeleteIcon fontSize="small"/>
              </IconButton>
              : null
            }
            { afterDownloadAction ?
              <IconButton aria-label="Download" size="small" onClick={this.handleDownloadClick} disabled={loading}>
                <GetApp fontSize="small"/>
              </IconButton>
              : null
            }
            {
              loading ?
              <div style={{flexGrow: 1, paddingRight: '10px'}}>
                <LinearProgress value={extractProgress} valueBuffer={downloadProgress} variant={(!downloadProgress) ? "indeterminate" : "buffer"} />
              </div>
              : null
            }
            
          </div>
        </div>
        
        <div
          style={{backgroundColor:"#303f9f"}}
          className={classes.cover}>
          <img 
            style={{width:"32px",marginLeft:18,marginTop:15}} 
            // src="https://kitematic.com/recommended/kitematic_html.png"
            src={utils.apps.getAppIcon(repoTag)}
            alt=""/>
        </div>
        
        <DeleteImageConfirmationDialog 
            open={openDeleteDialog}
            imgName={repoTag}
            handleClose={this.handleCloseClick}
            handleSubmit={this.handleDeleteSubmit}/>
      </Card>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ImageCard);

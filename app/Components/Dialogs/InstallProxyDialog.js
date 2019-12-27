import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ImageCard from '../Cards/ImageCard/ImageCard';
import { SharedConsumer } from '../../Context/ContextAPI';
import { withSnackbar } from 'notistack';

class ScrollDialog extends React.Component 
{
    handleAfterDownload = async (actions) =>
    {
        const {handleClose} = this.props;
        const container = await utils.apps.createProxy();
        container.start();
        this.props.enqueueSnackbar(`Successfully installed Nginx Proxy`, {variant: 'success'});
        actions.showInstallDialog(false);
    }

    render() {
        const {open, handleClose} = this.props;

        return (
        <SharedConsumer>
            {({ state, actions }) => 
            (
                <Dialog
                    open={state.openInstallDialog}
                    onClose={handleClose}
                    scroll="paper"
                    aria-labelledby="scroll-dialog-title"
                    >
                    <DialogTitle id="scroll-dialog-title">Installing Proxy</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                        Downloading...
                        </DialogContentText>
                        <ImageCard 
                                repoTag={utils.const.proxyImage} 
                                description={'Proxy used to access docker containers'}
                                startDownload
                                afterDownloadAction={() => {this.handleAfterDownload(actions)}}
                                />
                    </DialogContent>
                    <DialogActions>
                    </DialogActions>
                </Dialog>
            )}
        </SharedConsumer>
        )
        
    }
}

export default withSnackbar(ScrollDialog);
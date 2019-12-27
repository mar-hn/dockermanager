import React, { PureComponent } from 'react';
import ImageCard from '../../Components/Cards/ImageCard/ImageCard';
import classes from './Images.css';
import { Typography } from '@material-ui/core';

class ImagesPage extends PureComponent
{
    state = {
        dockerImages: null,
        availableImages: null
    };

    async componentDidMount()
    {
        const { globalActions } = this.props;
        globalActions.setViewTitle('Images');

        const dockerImages = await dockerapi.listImages();
        console.log(dockerImages);
        this.setState({dockerImages});
        this.refreshAvailableImages();
    }

    async refreshAvailableImages()
    {
        const { dockerImages } = this.state;
        const availableImages = await dockerapi.searchImages({term:`${utils.const.workRepository}/`});
        this.setState(
        {
            availableImages: availableImages.filter(img => 
            {
                for(const di of dockerImages)
                {
                    if(di.RepoTags && 
                        di.RepoTags.length > 0 && 
                        di.RepoTags[0].includes(img.name))
                        return false;
                }

                return true;
            })
        });
        console.log(availableImages);
    }

    handleAfterDelete = async (imageId) =>
    {
        const {dockerImages} = this.state;
        // Update List
        this.setState({
            dockerImages: dockerImages.filter((img) => img.Id !== imageId)
        });
        this.refreshAvailableImages();
    }

    handleAfterDownload = async () =>
    {
        // Reload after any download
        const dockerImages = await dockerapi.listImages();
        this.setState({dockerImages});
        this.refreshAvailableImages();

    }

    render() 
    {
        const {dockerImages, availableImages} = this.state;
        let installedList = <Typography variant="caption">Loading...</Typography>;
        let availableList = <Typography variant="caption">Loading...</Typography>;
        
        if(dockerImages)
        {
            installedList = dockerImages.map(img => 
                <ImageCard 
                    key={img.Id} 
                    repoTag={(img.RepoTags) ? img.RepoTags[0] : ''}
                    afterDeleteAction={this.handleAfterDelete}
                    imageId={img.Id}/>
            );
            if(installedList.length < 1)
                installedList = <Typography variant="caption">You have no app images installed.</Typography>;
        }

        if(availableImages)
        {
            availableList = availableImages.map(img => 
                <ImageCard 
                    key={img.name} 
                    repoTag={img.name} 
                    description={img.description}
                    afterDownloadAction={this.handleAfterDownload}/>
            );

            if(availableList.length < 1)
                availableList = <Typography variant="caption">Currently there are no more available apps.</Typography>;
        }


        return (
            <div>
                <Typography variant="h5">
                    Installed:
                </Typography>
                <div className={classes.cardList}>
                    {installedList}
                </div>
                <Typography variant="h5">
                    Available:
                </Typography>
                <div className={classes.cardList}>
                    {availableList}
                </div>                
            </div>

        )
    }
}
export default ImagesPage;
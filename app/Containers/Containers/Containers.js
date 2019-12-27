import React, { PureComponent } from 'react';
import AddIcon from '@material-ui/icons/Add';
import ImageCard from '../../Components/Cards/ContainerCard/ContainerCard';
import AddFloatingButton from '../../Components/Buttons/FloatingButton/FloatingButton';

import classes from './Containers.css';


class ContainersPage extends PureComponent
{
    state = {
        openAddDialog: false,
        dockerConts: null
    };

    componentDidMount()
    {
        //this.props.globalActions.app.setViewTitle('Containers');
        dockerapi.listContainers({all:true},(err, containers) =>
        {
            console.log(containers);
            this.setState({dockerConts:containers});
        });
    }

    handleClickOpenAddDialog = () => {
        this.setState({ openAddDialog: true });
    };

    handleCloseAddDialog = () => {
        this.setState({ openAddDialog: false });
    };

    handleClickFloatingAddButton = () =>
    {
        console.log(this.props);
        this.props.history.push("/container/add");
    };

    render() 
    {
        return (
            <div>
            {this.state.dockerConts ?
                <React.Fragment>
                    <p>Installed:</p>
                    <div className={classes.cardList}>
                        {this.state.dockerConts.map(cont => 
                            <ImageCard key={cont.Id} repoTag={cont.Names[0]}/>
                        )}
                    </div>
                </React.Fragment>                
                :
                <p>Loading...</p>
            }
            <AddFloatingButton
                icon={<AddIcon />}
                clicked={this.handleClickFloatingAddButton}/>
            {/* <AddDialog 
                open={this.state.openAddDialog}                
                handleClose={this.handleCloseAddDialog} /> */}
            </div>

        )
    }
}
export default ContainersPage;
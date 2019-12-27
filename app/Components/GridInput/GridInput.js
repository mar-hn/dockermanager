/* eslint-disable react/no-array-index-key */
import React from 'react';
import { IconButton } from '@material-ui/core';
import RemoveIcon from '@material-ui/icons/Delete';
import GridInputItem from './GridInputItem';

class GridInput extends React.PureComponent
{
    handleOnChangeInput = (index,itemKey,event) =>
    {
        const {parent, data, stateKey} = this.props;
        const newData = [...data];
        data[index][itemKey] = event.target.value;

        parent.setState({[stateKey] : newData});
    };


    handleClickRemoveButton = (index) =>
    {
        const {parent, data, stateKey} = this.props;
        const newData = [...data];
        newData.splice(index,1);
        parent.setState({[stateKey] : newData});
    };    

    render()
    {
        const { data, labels, inputHandlers } = this.props;
        const inputlabels = labels || [];
    
        let items = data.map((item,index) =>
        {
            return (
                <div key={`gridInput${index}`} className="row" style={{marginBottom: 0}}>
                    <GridInputItem 
                        obj={item}
                        objIndex={index} 
                        inputHandlers={inputHandlers}
                        handleOnChangeInput={this.handleOnChangeInput}
                        />                
                    <div className="col s3">
                        <IconButton 
                            onClick={this.handleClickRemoveButton.bind(this,index)}>
                            <RemoveIcon/>
                        </IconButton>
                    </div>           
                </div>
            )
        });
    
        if(items.length < 1)
        {
            items = ( 
                <div className="row" style={{marginBottom: 0}}>
                    <div className="col s6">
                        <p>No items</p> 
                    </div>
                </div>
            );
        }    
    
        return (
                <div className="row" style={{marginBottom: 0}}>
                    <div className="row" style={{marginBottom: 0}}>
                        {inputlabels.map((label,index) =>
                        {
                            return (
                                <div key={index} className="col s3">
                                    <span>{label}</span>
                                </div>
                            )
                        })}
                    </div>
                    {items}
                </div>           
        );        
    }
}

export default GridInput;
/* eslint-disable react/no-array-index-key */
import React from 'react';

const GridInputItem = (props) =>
{
    const {obj,inputHandlers} = props;

    const result = Object.keys(obj).map((key,index) => 
    {
        return (
            <div key={`gridInputItem${index}`} className="col s3">
                <input 
                    type={inputHandlers[key].type || 'text'}
                    style={{marginRight: 5}} 
                    value={obj[key]}
                    // onChange={inputHandlers[key].onChange.bind(this,props.objIndex)}
                    onChange={props.handleOnChangeInput.bind(this,props.objIndex,key)}
                />
            </div>
        );      
    });

    return result;
};


export default GridInputItem;
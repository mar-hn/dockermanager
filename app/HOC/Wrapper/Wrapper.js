import React from 'react';

const Wrapper = (props) =>
{
    const { children, show } = props;

    if(!show) return children;

    return (
        <props.Component/>
    )
};

export default Wrapper;
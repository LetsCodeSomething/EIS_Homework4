import React from 'react';

export function Checkbox(props) {
    const onChange = (event) => {
        props.updateFilters(props.filterName, event.target.checked, props.index);
    };
    
    return(
        <>
            <input type="checkbox" onChange={onChange} checked={props.value} disabled={props.disabled}/>
        </>
    );
}
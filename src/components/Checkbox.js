import React from 'react';

export function Checkbox(props) {
    const onChange = (event) => {
        props.updateFilters(props.filterName, event.target.checked, props.index);
    };

    if(props.value) {
        return(
            <>
                <input type="checkbox" onChange={onChange} checked disabled={props.disabled}/>
            </>
        );
    }
    
    return(
        <>
            <input type="checkbox" onChange={onChange} disabled={props.disabled}/>
        </>
    );
}
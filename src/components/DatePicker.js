import React from 'react';

export function DatePicker (props) {
    const onChange = (event) => {
        props.updateFilters(props.filterName, event.target.value, props.index);
    };

    //Quantum mechanics: when "props.value" gets copied into "displayedText",
    //this component receives an empty "value" parameter and displays nothing. 
    //But checking "props.value" for NaN doesn't break the component.

    //const displayedText = isNaN(props.value) ? "" : props.value;
    
    if(isNaN(props.value)) {
        return (
            <>
                <input type="date" onChange={onChange}/>
            </>
        );
    }

    return (
        <>
            <input type="date" value={props.value} onChange={onChange}/>
        </>
    );
}
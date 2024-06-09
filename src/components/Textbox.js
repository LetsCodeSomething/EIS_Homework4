import React from 'react';

export function IntNumberOnlyTextbox(props) {
    const onChange = (event) => {
        const re = /^[0-9\b]+$/;
        if (re.test(event.target.value)) {
            props.updateFilters(props.filterName, event.target.value, props.index);
        }
        else if(event.target.value === "") {
            props.updateFilters(props.filterName, NaN, props.index);
        }
    }

    const displayedText = isNaN(props.value) ? "" : props.value;

    return (
        <input type="text" value={displayedText} onChange={onChange}/>
    );
}

export function FloatNumberOnlyTextbox(props) {
    const onChange = (event) => {
        const re = /^([0-9]*[.])?[0-9]*$/;
        if (re.test(event.target.value)) {
            props.updateFilters(props.filterName, event.target.value, props.index);
        }
        else if(event.target.value === "") {
            props.updateFilters(props.filterName, NaN, props.index);
        }
    }

    const displayedText = isNaN(props.value) ? "" : props.value;

    return (
        <input type="text" value={displayedText} onChange={onChange}/>
    );
}
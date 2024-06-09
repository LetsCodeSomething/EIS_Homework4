import React from 'react';

export function DropDownList(props) {
    const onChange = (event) => {    
        props.updateFilters(props.filterName, event.target.value, props.index);
    };

    const options = props.values.map((item, index) => <option key={index} value={item[0]}>{item[1]}</option>);

    return(
        <>
            <select onChange={onChange} value={props.selectedValue} disabled={props.disabled}>
                {options}
            </select>
        </>
    );
}
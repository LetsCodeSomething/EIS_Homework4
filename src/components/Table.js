import React from 'react';

import {FilterSorter} from "./FilterSorter";
import {Grouper} from "./Grouper";

export function TableRow(props) {
    const cells = Object.values(props.row).map((item, index) => item === undefined ? <></> : <td key={index}> {item} </td>);

    return (
        <tr>
            {cells}
        </tr>
    );
}   

function PaginationButtons(props) {
    let pageNumbers = [];
    if(props.pagesCount < 8) {
        if(props.pagesCount > 1) {
            for (let i = 0; i < props.pagesCount; i++) {
                pageNumbers.push(i + 1);
            }
        }
    }
    else {
        if(props.selectedPage < 4) {
            for (let i = 0; i < props.selectedPage + 3; i++) {
                pageNumbers.push(i + 1);
            }
            
            //-1 represents the ellipsis.
            pageNumbers.push(-1);

            pageNumbers.push(props.pagesCount);
        }
        else if (props.selectedPage > props.pagesCount - 5) {
            pageNumbers.push(1);
            
            pageNumbers.push(-1);

            for (let i = props.selectedPage - 2; i < props.pagesCount; i++) {
                pageNumbers.push(i + 1);
            }
        }
        else {
            pageNumbers.push(1);
            pageNumbers.push(-1);

            for (let i = props.selectedPage - 2; i < props.selectedPage + 3; i++) {
                pageNumbers.push(i + 1);
            }

            pageNumbers.push(-1);
            pageNumbers.push(props.pagesCount);
        }
    }
    
    const onClick = (event) => {
        const text = event.target.innerHTML.trim();

        if(text !== "...") {
            props.updateSelectedPage(parseInt(text) - 1);
        }
    };

    const pageButtons = pageNumbers.map((item, index) => {
        let className = "pagination-button";
        if(item === -1) {
            className = "pagination-ellipsis";
        }
        else if (item - 1 === props.selectedPage) {
            className = "pagination-button-selected";
        }
         
        return item === -1 ? <div key={index} className={className} onClick={onClick}>...</div> : 
                             <div key={index} className={className} onClick={onClick}>{item}</div>;
    });

    return (
        <>
            {pageButtons}
        </>
    );
}

export function Table(props) {
    const [selectedPage, setSelectedPage] = React.useState(parseInt(props.selectedPage));
    const updateSelectedPage = (value) => setSelectedPage(value);

    const [tableData, setTableData] = React.useState(props.dataset);
    const updateTableData = (value) => {
        setTableData(value); 
        setSelectedPage(0);
    };
    const getRawTableData = () => {
        return props.dataset;
    };
    const getFilteredTableData = () => {
        return tableData;
    };

    //Computation of the amount of rows to display for the selected page.
    const pagesCount = Math.ceil(tableData.length * 1.0 / parseInt(props.rowsPerPage));
    const remainingRowsCount = tableData.length - selectedPage * parseInt(props.rowsPerPage);
    const sliceSize = remainingRowsCount >= parseInt(props.rowsPerPage) ? parseInt(props.rowsPerPage) : remainingRowsCount;

    //Creates table rows.
    const rows = tableData.slice(selectedPage * parseInt(props.rowsPerPage), 
                                 selectedPage * parseInt(props.rowsPerPage) + sliceSize).map((item, index) => <TableRow key={index} row={item}/>);
    
    return (
        <>
            <div className="flexbox-container">
                <FilterSorter getRawTableData={getRawTableData} getFilteredTableData={getFilteredTableData} updateTableData={updateTableData}/>
                <Grouper getRawTableData={getRawTableData}/>
            </div>
            <table className="table-data">
                <thead>
                    <TableRow row={Object.keys(props.dataset[0])} />
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
            <PaginationButtons pagesCount={pagesCount} selectedPage={selectedPage} updateSelectedPage={updateSelectedPage}/>
        </>
    );
}
import React from 'react';

import {IntNumberOnlyTextbox, FloatNumberOnlyTextbox} from "./Textbox";
import {DatePicker} from "./DatePicker";
import {DropDownList} from "./DropDownList";
import {Checkbox} from "./Checkbox";

export function FilterSorter(props) {
    const [counter, setCounter] = React.useState(0);
    const forceUpdate = () => {
        if(counter > 0) {
            setCounter(0);
        }
        else {
            setCounter(1);
        }
    };
    
    const FILTER_TYPE_INTEGER_INTERVAL = 0;
    const FILTER_TYPE_FLOAT_INTERVAL = 1;
    const FILTER_TYPE_DATE_INTERVAL = 2;
    const FILTER_TYPE_LIST = 3;

    const defaultFilters = {
        "Store":        [FILTER_TYPE_INTEGER_INTERVAL, NaN, NaN],
        "Date":         [FILTER_TYPE_DATE_INTERVAL,    NaN, NaN],
        "Weekly_Sales": [FILTER_TYPE_FLOAT_INTERVAL,   NaN, NaN], 
        "Holiday_Flag": [FILTER_TYPE_LIST,             -1],
        "Temperature":  [FILTER_TYPE_FLOAT_INTERVAL,   NaN, NaN], 
        "Fuel_Price":   [FILTER_TYPE_FLOAT_INTERVAL,   NaN, NaN],
        "CPI":          [FILTER_TYPE_FLOAT_INTERVAL,   NaN, NaN], 
        "Unemployment": [FILTER_TYPE_FLOAT_INTERVAL,   NaN, NaN]
    };

    //false means ascending order, true means descending.
    const defaultSorts = [
        {"key": -1, "order": false},
        {"key": -1, "order": false},
        {"key": -1, "order": false}
    ];

    const [filters, setFilters] = React.useState(defaultFilters);
    const [sorts, setSorts] = React.useState(defaultSorts);

    const updateFilters = (filterName, filterValue, index) => {
        let filtersCopy = Object.assign(filters);
        filtersCopy[filterName][index] = filterValue;

        let processedTableData = applySortsToData(applyFiltersToData(props.getRawTableData(), filtersCopy), sorts);
     
        forceUpdate();

        setFilters(filtersCopy);
        props.updateTableData(processedTableData);
    };
    
    const resetFilters = (event) => {
        setFilters(defaultFilters);
        props.updateTableData(applySortsToData(props.getRawTableData(), sorts));
    };

    const applyFiltersToData = (tableData, filtersCopy) => {
        const keys = Object.keys(filtersCopy);
        for(let i = 0; i < keys.length; i++) {
            const key = keys[i];

            if(filtersCopy[key][0] === FILTER_TYPE_INTEGER_INTERVAL) {
                const a = parseInt(filtersCopy[key][1]);
                const b = parseInt(filtersCopy[key][2]);
                if(!isNaN(a) && (isNaN(b) || b >= a)) {
                    tableData = tableData.filter(item => item[key] >= a);
                }
                if(!isNaN(b) && (isNaN(a) || b >= a)) {
                    tableData = tableData.filter(item => item[key] <= b);
                }
            }
            else if(filtersCopy[key][0] === FILTER_TYPE_FLOAT_INTERVAL) {
                const a = parseFloat(filtersCopy[key][1]);
                const b = parseFloat(filtersCopy[key][2]); 
                if(!isNaN(a) && (isNaN(b) || b >= a)) {
                    tableData = tableData.filter(item => item[key] >= a);
                }
                if(!isNaN(b) && (isNaN(a) || b >= a)) {
                    tableData = tableData.filter(item => item[key] <= b);
                }
            }
            else if(filtersCopy[key][0] === FILTER_TYPE_DATE_INTERVAL){
                const a = Date.parse(filtersCopy[key][1]);
                const b = Date.parse(filtersCopy[key][2]); 

                const stringToDate = (str, delimiter) => {
                    let parts = str.split(delimiter);
                    let dateObject = new Date(parts[2] + "-" + parts[1] + "-" + parts[0]);
                    return dateObject;
                };

                if(a && (!b || b >= a)) {
                    tableData = tableData.filter(item => stringToDate(item[key], "-") >= a);
                }
                if(b && (!a || b >= a)) {
                    tableData = tableData.filter(item => stringToDate(item[key], "-") <= b);
                }
            }
            else {
                const a = parseInt(filtersCopy[key][1]);
                if(a !== -1) {
                    tableData = tableData.filter(item => parseInt(item[key]) === a);
                }
            }
        }

        return tableData;
    };

    const updateSorts = (sortName, sortValue, index) => {
        //https://stackoverflow.com/questions/25937369/react-component-not-re-rendering-on-state-change
        let sortsCopy = sorts.slice();

        //Dropdown lists may return strings and integer numbers.
        //The type check is done here to avoid using "==" later.
        sortsCopy[index][sortName] = isNaN(parseInt(sortValue)) ? sortValue : parseInt(sortValue);

        if(index === 0) {
            if(sortsCopy[0]["key"] === -1) {
                sortsCopy[0]["order"] = false;
            }

            sortsCopy[1]["key"] = -1;
            sortsCopy[1]["order"] = false;
            sortsCopy[2]["key"] = -1;
            sortsCopy[2]["order"] = false;
        }
        else if(index === 1) {
            sortsCopy[2]["key"] = -1;
            sortsCopy[2]["order"] = false;
        }

        let processedTableData;
        if(sortsCopy[0]["key"] === -1) {
            processedTableData = applyFiltersToData(props.getRawTableData(), filters);
        }
        else {
            processedTableData = applySortsToData(props.getFilteredTableData(), sortsCopy);
        }

        forceUpdate();

        setSorts(sortsCopy);
        props.updateTableData(processedTableData.slice());
    };

    const resetSorts = (event) => {
        setSorts(defaultSorts);
        props.updateTableData(applyFiltersToData(props.getRawTableData(), filters));
    };

    const applySortsToData = (tableData, sortsCopy) => {
        if(sortsCopy[0]["key"] === -1) {
            return tableData;
        }

        const numberComparator = (a, b) => {
            return a < b ? -1 : (a > b ? 1 : 0);
        };

        const dateComparator = (a, b) => {
            const stringToDate = (str, delimiter) => {
                let parts = str.split(delimiter);
                let dateObject = new Date(parts[2] + "-" + parts[1] + "-" + parts[0]);
                return dateObject;
            };

            a = stringToDate(a, "-");
            b = stringToDate(b, "-");

            return a < b ? -1 : (a > b ? 1 : 0);
        };

        const comparator1 = sortsCopy[0]["key"] === "Date" ? dateComparator : numberComparator; 
        const comparator2 = sortsCopy[1]["key"] === "Date" ? dateComparator : numberComparator; 
        const comparator3 = sortsCopy[2]["key"] === "Date" ? dateComparator : numberComparator; 

        const order1 = sortsCopy[0]["order"] ? -1 : 1;
        const order2 = sortsCopy[1]["order"] ? -1 : 1;
        const order3 = sortsCopy[2]["order"] ? -1 : 1;

        if(sortsCopy[1]["key"] === -1) {
            const oneLevelSort = (a, b) => {
                let value = comparator1(a[sortsCopy[0]["key"]], b[sortsCopy[0]["key"]]);
                value = (value === 0) ? 1 : value;
                return value === -1 ? -order1 : order1;
            };

            return tableData.sort(oneLevelSort);
        }
        else if(sortsCopy[2]["key"] === -1) {
            const twoLevelSort = (a, b) => {
                let value = comparator1(a[sortsCopy[0]["key"]], b[sortsCopy[0]["key"]]);
                if(value !== 0) {
                    return value === -1 ? -order1 : order1;
                }

                let value2 = comparator2(a[sortsCopy[1]["key"]], b[sortsCopy[1]["key"]]);
                value2 = (value2 === 0) ? 1 : value2;
                return value2 === -1 ? -order2 : order2;
            };

            return tableData.sort(twoLevelSort);
        }

        const threeLevelSort = (a, b) => {
            let value = comparator1(a[sortsCopy[0]["key"]], b[sortsCopy[0]["key"]]);
            if(value !== 0) {
                return value === -1 ? -order1 : order1;
            }

            let value2 = comparator2(a[sortsCopy[1]["key"]], b[sortsCopy[1]["key"]]);
            if(value2 !== 0) {
                return value2 === -1 ? -order2 : order2;
            }
                
            let value3 = comparator3(a[sortsCopy[2]["key"]], b[sortsCopy[2]["key"]]);
            value3 = (value3 === 0) ? 1 : value3;
            return value3 === -1 ? -order3 : order3;
        };

        return tableData.sort(threeLevelSort);
    };

    const sortKeys = [
        [-1, "Нет"], 
        ["Store", "Магазин"], 
        ["Date", "Дата"], 
        ["Weekly_Sales", "Продажи за неделю"], 
        ["Holiday_Flag", "Выходной"], 
        ["Temperature", "Температура"], 
        ["Fuel_Price", "Цена топлива"], 
        ["CPI", "Цена за показ"], 
        ["Unemployment", "Безработица"]
    ];

    const sort1Disabled = sorts[0]["key"] === -1;

    const sort2Keys = sorts[0]["key"] === -1 ? [] : sortKeys.filter(item => item[0] !== sorts[0]["key"]);
    const sort2DropDownListDisabled = sort1Disabled;
    const sort2CheckboxDisabled = sorts[1]["key"] === -1;
    
    const sort3Keys = sorts[1]["key"] === -1 ? [] : sortKeys.filter(item => item[0] !== sorts[0]["key"] && item[0] !== sorts[1]["key"]);
    const sort3DropDownListDisabled = sorts[1]["key"] === -1;
    const sort3CheckboxDisabled = sorts[2]["key"] === -1;

    return (
        <>
            <div>
                <h4>Фильтр</h4>
                <table className="table-controls">
                    <tbody>
                        <tr>
                            <td>Магазин:</td>
                            <td>от <IntNumberOnlyTextbox value={filters["Store"][1]} filterName="Store" index={1} updateFilters={updateFilters}/></td>
                            <td>до <IntNumberOnlyTextbox value={filters["Store"][2]} filterName="Store" index={2} updateFilters={updateFilters}/></td>
                        </tr>
                        <tr>
                            <td>Дата:</td>
                            <td>от <DatePicker value={filters["Date"][1]} filterName="Date" index={1} updateFilters={updateFilters}/></td>
                            <td>до <DatePicker value={filters["Date"][2]} filterName="Date" index={2} updateFilters={updateFilters}/></td>
                        </tr>
                        <tr>
                            <td>Продажи за неделю:</td>
                            <td>от <FloatNumberOnlyTextbox value={filters["Weekly_Sales"][1]} filterName="Weekly_Sales" index={1} updateFilters={updateFilters}/></td>
                            <td>до <FloatNumberOnlyTextbox value={filters["Weekly_Sales"][2]} filterName="Weekly_Sales" index={2} updateFilters={updateFilters}/></td>
                        </tr>
                        <tr>
                            <td>Выходной:</td>
                            <td>
                                <DropDownList values={[[-1, "Не важно"], [1, "Да"], [0, "Нет"]]} selectedValue={filters["Holiday_Flag"][1]} disabled={false} filterName="Holiday_Flag" index={1} updateFilters={updateFilters}/>
                            </td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>Температура:</td>
                            <td>от <FloatNumberOnlyTextbox value={filters["Temperature"][1]} filterName="Temperature" index={1} updateFilters={updateFilters}/></td>
                            <td>до <FloatNumberOnlyTextbox value={filters["Temperature"][2]} filterName="Temperature" index={2} updateFilters={updateFilters}/></td>
                        </tr>
                        <tr>
                            <td>Цена топлива:</td>
                            <td>от <FloatNumberOnlyTextbox value={filters["Fuel_Price"][1]} filterName="Fuel_Price" index={1} updateFilters={updateFilters}/></td>
                            <td>до <FloatNumberOnlyTextbox value={filters["Fuel_Price"][2]} filterName="Fuel_Price" index={2} updateFilters={updateFilters}/></td>
                        </tr>
                        <tr>
                            <td>Цена за показ:</td>
                            <td>от <FloatNumberOnlyTextbox value={filters["CPI"][1]} filterName="CPI" index={1} updateFilters={updateFilters}/></td>
                            <td>до <FloatNumberOnlyTextbox value={filters["CPI"][2]} filterName="CPI" index={2} updateFilters={updateFilters}/></td>
                        </tr>
                        <tr>
                            <td>Безработица:</td>
                            <td>от <FloatNumberOnlyTextbox value={filters["Unemployment"][1]} filterName="Unemployment" index={1} updateFilters={updateFilters}/></td>
                            <td>до <FloatNumberOnlyTextbox value={filters["Unemployment"][2]} filterName="Unemployment" index={2} updateFilters={updateFilters}/></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td></td>
                            <td><input type="button" onClick={resetFilters} className="button-right" value="Очистить фильтры"/></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div>
                <h4>Сортировка</h4>
                <table className="table-controls">
                    <tbody>
                        <tr>
                            <td>Сортировать по</td>
                            <td></td>
                        </tr>
                        <tr>
                            <td><DropDownList values={sortKeys} selectedValue={sorts[0]["key"]} filterName="key" index={0} updateFilters={updateSorts}/></td>
                            <td>По убыванию <Checkbox value={sorts[0]["order"]} disabled={sort1Disabled} filterName="order" index={0} updateFilters={updateSorts}/></td>
                        </tr>
                        <tr>
                            <td><DropDownList values={sort2Keys} selectedValue={sorts[1]["key"]} disabled={sort2DropDownListDisabled} filterName="key" index={1} updateFilters={updateSorts}/></td>
                            <td>По убыванию <Checkbox value={sorts[1]["order"]} disabled={sort2CheckboxDisabled} filterName="order" index={1} updateFilters={updateSorts}/></td>
                        </tr>
                        <tr>
                            <td><DropDownList values={sort3Keys} selectedValue={sorts[2]["key"]} disabled={sort3DropDownListDisabled} filterName="key" index={2} updateFilters={updateSorts}/></td>
                            <td>По убыванию <Checkbox value={sorts[2]["order"]} disabled={sort3CheckboxDisabled} filterName="order" index={2} updateFilters={updateSorts}/></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td><input type="button" onClick={resetSorts} className="button-right" value="Сбросить сортировку"/></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}
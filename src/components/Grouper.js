import React from 'react';

import {DropDownList} from "./DropDownList";
import {Checkbox} from "./Checkbox";
import { TableRow } from "./Table";

export function Grouper(props) {
    const defaultFilters = {
        "key": [-1],
        "function": [false, false, false, false]
    };

    const [counter, setCounter] = React.useState(0);
    const forceUpdate = () => {
        if(counter > 0) {
            setCounter(0);
        }
        else {
            setCounter(1);
        }
    };

    const [filters, setFilters] = React.useState(defaultFilters);
    const updateFilters = (filterName, filterValue, index) => {
        let filtersCopy = Object.assign(filters);
        filtersCopy[filterName][index] = isNaN(parseInt(filterValue)) ? filterValue : parseInt(filterValue);

        if(filtersCopy["key"][0] === -1) {
            filtersCopy["function"] = [false, false, false, false];
        }

        //Force React to repaint the component.
        forceUpdate();

        setFilters(filtersCopy);
    };

    const resetFilters = (event) => {
        setFilters(defaultFilters);
    };

    const groupingKeys = [
        [-1, "Нет"], 
        ["Store", "Магазин"], 
        ["Date", "Дата"], 
        ["Holiday_Flag", "Выходной"], 
        ["Temperature", "Температура"], 
        ["Fuel_Price", "Цена топлива"], 
        ["CPI", "Цена за показ"], 
        ["Unemployment", "Безработица"]
    ];

    const functionNames = ["Кол.", "Макс.", "Мин.", "Сред."];
    const columnNames = [filters["key"][0]].concat(functionNames.filter((item, index) => (filters["function"][index])));
    const header = filters["key"][0] === -1 || columnNames.length === 1 ? <></> : <TableRow row={columnNames}/>;

    let rows = [];

    if (filters["key"][0] !== -1 && columnNames.length > 1) {
        //https://gist.github.com/JamieMason
        const groupBy = key => array =>
            array.reduce((objectsByKeyValue, obj) => {
                const value = obj[key];
                objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
                return objectsByKeyValue;
            }, {});

        const groupByKey = groupBy(filters["key"][0]);
        const groupedTableData = groupByKey(props.getRawTableData());

        const keys = Object.keys(groupedTableData);

        let quantity = [];
        let max = [];
        let min = [];
        let mean = [];

        if (filters["function"][0]) {
            quantity = keys.map(key => groupedTableData[key].length);
        }
        if (filters["function"][1]) {
            max = keys.map(key => Math.max(...groupedTableData[key].map(item => item["Weekly_Sales"])));
        }
        if (filters["function"][2]) {
            min = keys.map(key => Math.min(...groupedTableData[key].map(item => item["Weekly_Sales"])));
        }
        if (filters["function"][3]) {
            mean = keys.map(key => {
                let sum = groupedTableData[key].reduce((accumulator, current) => {return accumulator + current["Weekly_Sales"];}, 0);
                return sum /= 1.0 * groupedTableData[key].length;
            });
        }

        rows = keys.map((item, index) => <TableRow key={index} row={[item, quantity[index], max[index], min[index], mean[index]]}/>);
    }

    return(
        <>
            <div>
                <h4>Группировка</h4>
                <table>
                    <tbody>
                        <tr>
                            <td>Группировать по <DropDownList values={groupingKeys} selectedValue={filters["key"][0]} disabled={false} filterName="key" index={0} updateFilters={updateFilters}/></td>
                        </tr>
                        <tr>
                            <td>Использовать групповую функцию(и):</td>
                        </tr>
                        <tr>
                            <td><Checkbox value={filters["function"][0]} disabled={filters["key"][0] === -1} filterName="function" index={0} updateFilters={updateFilters}/> количество</td>
                        </tr>
                        <tr>
                            <td><Checkbox value={filters["function"][1]} disabled={filters["key"][0] === -1} filterName="function" index={1} updateFilters={updateFilters}/> максимум</td>
                        </tr>
                        <tr>
                            <td><Checkbox value={filters["function"][2]} disabled={filters["key"][0] === -1} filterName="function" index={2} updateFilters={updateFilters}/> минимум</td>
                        </tr>
                        <tr>
                            <td><Checkbox value={filters["function"][3]} disabled={filters["key"][0] === -1} filterName="function" index={3} updateFilters={updateFilters}/> среднее</td>
                        </tr>
                        <tr>
                            <td>Применить к столбцу <b>Weekly_Sales</b>.</td>
                        </tr>
                        <tr>
                            <td><input type="button" onClick={resetFilters} value="Сбросить группировку" className="button-right"/></td>
                        </tr>
                    </tbody>
                </table>
                <table className="table-data">
                    <thead>
                        {header}
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        </>
    );
}
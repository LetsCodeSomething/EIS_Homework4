import React from 'react';

import {FloatNumberOnlyTextbox, TextBox} from "./Textbox";
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
    
    const FilterType = {
        IntegerInterval: 0, 
        FloatInterval: 1, 
        DateInterval: 2, 
        CharacterString: 3,
        List: 4
    };

    const defaultFilters = {
        "title":         [FilterType.CharacterString, ""],
        "score":         [FilterType.FloatInterval,   NaN, NaN],
        "score_phrase":  [FilterType.List, -1], 
        "platform":      [FilterType.List, -1],
        "genre":         [FilterType.List, -1], 
        "release_date":  [FilterType.DateInterval,    NaN, NaN]
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
            
            if(filtersCopy[key][0] === FilterType.IntegerInterval) {
                const a = parseInt(filtersCopy[key][1]);
                const b = parseInt(filtersCopy[key][2]);
                if(!isNaN(a) && (isNaN(b) || b >= a)) {
                    tableData = tableData.filter(item => item[key] >= a);
                }
                if(!isNaN(b) && (isNaN(a) || b >= a)) {
                    tableData = tableData.filter(item => item[key] <= b);
                }
            }
            else if(filtersCopy[key][0] === FilterType.FloatInterval) {
                const a = parseFloat(filtersCopy[key][1]);
                const b = parseFloat(filtersCopy[key][2]); 
                if(!isNaN(a) && (isNaN(b) || b >= a)) {
                    tableData = tableData.filter(item => item[key] >= a);
                }
                if(!isNaN(b) && (isNaN(a) || b >= a)) {
                    tableData = tableData.filter(item => item[key] <= b);
                }
            }
            else if(filtersCopy[key][0] === FilterType.DateInterval) {
                const a = Date.parse(filtersCopy[key][1]);
                const b = Date.parse(filtersCopy[key][2]); 

                const convertToDate = (item) => {
                    return new Date(item["release_year"] + "-" + item["release_month"] + "-" + item["release_day"]);
                };

                if(a && (!b || b >= a)) {
                    tableData = tableData.filter(item => convertToDate(item) >= a);
                }
                if(b && (!a || b >= a)) {
                    tableData = tableData.filter(item => convertToDate(item) <= b);
                }
            }
            else if(filtersCopy[key][0] === FilterType.CharacterString) {
                if(filtersCopy[key][1].length > 0) {
                    const a = filtersCopy[key][1].toLowerCase();
                    tableData = tableData.filter(item => item[key].toString().toLowerCase().includes(a));
                }
            }
            else {
                if(parseInt(filtersCopy[key][1]) !== -1) {
                    if(filtersCopy[key][1] === "") {
                        tableData = tableData.filter(item => item[key] === "");
                    }
                    else {
                        const a = filtersCopy[key][1].toLowerCase();
                        tableData = tableData.filter(item => item[key].toLowerCase().includes(a));
                    }
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

        //Reset levels of sort if the previous level was modified.
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

        const dateComparator = (a, b, key) => {
            const convertToDate = (item) => {
                return new Date(item["release_year"] + "-" + item["release_month"] + "-" + item["release_day"]);
            };

            a = convertToDate(a);
            b = convertToDate(b);

            return a < b ? -1 : (a > b ? 1 : 0);
        };

        const otherTypesComparator = (a, b, key) => {
            return a[key] < b[key] ? -1 : (a[key] > b[key] ? 1 : 0);
        };

        const comparator1 = sortsCopy[0]["key"] === "release_date" ? dateComparator : otherTypesComparator; 
        const comparator2 = sortsCopy[1]["key"] === "release_date" ? dateComparator : otherTypesComparator; 
        const comparator3 = sortsCopy[2]["key"] === "release_date" ? dateComparator : otherTypesComparator; 

        const order1 = sortsCopy[0]["order"] ? -1 : 1;
        const order2 = sortsCopy[1]["order"] ? -1 : 1;
        const order3 = sortsCopy[2]["order"] ? -1 : 1;

        if(sortsCopy[1]["key"] === -1) {
            const oneLevelSort = (a, b) => {
                let value = comparator1(a, b, sortsCopy[0]["key"]);
                value = (value === 0) ? 1 : value;
                return value === -1 ? -order1 : order1;
            };

            return tableData.sort(oneLevelSort);
        }
        else if(sortsCopy[2]["key"] === -1) {
            const twoLevelSort = (a, b) => {
                let value = comparator1(a, b, sortsCopy[0]["key"]);
                if(value !== 0) {
                    return value === -1 ? -order1 : order1;
                }

                let value2 = comparator2(a, b, sortsCopy[1]["key"]);
                value2 = (value2 === 0) ? 1 : value2;
                return value2 === -1 ? -order2 : order2;
            };

            return tableData.sort(twoLevelSort);
        }

        const threeLevelSort = (a, b) => {
            let value = comparator1(a, b, sortsCopy[0]["key"]);
            if(value !== 0) {
                return value === -1 ? -order1 : order1;
            }

            let value2 = comparator2(a, b, sortsCopy[1]["key"]);
            if(value2 !== 0) {
                return value2 === -1 ? -order2 : order2;
            }
                
            let value3 = comparator3(a, b, sortsCopy[2]["key"]);
            value3 = (value3 === 0) ? 1 : value3;
            return value3 === -1 ? -order3 : order3;
        };

        return tableData.sort(threeLevelSort);
    };

    const scorePhrases = [
        [-1, "Не фильтровать"],
        ["Masterpiece", "Masterpiece (Шедевр)"],
        ["Amazing", "Amazing (Замечательно)"],
        ["Great", "Great (Отлично)"],
        ["Good", "Good (Хорошо)"],
        ["Okay", "Okay (Пойдёт)"],
        ["Mediocre", "Mediocre (Посредственно)"], 
        ["Bad", "Bad (Плохо)"],
        ["Awful", "Awful (Ужасно)"],
        ["Painful", "Painful (Тяжко)"],
        ["Unbearable", "Unbearable (Невыносимо)"],
        ["Disaster", "Disaster (Катастрофа)"]
    ];
    
    const [platforms, genres] = React.useMemo(() => {
        //https://gist.github.com/JamieMason
        const groupBy = key => array =>
            array.reduce((objectsByKeyValue, obj) => {
                const value = obj[key];
                objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
                return objectsByKeyValue;
            }, {});
        
        //Generate platforms list.
        const groupByPlatform = groupBy("platform");
        //Dropdown lists accept array of pairs of actual and displayed values.
        let platforms = [[-1, "Не фильтровать"]];
        Object.keys(groupByPlatform(props.getRawTableData())).sort().map(item => platforms.push([item, item]));
        
        //Generate genres list.
        const groupByGenre = groupBy("genre");
        let temp = [];
        Object.keys(groupByGenre(props.getRawTableData())).map(item => item.split(", ").map(subitem => temp.push(subitem)));
        let genres = [[-1, "Не фильтровать"]];
        //Some games don't have a genre field.
        [...new Set(temp)].sort().map(item => item === "" ? genres.push(["", "Не указан"]) : genres.push([item, item]));

        return [platforms, genres];
    }, []);

    const sortKeys = [
        [-1, "Нет"], 
        ["title", "Название"], 
        ["score", "Баллы"], 
        ["score_phrase", "Словесная оценка"], 
        ["platform", "Платформа"], 
        ["genre", "Жанр"], 
        ["release_date", "Дата выхода"]
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
                            <td>Название:</td>
                            <td><TextBox value={filters["title"][1]} filterName="title" index={1} updateFilters={updateFilters}/></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>Баллы:</td>
                            <td>от <FloatNumberOnlyTextbox value={filters["score"][1]} filterName="score" index={1} updateFilters={updateFilters}/></td>
                            <td>до <FloatNumberOnlyTextbox value={filters["score"][2]} filterName="score" index={2} updateFilters={updateFilters}/></td>
                        </tr>
                        <tr>
                            <td>Словесная оценка:</td>
                            <td><DropDownList values={scorePhrases} selectedValue={filters["score_phrase"][1]} filterName="score_phrase" index={1} updateFilters={updateFilters}/></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>Платформа:</td>
                            <td><DropDownList values={platforms} selectedValue={filters["platform"][1]} filterName="platform" index={1} updateFilters={updateFilters}/></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>Жанр:</td>
                            <td><DropDownList values={genres} selectedValue={filters["genre"][1]} filterName="genre" index={1} updateFilters={updateFilters}/></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>Дата выхода:</td>
                            <td>от <DatePicker value={filters["release_date"][1]} filterName="release_date" index={1} updateFilters={updateFilters}/></td>
                            <td>до <DatePicker value={filters["release_date"][2]} filterName="release_date" index={2} updateFilters={updateFilters}/></td>
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
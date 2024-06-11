import React from 'react';
import * as d3 from "d3";

export function Graph(props) {
    const GraphType = {
        Dot: 0, Histogram: 1, Animated: 2
    };

    const OxAxisType = {
        ReleaseYear: "release_year", Score: "score"
    };
    
    const marginX = 50;
    const marginY = 50;
    const height = 500;
    const width = 1000; 

    const [graphType,        setGraphType]        = React.useState(GraphType.Dot);
    const [oxAxisType,       setOxAxisType]       = React.useState(OxAxisType.ReleaseYear);
    const [animateFromIndex, setAnimateFromIndex] = React.useState(-1);
    const [animateToIndex,   setAnimateToIndex]   = React.useState(0);

    const [trigger, setTrigger] = React.useState(true);

    const graphData = React.useMemo(() => {
        let groupObj = d3.group(props.dataset, d => d[oxAxisType]);
        let groupedData =[];
    
        for(const entry of groupObj) {
            let count = entry[1].length;
            groupedData.push({x : entry[0], y : count});
        }

        return groupedData.sort((a, b) => {return a.x - b.x;});
    }, [oxAxisType]);

    const [scaleX, scaleY] = React.useMemo(() => {
        const range = d3.extent(graphData.map(d => d.y));

        const min = range[0]; 
        const max = range[1];
        
        let scaleX = d3.scaleBand()
            .domain(graphData.map(d => d.x))
            .range([0, width - 2 * marginX]);
   
        let scaleY = d3.scaleLinear()
            .domain([min * 0.85, max * 1.1 ])
            .range([height - 2 * marginY, 0]);

        return [scaleX, scaleY];
    }, [graphData]);

    const svgRef = React.useRef(null);
    //Main drawing function.
    React.useEffect(() => {
        let svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        svg.attr("height", height).attr("width", width);

        drawAxes(svg);
        drawData(svg, "blue");
    }, [animateFromIndex, animateToIndex, trigger]);
    
    const drawAxes = (svg) => {
        let axisX = d3.axisBottom(scaleX);
        let axisY = d3.axisLeft(scaleY);

        svg.append("g")
            .attr("transform", `translate(${marginX}, ${height - marginY})`)
            .call(axisX)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", d => "rotate(-45)");

        svg.append("g")
            .attr("transform", `translate(${marginX}, ${marginY})`)
            .call(axisY);        
    };

    const drawData = (svg, color) => {
        if(graphType === GraphType.Dot) {
            const r = 4;
            //const offset = (minMaxIndex === 0)? -r / 2 : r / 2;
            svg.selectAll(".dot")
                .data(graphData)
                .enter()
                .append("circle")
                .attr("r", r)
                .attr("cx", d => scaleX(d.x) + scaleX.bandwidth() / 2)
                .attr("cy", d => scaleY(d.y))
                .attr("transform", `translate(${marginX}, ${marginY})`)
                .style("fill", color);
        }
        else if(graphType === GraphType.Histogram) {
            const barWidth = 5.0;
            //const offset = (minMaxIndex === 0) ? -barWidth / 2 : barWidth / 2;
            svg.selectAll(".dot")
                .data(graphData)
                .enter()
                .append("rect")
                .attr("width", barWidth)
                .attr("x", d => scaleX(d.x) + scaleX.bandwidth() / 2)
                .attr("height", d => height - marginY * 2 - scaleY(d.y))
                .attr("transform", d => `translate(${marginX - barWidth / 2},${marginY + scaleY(d.y)})`)
                .style("fill", color);
        }
        else {
            //Animated line graph.
            const pathId = "path0";
            let line = createPath(svg, color, pathId);

            let path = svg.select("#"+pathId).datum(graphData).attr("d", line);

            //Compute the region of the graph that should be animated.
            let duration;

            let fromPathLength = 0;
            let toPathLength = 0;

            //Total length of all lines which the graph consists of.
            const pathLength = path.node().getTotalLength();

            if(animateFromIndex === -1) {
                duration = 2000;    

                fromPathLength = pathLength;
                toPathLength = 0;
            }
            else {
                //Scales return undefined, if the passed value is outside of their boundaries.
                for(let i = graphData.length - 1; i > animateToIndex; i--) {
                    toPathLength += Math.sqrt(Math.pow(scaleX(graphData[i].x) - scaleX(graphData[i - 1].x), 2) + 
                                              Math.pow(scaleY(graphData[i].y) - scaleY(graphData[i - 1].y), 2));
                }

                fromPathLength = pathLength;
                for(let i = 0; i < animateFromIndex; i++) {
                    fromPathLength -= Math.sqrt(Math.pow(scaleX(graphData[i].x) - scaleX(graphData[i + 1].x), 2) +
                                                Math.pow(scaleY(graphData[i].y) - scaleY(graphData[i + 1].y), 2));
                }
            
                duration = (fromPathLength - toPathLength) / pathLength * 2000;
            }

            //To animate the graph, stroke-dashoffset should be interpolated.
            //pathLength means that the graph should be fully hidden.
            //0 means that the graph should be fully drawn.
            path
                .attr("stroke-dashoffset", fromPathLength)
                .attr("stroke-dasharray", pathLength)
                .transition()
                .ease(d3.easeLinear)
                .duration(duration)
                .attr("stroke-dashoffset", toPathLength);
        }
    };

    const createPath = (svg, color, id) => {
        let line = d3.line()
                     .x(d => scaleX(d.x) + scaleX.bandwidth() / 2)
                     .y(d => scaleY(d.y));
        svg.append("path")
           .attr("id", id)  
           .attr("transform", `translate(${marginX}, ${marginY})`)
           .style("stroke-width", "2")
           .style("stroke", color);
       
        return line;
    };

    //--------------------------------------------

    const yearRadioButtonClicked = () => {
        setOxAxisType(OxAxisType.ReleaseYear);
    };

    const scoreRadioButtonClicked = () => {
        setOxAxisType(OxAxisType.Score);
    };
    
    const dotsRadioButtonClicked = () => {
        setGraphType(GraphType.Dot);
    };

    const histogramRadioButtonClicked = () => {
        setGraphType(GraphType.Histogram);
    };

    const animatedRadioButtonClicked = () => {
        setGraphType(GraphType.Animated);
    };

    //--------------------------------------------

    const drawGraphButtonClicked = () => {
        setAnimateFromIndex(-1);
        setAnimateToIndex(graphData.length - 1);
        setTrigger(!trigger);
    };

    const makeStepOnGraphButtonClicked = () => {
        if(animateToIndex < graphData.length - 1) {
            setAnimateFromIndex(animateFromIndex + 1);
            setAnimateToIndex(animateToIndex + 1);
        }
        //The graph is fully drawn, restart.
        else {
            setAnimateFromIndex(0);
            setAnimateToIndex(1);
        }
    };

    const animateGraphButtonClicked = () => {
        if(animateToIndex === graphData.length - 1) {
            return;
        }
        
        if(animateFromIndex === -1) {
            setAnimateFromIndex(-1);
            setAnimateToIndex(graphData.length - 1);
        }
        else {
            setAnimateFromIndex(animateFromIndex + 1);
            setAnimateToIndex(graphData.length - 1);
        }
    };

    const resetGraphButtonClicked = () => {
        let svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        svg.attr("height", 0).attr("width", 0);
    };

    return (
        <>
            <b>График</b>
            <p>Значение по оси OX</p>
            <input type="radio" onClick={yearRadioButtonClicked} name="oxType" checked={oxAxisType === OxAxisType.ReleaseYear}/>
                <label>Год</label><br/>
            <input type="radio" onClick={scoreRadioButtonClicked} name="oxType" checked={oxAxisType === OxAxisType.Score}/>
                <label>Баллы</label><br/>
            
            <p>Тип графика</p>
            <input type="radio" onClick={dotsRadioButtonClicked} name="graphType" checked={graphType === GraphType.Dot}/>
                <label>Точечный</label><br/>
            <input type="radio" onClick={histogramRadioButtonClicked} name="graphType" checked={graphType === GraphType.Histogram}/>
                <label>Столбчатый</label><br/>
            <input type="radio" onClick={animatedRadioButtonClicked} name="graphType" checked={graphType === GraphType.Animated}/>
                <label>Анимированные линии</label><br/>
            <p></p>

            <input type="button" onClick={drawGraphButtonClicked} value="Построить" style={{marginRight: 10 + "px"}}/>
            <input type="button" onClick={makeStepOnGraphButtonClicked} value="Выполнить шаг" hidden={graphType !== GraphType.Animated} style={{marginRight: 10 + "px"}}/>
            <input type="button" onClick={animateGraphButtonClicked} value="Достроить до конца" hidden={graphType !== GraphType.Animated} style={{marginRight: 10 + "px"}}/>
            <input type="button" onClick={resetGraphButtonClicked} value="Стереть"/><br/>
            
            <svg ref={svgRef} width={width} height={height}></svg>
        </>
    );
}
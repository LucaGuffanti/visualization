import * as d3 from 'd3'
import { between, SeasonColor, FunctioningDayColor, HolidayColor, basicScatterOpacity, FunctioningDayResize, HolidayResize, categoricalValues, transitionTime} from '../util';

class ScatterplotD3 {
    /**
     * Margin of the scatterplot
     */
    margin = { top: 65, right: 30, bottom: 65, left: 80 };

    /**
     * Size of the scatterplot
     */
    size;

    /**
     * Height of the scatterplot
     */
    height;

    /**
     * Width of the scatterplot
     */
    width;

    /**
     * SVG containing the scatterplot
     */
    scpSvg;

    /**
     * Component containing the dots
     */
    dotContainer;

    /**
     * Basic opacity of the dots
     */
    defaultOpacity=basicScatterOpacity;

    /**
     * Opacity of the dots when brushed
     */
    brushedOpacity=0.6;

    /**
     * Duration of the animations
     */
    duration=transitionTime;

    /**
     * Basic radius of the circles representing datapoints
     */
    circleRadius = 3.5;

    /**
     * Scale for the x axis
     */
    xScale;

    /**
     * Scale for the y axis
     */
    yScale;

    /**
     * 2D brush acting on the scatterplot
     */
    brush;
    
    /**
     * Current value of the attribute defining the x axis
     */
    currentXAttribute;

    /**
     * Current value of the attribute defining the y axis
     */
    currentYAttribute;

    /**
     * Current label of the x axis
     */
    currentXLabel;

    /**
     * Current label of the y axis
     */
    currentYLabel;
    
    /**
     * Component containing the legend of the scatterplot
     */
    legend;

    /**
     * External behaviors injected by the external controller.
     */
    behaviors;
    
    constructor(el){
        this.el=el;
    };
    

    // ================================================================
    // ===================== Initialization ===========================
    // ================================================================

    /**
    * Instatiates the scatterplot visualization
    * @param config configuration object for the visualization
    */
    create = function (config) {
        this.size = { width: config.size.width, height: config.size.height };
        
        // Get the effect size of the view by subtracting the margin
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;
        
        // Create the svg element
        this.scpSvg = d3.select(this.el).append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("class", "scpSvgG")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
        ;
        
        // Add a slight gray background to the scatterplot
        this.scpSvg.append("rect")
        .attr("width", this.width)
        .attr("height", this.height)
        .attr("fill", "#f9f9f9")
        ;
        
        // Add a container for the dots that is rendered under the brush component
        this.dotContainer = this.scpSvg.append("g")
        .attr("class", "dotContainer");
        ;
        
        // Define the scales for the two axes
        this.xScale = d3.scaleLinear().range([0, this.width]);
        this.yScale = d3.scaleLinear().range([this.height, 0]);
        
        // Add the x and y axis
        this.scpSvg.append("g")
        .attr("class", "xAxisG")
        .attr("transform", "translate(0," + this.height + ")")
        ;
        
        this.scpSvg.append("g")
        .attr("class", "yAxisG")
        ;
        
        // Add text labels for the x and y axis that will be rendered later
        this.scpSvg.append("text")
        .attr("class", "xAxisLabel")
        .attr("transform", "translate(" + (this.width / 2) + "," + (this.height + this.margin.bottom - 5) + ")")
        .style("text-anchor", "middle");
        
        this.scpSvg.append("text")
        .attr("class", "yAxisLabel")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - this.margin.left)
        .attr("x", 0 - (this.height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle");
        
        // Define the 2D brush
        this.brush = d3.brush()
        .extent([[0, 0], [this.width, this.height]])  
        .on('start', this.manageOnGoingBrush)         
        .on('brush', this.manageOnGoingBrush)         
        .on('end', this.manageBrushEnd)
        ;
        
        // And add the brush component to the scatterplot
        this.scpSvg.append('g')
        .attr('class', 'brush')
        .call(this.brush)
        ;
        
        // Finally, add the component for a legend on top of the scatterplot
        this.legend = this.scpSvg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(0," + (-30) + ")")
        ;
        
    }
    
    // ================================================================
    // ===================== Brushing and Linking =====================
    // ================================================================
    
    /**
     * Manage the update event of the 2D brush
     * @param e event containing the brush selection 
     */
    manageOnGoingBrush = (e) => {
        
        // First, enable the brush
        this.enableBrush();
        
        const selection = e.selection;
        if (!selection) {
            return;
        }
        
        // And if the selection exists, extract the bounds
        const [x0, y0] = selection[0];
        const [x1, y1] = selection[1];
        
        // Map to data space
        const x0Data = this.xScale.invert(x0);
        const x1Data = this.xScale.invert(x1);
        const y0Data = this.yScale.invert(y0);
        const y1Data = this.yScale.invert(y1);
        
        
        // Update the style of circles based on their data
        this.scpSvg.selectAll(".dotCircle")
        .style("opacity", (d) => {
            const xInRange = between(d[this.currentXAttribute], x0Data, x1Data);
            const yInRange = between(d[this.currentYAttribute], y1Data, y0Data);
            return xInRange && yInRange ? this.brushedOpacity : this.defaultOpacity;
        })
        ;

        // And link the selection to the other visualization
        this.behaviors.handleSelectionChange({x0Data, x1Data}, {y0Data, y1Data}, this.currentXAttribute, this.currentYAttribute);
    }
    
    /**
     * Manage the linking process, with a selection coming from a second visualization
     * @param dim1Selection selection along a first dimension 
     * @param dim2Selection selection along a second dimension
     * @param dim1Name attribute associated to the first dimension
     * @param dim2Name attribute associated to the second dimension
     * @returns 
     */
    linkExternalSelection = (dim1Selection, dim2Selection, dim1Name, dim2Name) => {
    
        // Act only if the selections exist
        if (dim1Selection === null || dim2Selection === null) 
            return;

        // Extract the values
        const dim1Min = dim1Selection[0];
        const dim1Max = dim1Selection[1];
        const dim2Min = dim2Selection[0];
        const dim2Max = dim2Selection[1];
        
        // Cancel the brush
        this.cancelBrush();

        // And update the opacity of the dots if they are actually selected
        this.scpSvg.selectAll(".dotCircle")
        .style("opacity", (d) => {
            const dim1InRange = between(d[dim1Name], dim1Min, dim1Max);
            const dim2InRange = between(d[dim2Name], dim2Min, dim2Max);
            
            return dim1InRange && dim2InRange ? this.brushedOpacity : this.defaultOpacity;
        })
        ;
    }
    
    /**
     * Activate the brush, by acting on the selection and handles
     */
    enableBrush = () => {
        this.scpSvg.selectAll(".brush")
        .selectAll(".selection")
        .attr("display", "initial")
        ;
        
        this.scpSvg.selectAll(".brush")
        .selectAll(".handle")
        .attr("display", "initial")
        ;
    }

    /**
     * Eliminate the brush from the visualization, by acting on the selection and handles.
     */
    cancelBrush = () => {
        this.scpSvg.selectAll(".brush")
        .selectAll(".selection")
        .attr("display", "none")
        ;
        
        this.scpSvg.selectAll(".brush")
        .selectAll(".handle")
        .attr("display", "none")
        ;
        
    }

    // ================================================================
    // ===================== Update and Rendering =====================
    // ================================================================
    
    /**
     * Update solely the dots component by changing the color, the size, and transforming the position
     * @param selection components that will be updated
     * @param xAttribute attribute associated to the x axis
     * @param yAttribute attribute associated to the y axis
     * @param categorical categorical attribute associated to the chosen color encoding
     */
    updateDots(selection,xAttribute,yAttribute, categorical){
        // transform selection
        selection.selectAll(".dotCircle")
        .transition().duration(this.transitionDuration)
        .attr("transform", (item)=>{
            // use scales to return shape position from data values
            return "translate("+this.xScale(item[xAttribute])+","+this.yScale(item[yAttribute])+")";
        })
        // Based on the categorical, the dots have different inner colors
        .attr("fill", (item)=>{
            if (categorical === 'Seasons') {
                return SeasonColor[item['Seasons']];
            }
            else if (categorical === 'FunctioningDay') {
                return FunctioningDayColor[item['FunctioningDay']];
            }
            else if (categorical === 'Holiday') {
                return HolidayColor[item['Holiday']];
            }
            else {
                return "black";
            }
        })
        // Based on the categorical, the dots have different radii
        .attr("r", (item) => {
            if (categorical === 'Seasons') {
                return this.circleRadius;
            }
            else if (categorical === 'FunctioningDay') {
                return this.circleRadius * FunctioningDayResize[item['FunctioningDay']];
            }
            else if (categorical === 'Holiday') {
                return this.circleRadius * HolidayResize[item['Holiday']];
            }
            
            return 0;
        })
        
    }

    /**
     * Update each axis of the visualization.
     * @param visData data to be visualized
     * @param xAttribute attribute associated to the x axis
     * @param xLabel label of the x axis
     * @param yAttribute attribute associated to the y axis
     * @param yLabel label of the y axis
     * @param categorical categorial attribute chosen for the color enconding
     */ 
    updateAxis = function(visData, xAttribute, xLabel, yAttribute, yLabel, categorical){
        
        // Start by computing the maximum and minimum values to define the scales
        const mixX = d3.min(visData, item=>item[xAttribute]);
        const maxX = d3.max(visData, item=>item[xAttribute]);
        
        const mixY = d3.min(visData, item=>item[yAttribute]);
        const maxY = d3.max(visData, item=>item[yAttribute]);
        
        this.xScale.domain([mixX,maxX]);
        this.yScale.domain([mixY,maxY]);
        
        // Update the scale of the x axis and of the y axis
        this.scpSvg.select(".xAxisG")
        .transition().duration(this.duration)
        .call(d3.axisBottom(this.xScale))
        ;
        
        this.scpSvg.select(".yAxisG")
        .transition().duration(this.duration)
        .call(d3.axisLeft(this.yScale))
        ;
        
        // And if the axes are displaying dates, modify the ticks to use that information
        if (xLabel === 'Date') {
            this.scpSvg.select(".xAxisG")
            .transition().duration(this.duration)
            .call(d3.axisBottom(this.xScale).tickFormat(d3.timeFormat("%d-%m-%Y")))
            .selectAll("text")
            .attr("transform", "rotate(30)")
            .style("text-anchor", "start");
        }
        
        if (yLabel === 'Date') {
            this.scpSvg.select(".yAxisG")
            .transition().duration(this.duration)
            .call(d3.axisLeft(this.yScale).tickFormat(d3.timeFormat("%d-%m-%Y")))
            .selectAll("text")
            .attr("transform", "rotate(-30)")
            .style("text-anchor", "end");
            ;
        }
        
        // Update the labels of both axes
        this.scpSvg.select(".xAxisLabel")
        .transition().duration(this.duration)
        .text(xLabel)
        ;
        
        this.scpSvg.select(".yAxisLabel")
        .transition().duration(this.duration)
        .text(yLabel)
        ;
        
        // Draw vertical lines corresponding to the ticks of each axis
        this.scpSvg.selectAll(".xAxisG .tick")
        .append("line")
        .attr("class","gridLine")
        .attr("x1",0)
        .attr("y1",0)
        .attr("x2",0)
        .attr("y2",-this.height)
        .style("stroke-dasharray", ("3, 3"))
        .style("stroke","gray")
        .style("opacity",0.1)
        ;
        
        this.scpSvg.selectAll(".yAxisG .tick")
        .append("line")
        .attr("class","gridLine")
        .attr("x1",0)
        .attr("y1",0)
        .attr("x2",this.width)
        .attr("y2",0)
        .style("stroke-dasharray", ("3, 3"))
        .style("stroke","gray")
        .style("opacity",0.1)
        ;
        
        // And finally cancel the active selection (but keep the points highlighted)
        this.cancelBrush();
    }
    
    /**
     * Update the legend of the scatterplot, based on the categorical attribute
     * that is chosen for the color encoding
     * @param categorical categorial attribute chosen for the encoding
     */
    updateLegend = (categorical) => {
        
        const legendItems = categoricalValues[categorical];
        
        // Every time the legend is drawn, remove everything first
        this.legend.selectAll("*").remove();
        
        // Then, for all possible values of the categorical attribute,
        // draw a circle of the right color
        this.legend.selectAll(".legendItem")
        .data(legendItems)
        .join(
            enter => {
                const itemG = enter.append("g")
                .attr("class", "legendItem")
                .attr("transform", (d, i) => "translate(" + (i * 100) + ",0)");
                
                itemG.append("circle")
                .attr("r", 5)
                .attr("fill", (d) => {
                    if (categorical === 'Seasons') {
                        return SeasonColor[d];
                    }
                    else if (categorical === 'FunctioningDay') {
                        return FunctioningDayColor[d];
                    }
                    else if (categorical === 'Holiday') {
                        return HolidayColor[d];
                    }
                    else {
                        return "black";
                    }
                });
                
                itemG.append("text")
                .attr("x", 10)
                .attr("y", 5)
                .text((d) => d);
            },
            update => {return;},
            exit => {return;}
        )
        ;
    }
    
    /**
     * Update solely the dot visualization and not the axes
     * @param visData data to be visualized 
     * @param xAttribute attribute associated to the x axis
     * @param yAttribute attribute associated to the y axis
     * @param categorical categorical attribute chosen for the color encoding
     */
    updateDotColors = (visData, xAttribute, yAttribute, categorical) => {
        this.dotContainer.selectAll(".dotG")
        .data(visData,(itemData)=>itemData.index)
        .join(
            enter=>{
                const itemG=enter.append("g")
                .attr("class","dotG")
                ;
                
                itemG.append("circle")
                .attr("class","dotCircle")
                .attr("r", (item) => {
                    if (categorical === 'Seasons') {
                        return this.circleRadius;
                    }
                    else if (categorical === 'FunctioningDay') {
                        return this.circleRadius * FunctioningDayResize[item['FunctioningDay']];
                    }
                    else if (categorical === 'Holiday') {
                        return this.circleRadius * FunctioningDayResize[item['Holiday']];
                    }
                    
                    return 0;
                })
                .style("opacity", this.defaultOpacity);
                ;
                this.updateDots(itemG, xAttribute, yAttribute, categorical);
            },
            update=>{
                this.updateDots(update, xAttribute, yAttribute, categorical);
            },
            exit =>{
                exit.remove()
                ;
            }
        )
        ;
        
        this.updateLegend(categorical);
    };
    
    /**
     * Renders the scatterplot, by visualizing both the data points and each axis
     * @param visData data to be visualized 
     * @param xAttribute attribute associated to the x axis
     * @param yAttribute attribute associated to the y axis
     * @param xLabel label of the x axis
     * @param yLabel label of the y axis
     * @param categorical categorical attribute associated 
     * @param controllerMethods behaviors injected by the external controller
     */
    renderScatterplot = (visData, xAttribute, yAttribute, xLabel, yLabel, categorical,controllerMethods) => {
        // build the size scales and x,y axis
        this.behaviors = controllerMethods;
        
        // If the attribute to be displayed is a date, then compute the positions of the dots using the actual time in seconds.
        if (xAttribute === 'Date') {
            xAttribute = 'DateObj';
        } 
        if (yAttribute === 'Date') {
            yAttribute = 'DateObj';
        }

        // Update the current state of te component        
        this.currentXLabel = xLabel;
        this.currentYLabel = yLabel;
        this.currentXAttribute = xAttribute;
        this.currentYAttribute = yAttribute;
        
        // And update the current visualization
        this.updateAxis(visData, xAttribute, xLabel, yAttribute, yLabel, categorical);
        this.updateDotColors(visData, xAttribute, yAttribute, categorical);
    }
    
    clear = function(){
        d3.select(this.el).selectAll("*").remove();
    }
}
export default ScatterplotD3;
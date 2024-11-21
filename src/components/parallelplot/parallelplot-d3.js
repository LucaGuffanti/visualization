import * as d3 from 'd3'
import { between, parallelPlotColor, generateLinSpace, transitionTime } from '../util';

class ParallelPlotD3 {
    margin = {top: 65, right: 15, bottom: 65, left: 15};
    size;
    
    // SVG

    /**
     * Height of the SVG
     */
    height;

    /**
     * Width of the SVG
     */
    width;

    /**
     * SVG object holding the visualization
     */
    lineSvg;
    
    /**
     * Lower scale for the lower, horizontal axis
     */
    lowerScale;

    /**
     * Upper scale for the upper, horizontal axis
     */
    upperScale;

    /**
     * Brush associated to the lower axis
     */
    lowerBrush;

    /**
     * Brush associated to the upper axis
     */
    upperBrush;
    
    /**
     * Current attribute defining the lower axis
     */
    currentLowerAxis;

    /**
     * Current attribute defining the upper axis
     */
    currentUpperAxis;

    /**
     * Current label of the lower axis
     */
    currentLowerAxisLabel;

    /**
     * Current label of the upper axis
     */
    currentUpperAxisLabel;

    /**
     * Whether the lower brush is active
     */
    lowerBrushActive;

    /**
     * Whether the upper brush is active
     */
    upperBrushActive;

    /**
     * Minimum value of the lower axis
     */
    lowerAxisMin;

    /**
     * Maximum value of the lower axis
     */
    lowerAxisMax;

    /**
     * Current selection of the lower brush
     */
    lowerBrushSelection = [0,0];

    /**
     * Current selection of the upper brush
     */
    upperBrushSelection = [0,0];
    
    /**
     * Default opacity for the lines
     */
    defaultOpacity = 0.02;

    /**
     * Whether the visualization is currently linking externally brushed data
     */
    onLinking = false;

    /**
     * Controller methods injected by the external controller
     */
    behaviors;

    /**
     * Default animation time for transitions
     */
    defaultAnimationTime = transitionTime;
    
    constructor(el){
        this.el=el;
    };
    
    // ================================================================
    // ===================== Initialization ===========================
    // ================================================================

    /**
     * Initialize the visualization
     * @param config configuration data for the SVG 
     */
    create = function (config) {
        this.size = {width: config.size.width, height: config.size.height};
        
        // get the effect size of the view by subtracting the margin
        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;
        
        // initialize the SVG
        this.lineSvg=d3.select(this.el).append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("class","lineSvgG")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        ;
        
        // Add a lower horizontal axis
        this.lineSvg.append("g")
        .attr("class", "LowerAxis")
        .attr("transform", "translate(0," + this.height + ")")
        
        // Add an upper, horizontal axis
        this.lineSvg.append("g")
        .attr("class", "UpperAxis")
        .attr("transform", "translate(0,0)")

        // Add a gray rectangle as a background
        this.lineSvg.append("rect")
        .attr("x", 0)
        .attr("y", 1)
        .attr("width", this.width)
        .attr("height", this.height-1)
        .attr("fill", "#f9f9f9")
        ;
        
        // Build the scales for the two axes
        this.lowerScale = d3.scaleLinear().range([0, this.width]);
        this.upperScale = d3.scaleLinear().range([0, this.width]);
        
        // Add the text label for the lower axis, which will be updated when data is included
        this.lineSvg.append("text")
        .attr("class", "LowerAxisLabel")
        .attr("transform", "translate(" + (this.width / 2) + "," + (this.height + this.margin.bottom - 5) + ")")
        .style("text-anchor", "middle");
        ;
        
        // Add the text label for the upper axis, which will be updated when data is included
        this.lineSvg.append("text")
        .attr("class", "UpperAxisLabel")
        .attr("transform", "translate(" + (this.width / 2) + ",-50)")
        ;

        // Define the upper, horizontal brush and attach it to the SVG
        this.upperBrush = d3.brushX()
        .extent([[0, -50], [this.width, 2]])
        .on('start', this.manageOnGoingUpperBrush)
        .on('brush', this.manageOnGoingUpperBrush)
        .on('end', this.manageEndUpperBrush)
        ;

        this.lineSvg.append("g")
        .attr("class", "upperBrush")
        .call(this.upperBrush)
        ;

        // Define the lower, horizontal brush and attach it to the SVG
        this.lowerBrush = d3.brushX()
        .extent([[0, this.height-2], [this.width, this.height+50]])
        .on('start', this.manageOnGoingLowerBrush)
        .on('brush', this.manageOnGoingLowerBrush)
        .on('end', this.manageEndLowerBrush)
        ;

        this.lineSvg.append("g")
        .attr("class", "lowerBrush")
        .call(this.lowerBrush)
        ;
    }
    // ================================================================
    // ===================== Brushing and Linking =====================
    // ================================================================

    /**
     * Manage the evolution of the upper brush. If the selection has no extension, it is considered empty
     * @param e brushing event of the upper brush, which contains a selection 
     */
    manageOnGoingUpperBrush = (e) => {
        // Get the extension of the selection, and activate the brush
        this.upperBrushActive = true;
        this.upperBrushSelection = e.selection;
        
        // Check if the selection has no extension. In that case, the brush is deactivated
        if (this.upperBrushSelection[0] === this.upperBrushSelection[1]) {
            this.upperBrushActive = false;
            this.cancelUpperBrush();
        }

        this.manageCoupledSelection();
    }

    /**
     * Manage the evolution of the lower brush. If the selection has no extension, it is considered empty
     * @param e brushing event of the lower brush, which contains a selection 
     */
    manageOnGoingLowerBrush = (e) => {
        // Get the extension of the selection, and activate the brush
        this.lowerBrushActive = true;
        this.lowerBrushSelection = e.selection;
        
        // Check if the selection has no extension. In that case, the brush is deactivated
        if (this.lowerBrushSelection[0] === this.lowerBrushSelection[1]) {
            this.lowerBrushActive = false;
            this.cancelLowerBrush();
        }

        this.manageCoupledSelection();
    }

    /**
     * Manage the update of both the upper and lower brush, in a coupled way.
     * The idea is that data points are selected if they are within the range of both brushes,
     * which are subdomains of the scales. If one brush in not active, then the selection is logically
     * set to the whole scale so that the intersection returns only the selection of the active brush.
     */
    manageCoupledSelection = () => {

        let x0 = 0;
        let x1 = 0;
        let y0 = 0;
        let y1 = 0;

        // Execute only if at least one brush is active at a time
        if (this.upperBrushActive || this.lowerBrushActive) {
            // If both brushes are active, then the selection is the intersection of the two ranges
            if (this.upperBrushActive && this.lowerBrushActive) {
                this.enableAllBrushes();
                x0 = this.lowerScale.invert(this.lowerBrushSelection[0]);
                x1 = this.lowerScale.invert(this.lowerBrushSelection[1]);
                y0 = this.upperScale.invert(this.upperBrushSelection[0]);
                y1 = this.upperScale.invert(this.upperBrushSelection[1]);
            }
            // If only the upper brush is active, then the selection is the range of the upper brush,
            // intersected with the whole domain of the lower brush
            else if (this.upperBrushActive) {
                this.enableUpperBrush();
                x0 = this.lowerScale.domain()[0];
                x1 = this.lowerScale.domain()[1];
                y0 = this.upperScale.invert(this.upperBrushSelection[0]);
                y1 = this.upperScale.invert(this.upperBrushSelection[1]);
            }
            // If only the lower brush is active, then the selection is the range of the lower brush,
            // intersected with the whole domain of the upper brush
            else if (this.lowerBrushActive) {
                this.enableLowerBrush();
                x0 = this.lowerScale.invert(this.lowerBrushSelection[0]);
                x1 = this.lowerScale.invert(this.lowerBrushSelection[1]);
                y0 = this.upperScale.domain()[0];
                y1 = this.upperScale.domain()[1];
            }
            
            // To color the lines, introduce a color scale that will color the lines based on their position on the LOWER axis
            const colorScale = d3.scaleLinear()
            .domain(generateLinSpace(x0, x1, parallelPlotColor.length))
            .range(parallelPlotColor)
            ;
            
            // Then, based on the selection, the lines are colored
            this.lineSvg.selectAll(".line")
            .attr("stroke", (d) => {
                const InRangeLower = between(d[this.currentLowerAxis], x0, x1);
                const InRangeUpper = between(d[this.currentUpperAxis], y0, y1);
                if (InRangeLower && InRangeUpper) {
                    return colorScale(d[this.currentLowerAxis]);
                }
                return "black";
            })
            .style("opacity", (d) => {
                const InRangeLower = between(d[this.currentLowerAxis], x0, x1);
                const InRangeUpper = between(d[this.currentUpperAxis], y0, y1);
                if (InRangeLower && InRangeUpper) {
                    return 1;
                }
                return this.defaultOpacity;
            })
            ;

        }
        // And the controller is notified of change in selection to update the linked views
        this.behaviors.handleSelectionChange(
            [x0, x1],
            [y0, y1],
            this.currentLowerAxis,
            this.currentUpperAxis,
        );

    }

    /**
     * Enable the lower brush, by acting on the selection and the handles
     */
    enableLowerBrush = () => {
        this.lineSvg.selectAll(".lowerBrush")
        .selectAll(".selection")
        .attr("display", "initial")
        ;

        this.lineSvg.selectAll(".lowerBrush")
        .selectAll(".handle")
        .attr("display", "initial")
        ;
    }

    /**
     * Enable the upper brush by acting on the selection and the handles
     */
    enableUpperBrush = () => {
        this.lineSvg.selectAll(".upperBrush")
        .selectAll(".selection")
        .attr("display", "initial")
        ;

        this.lineSvg.selectAll(".upperBrush")
        .selectAll(".handle")
        .attr("display", "initial")
        ;
    }

    /**
     * Enable all brushes by acting on the selection and the handles of each one
     */
    enableAllBrushes = () => {
        this.enableLowerBrush();
        this.enableUpperBrush();
    }

    /**
     * Cancel the lower brush, by acting on the selection and the handles
     */
    cancelLowerBrush = () => {
        this.lineSvg.selectAll(".lowerBrush")
        .selectAll(".selection")
        .attr("display", "none")
        ;

        this.lineSvg.selectAll(".lowerBrush")
        .selectAll(".handle")
        .attr("display", "none")
        ;
    }

    /**
     * Cancel the upper brush, by acting on the selection and the handles
     */
    cancelUpperBrush = () => {
        this.lineSvg.selectAll(".upperBrush")
        .selectAll(".selection")
        .attr("display", "none")
        ;

        this.lineSvg.selectAll(".upperBrush")
        .selectAll(".handle")
        .attr("display", "none")
        ;
    }

    /**
     * Resets the selection by coloring all lines black
     */
    resetSelection = () => {
        this.lineSvg.selectAll(".line")
        .attr("stroke", "black")
        .style("opacity", this.defaultOpacity)
        ;
    }

    /**
     * Cancel all brushes, by acting on the selection and the handles of each one
     */
    cancelAllBrushes = () => {
        this.cancelLowerBrush();
        this.cancelUpperBrush();
    }

    /**
     * Link an external 2D selection
     * @param  dim1Selection selection related to a first dimension
     * @param  dim2Selection selection related to a second dimension
     * @param  dim1Name Attribute of the first dimension
     * @param  dim2Name Attribute of the second dimension
     */
    linkExternalSelection = (dim1Selection, dim2Selection, dim1Name, dim2Name) => {
        
        // First, discard all brushes
        this.lowerBrushActive = false;
        this.upperBrushActive = false;
        this.cancelAllBrushes();

        // To color the lines, introduce a color scale that will color the lines based on their position on the LOWER axis
        const colorScale = d3.scaleLinear()
        .domain(generateLinSpace(this.lowerAxisMin, this.lowerAxisMax, parallelPlotColor.length))
        .range(parallelPlotColor)
        ;

        // Then, update the selection of the lines based, now, on the external data
        this.lineSvg.selectAll(".line")
        .attr("stroke", (d) => {
            const InRangeLower = between(d[dim1Name], dim1Selection.x0Data, dim1Selection.x1Data);
            const InRangeUpper = between(d[dim2Name], dim2Selection.y0Data, dim2Selection.y1Data);
            if (InRangeLower && InRangeUpper) {
                return colorScale(d[this.currentLowerAxisLabel]);
            }
            return "black";
        })
        .style("opacity", (d) => {
            const InRangeLower = between(d[dim1Name], dim1Selection.x0Data, dim1Selection.x1Data);
            const InRangeUpper = between(d[dim2Name], dim2Selection.y0Data, dim2Selection.y1Data);
            if (InRangeLower && InRangeUpper) {
                return 1;
            }
            return this.defaultOpacity;
        })
        ;
    }

    // ================================================================
    // ===================== Update and Render ========================
    // ================================================================

    /**
     * Update each axis of the visualization
     * @param visData data to be visualized
     * @param lowerAxis lower axis attribute
     * @param upperAxis lower axis attribute
     * @param lowerAxisLabel label associated to the lower axis attribute
     * @param upperAxisLabel label associated to the upper axis attribute
     * @param isLowerInverted whether the lower axis is inverted
     * @param isUpperInverted whether the upper axis is inverted
     */
    updateAxis = (visData, lowerAxis, upperAxis, lowerAxisLabel, upperAxisLabel, isLowerInverted, isUpperInverted) => {
        
        // Compute the minimum and maximum values for the lower and upper axis
        // in order to define the scales
        const lowerMin = d3.min(visData, d=>d[lowerAxis]);
        const lowerMax = d3.max(visData, d=>d[lowerAxis]);

        this.lowerAxisMin = lowerMin;
        this.lowerAxisMax = lowerMax;
        
        const upperMin = d3.min(visData, d=>d[upperAxis]);
        const upperMax = d3.max(visData, d=>d[upperAxis]);
        
        // And depending on the inversion, set the domain of the scales
        if (!isLowerInverted) {
            this.lowerScale.domain([lowerMin, lowerMax]);
        } else {
            this.lowerScale.domain([lowerMax, lowerMin]);
        }

        if (!isUpperInverted) {
            this.upperScale.domain([upperMin, upperMax]);
        } else {
            this.upperScale.domain([upperMax, upperMin]);
        }

        // Translate the axis
        this.lineSvg.select(".LowerAxis")
        .transition().duration(this.defaultAnimationTime)
        .call(d3.axisBottom(this.lowerScale))
        ;
        this.lineSvg.select(".UpperAxis")
        .transition().duration(this.defaultAnimationTime)
        .call(d3.axisTop(this.upperScale))
        ;
        
        // Update the axis labels
        this.lineSvg.select(".LowerAxisLabel")
        .transition().duration(this.defaultAnimationTime)
        .text(lowerAxisLabel)
        ;
        
        this.lineSvg.select(".UpperAxisLabel")
        .transition().duration(this.defaultAnimationTime)
        .text(upperAxisLabel)
        ;
        
        // If an axis is used to display a date, then the format changes, so 
        // the date is used to define ticks, and the text is rotated to avoid overlap
        if (lowerAxisLabel === 'Date') {
            this.lineSvg.select(".LowerAxis")
            .transition().duration(this.defaultAnimationTime)
            .call(d3.axisBottom(this.lowerScale).tickFormat(d3.timeFormat("%d-%m-%Y")))
            .selectAll("text")
            .attr("transform", "rotate(30)")
            .style("text-anchor", "start");
        }
        
        
        if (upperAxisLabel === 'Date') {
            this.lineSvg.select(".UpperAxis")
            .transition().duration(this.defaultAnimationTime)
            .call(d3.axisTop(this.upperScale).tickFormat(d3.timeFormat("%d-%m-%Y")))
            .selectAll("text")
            .attr("transform", "rotate(-30)")
            .style("text-anchor", "start");
            ;
        }

        // Finally, cancel all brushes if they were present, because they are obstructing the view
        this.cancelAllBrushes();
        
    }
    
    /**
     * Transform the selected lines by changing starting points and endpoints
     * @param selection lines to transform
     * @param lowerAxis attribute defining the lower axis
     * @param upperAxis attribute defining the upper axis
     */
    updateLines = (selection, lowerAxis, upperAxis) => {
        // transform the selection
        selection.select(".line")
        .transition().duration(this.defaultAnimationTime)
        .attr("x1", d=>this.lowerScale(d[lowerAxis]))
        .attr("x2", d=>this.upperScale(d[upperAxis]))
        ;
    }
    
    /**
     * Render the Parallel Coordinates visualization
     * @param visData Data to visualize
     * @param lowerAxis Attribute defining the lower axis
     * @param upperAxis Attribute defining the upper axis
     * @param lowerAxisLabel Label of the attribute defining the lower axis
     * @param upperAxisLabel Label of the attribute defining the upper axis
     * @param isLowerInverted Whether the lower axis is inverted
     * @param isUpperInverted Whether the upper axis is inverted
     * @param controllerMethods Behaviors injected by the external controller
     */
    renderVis = (visData, lowerAxis, upperAxis, lowerAxisLabel, upperAxisLabel, isLowerInverted, isUpperInverted, controllerMethods) => {
        
        // First, attach the controller methods to the class
        this.behaviors = controllerMethods;

        // If the axis is a date, then comparison is done through the DateObj attribute, which contains the date expressed in seconds.
        if (lowerAxis === 'Date') {
            lowerAxis = 'DateObj';
        }
        if (upperAxis === 'Date') {
            upperAxis = 'DateObj';
        }

        // Update the internal state
        this.currentLowerAxis = lowerAxis;
        this.currentUpperAxis = upperAxis;
        this.currentLowerAxisLabel = lowerAxisLabel;
        this.currentUpperAxisLabel = upperAxisLabel;

        // And then update the axis
        this.updateAxis(visData,
            lowerAxis, 
            upperAxis, 
            lowerAxisLabel, 
            upperAxisLabel,
            isLowerInverted,
            isUpperInverted);
        
        // Then attach the lines to the visualization, and render them
        this.lineSvg.selectAll(".lineG")
        .data(visData, d => d.index)
        .join(
            enter => {
                // A new data element is associated to a new line
                const itemG = enter.append("g")
                .attr("class", "lineG")
                
                // Append a line element within the new group
                itemG.append("line")
                .attr("class", "line")
                .attr("x1", 0)
                .attr("y1", this.height)
                .attr("x2", 0)
                .attr("y2", 0)
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .style("opacity", this.defaultOpacity);
                
                // And transform it to its new position
                this.updateLines(itemG, lowerAxis, upperAxis);
            },
            update => {
                // An already existing element is simply translated to its new position
                this.updateLines(update, lowerAxis, upperAxis);
            },
            exit => exit.remove()
        );
    }
    
    clear = function(){
        d3.select(this.el).selectAll("*").remove();
    }

    // ================================================================
    // ================================================================
    // ================================================================
}
export default ParallelPlotD3;
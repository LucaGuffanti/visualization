import './Scatterplot.css'
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef } from 'react';


import ScatterplotD3 from "./Scatterplot-d3";
import { updateScatterplotSelection } from '../../redux/syncPlotsSlice';


const ScatterplotContainer = () => {
    const data = useSelector(state => state.dataSet);
    const scatterplotState = useSelector(state => state.scatterplot);
    const dispatch = useDispatch(); 
    
    const xAttribute = scatterplotState.xAxis;
    const yAttribute = scatterplotState.yAxis;
    const xLabel = scatterplotState.xAxisLabel;
    const yLabel = scatterplotState.yAxisLabel;
    const categorical = scatterplotState.categorical;

    const syncState = useSelector(state => state.syncstate);
    const lowerParallelPlotSelection = syncState.lowerParallelPlotSelection;
    const upperParallelPlotSelection = syncState.upperParallelPlotSelection;
    const lowerParallelPlotAxis = syncState.lowerParallelPlotAxis;
    const upperParallelPlotAxis = syncState.upperParallelPlotAxis;
    

    const divContainerRef = useRef(null);
    const scatterplotD3Ref = useRef(null);
    
    const getCharSize = () => {
        if (divContainerRef.current !== null) {
            const { offsetWidth: width, offsetHeight: height } = divContainerRef.current;
            return { width, height };
        }
        return { width: undefined, height: undefined };
    }
    
    // Used to create the scatterplot
    useEffect(()=>{
        const scatterplotD3 = new ScatterplotD3(divContainerRef.current);
        scatterplotD3.create({size:getCharSize()});
        scatterplotD3Ref.current = scatterplotD3;
        return ()=>{
            const scatterplotD3 = scatterplotD3Ref.current;
            scatterplotD3.clear()
        }
    },[]);
    
    // Used to catch the update of the data or change in axes
    useEffect(()=>{
        const scatterplotD3 = scatterplotD3Ref.current;
        
        const handleSelectionChange = (xSelection, ySelection, xAttribute, yAttribute) => {
            console.log("Dispatching")
            dispatch(updateScatterplotSelection({
                xScatterplotSelection: xSelection,
                yScatterplotSelection: ySelection,
                xScatterplotAxis: xAttribute,
                yScatterplotAxis: yAttribute
            }));

        }
        const controllerMethods={
            handleSelectionChange
        }
        scatterplotD3.renderScatterplot(data, 
            xAttribute, 
            yAttribute, 
            xLabel, 
            yLabel, 
            categorical, 
            controllerMethods);
    },[data, xAttribute, yAttribute, dispatch, xLabel, yLabel]);

    // Used to update the colors of the dots based on the categorical attribute of choice
    useEffect(()=>{
        const scatterplotD3 = scatterplotD3Ref.current;
        
        scatterplotD3.updateDotColors(
            data, 
            xAttribute, 
            yAttribute, 
            categorical);
    },[categorical, dispatch]);

    // Used to update the selection of the dots based on the parallel plot brushed selection
    useEffect(()=>{

        const scatterplotD3 = scatterplotD3Ref.current;
        if (lowerParallelPlotSelection !== null){
            scatterplotD3.linkExternalSelection(
                lowerParallelPlotSelection,
                upperParallelPlotSelection,
                lowerParallelPlotAxis,
                upperParallelPlotAxis
            );
        }
    },[lowerParallelPlotAxis, lowerParallelPlotSelection, upperParallelPlotAxis, upperParallelPlotSelection]);

    return(
        <div ref={divContainerRef} className='section section-scatterplot'>
        
        </div>
    )
}

export default ScatterplotContainer;
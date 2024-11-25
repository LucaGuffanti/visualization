import { useEffect, useRef } from 'react';
import {useSelector, useDispatch} from 'react-redux'
import ParallelPlotD3 from './parallelplot-d3';
import { updateParallelPlotSelection } from '../../redux/syncPlotsSlice';


function ParallelPlotContainer(){
    const data = useSelector(state =>state.dataSet);
    const parallelplotState = useSelector(state => state.parallelplot);

    const dispatch = useDispatch();


    const currentLowerAxis = parallelplotState.lowerAxis;
    const currentUpperAxis = parallelplotState.upperAxis;
    const currentLowerAxisLabel = parallelplotState.lowerAxisLabel;
    const currentUpperAxisLabel = parallelplotState.upperAxisLabel;
    const isLowerInverted = parallelplotState.invertedLower;
    const isUpperInverted = parallelplotState.invertedUpper;

    const divContainerRef=useRef(null);
    const parallelplotD3Ref = useRef(null);

    const syncState = useSelector(state => state.syncstate);

    const xScatterplotSelection = syncState.xScatterplotSelection;
    const yScatterplotSelection = syncState.yScatterplotSelection;
    const xScatterplotAxis = syncState.xScatterplotAxis;
    const yScatterplotAxis = syncState.yScatterplotAxis;
    const updatedScatterplotSelection = syncState.updatedScatterplotSelection;


    const getCharSize = function(){

        let width
        let height;
        if(divContainerRef.current!==undefined){
            width=divContainerRef.current.offsetWidth;
            height=divContainerRef.current.offsetHeight;
        }
        return {width:width,height:height};
    }

    // Used to create the parallel plot
    useEffect(()=>{
        const parallelplotD3 = new ParallelPlotD3 (divContainerRef.current);
        parallelplotD3.create({size:getCharSize()});
        parallelplotD3Ref.current = parallelplotD3;
        return ()=>{
            const parallelplotD3 = parallelplotD3Ref.current;
            parallelplotD3.clear()
        }
    },[]);

    // Used to catch a change in the data or axes
    useEffect(()=>{
        const parallelplotD3 = parallelplotD3Ref.current;


        const handleSelectionChange = (lowerParallelPlotSelection, 
            upperParallelPlotSelection, 
            lowerParallelPlotAxis, 
            upperParallelPlotAxis) => {
                dispatch(updateParallelPlotSelection({
                    lowerParallelPlotSelection: lowerParallelPlotSelection,
                    upperParallelPlotSelection: upperParallelPlotSelection,
                    lowerParallelPlotAxis: lowerParallelPlotAxis,
                    upperParallelPlotAxis: upperParallelPlotAxis
                    }
                ));
        };

        const controllerMethods={
            handleSelectionChange   
        }
        parallelplotD3.renderVis(data,
            currentLowerAxis, 
            currentUpperAxis, 
            currentLowerAxisLabel, 
            currentUpperAxisLabel, 
            isLowerInverted,
            isUpperInverted,
            controllerMethods);
    },[data, parallelplotState, dispatch]);// if dependencies, useEffect is called after each data update, in our case only data changes.

    // Used to update the selection in the parallel plot when the scatterplot is brushed
    useEffect(()=>{
        const parallelplotD3 = parallelplotD3Ref.current;
        if (xScatterplotSelection !== null) {
            parallelplotD3.linkExternalSelection(
                xScatterplotSelection,
                yScatterplotSelection,
                xScatterplotAxis,
                yScatterplotAxis
            );
        }
    },[xScatterplotSelection, yScatterplotSelection, updatedScatterplotSelection]);

    return(
        <div ref={divContainerRef} className="section section-parallelplot">

        </div>
    )
}

export default ParallelPlotContainer;
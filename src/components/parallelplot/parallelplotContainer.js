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

    // did mount called once the component did mount
    useEffect(()=>{
        const parallelplotD3 = new ParallelPlotD3 (divContainerRef.current);
        parallelplotD3.create({size:getCharSize()});
        parallelplotD3Ref.current = parallelplotD3;
        return ()=>{
            // did unmout, the return function is called once the component did unmount (removed for the screen)
            const parallelplotD3 = parallelplotD3Ref.current;
            parallelplotD3.clear()
        }
    },[]);// if empty array, useEffect is called after the component did mount (has been created)

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
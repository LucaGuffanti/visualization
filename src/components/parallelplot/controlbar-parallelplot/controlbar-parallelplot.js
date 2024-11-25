
import { useSelector, useDispatch } from "react-redux";
import { updateAxis, invertAxis } from "../../../redux/ParallelPlotSlice";

import './controlbar-parallelplot.css';

function ControlBarParallelPlot() {
    const dispatch = useDispatch();
    
    const headers = ['Date','RentedBikeCount','Hour','Temperature','Humidity','WindSpeed','Visibility','DewPointTemperature','SolarRadiation','Rainfall','Snowfall'];

    const currentState = useSelector(state => state.parallelplot);


    const currentLowerAxis = currentState.lowerAxis;
    const currentUpperAxis = currentState.upperAxis;
    const currentLowerAxisLabel = currentState.lowerAxisLabel;
    const currentUpperAxisLabel = currentState.upperAxisLabel;
    const isLowerInverted = currentState.invertedLower;
    const isUpperInverted = currentState.invertedUpper;

    
    const filteredUpperHeaders = headers.filter(h => h !== currentUpperAxis);
    const filteredLowerHeaders = headers.filter(h => h !== currentLowerAxis);
    
    const handleLowerAxisChange = (e) => {        
        let val;
        let label;
        
        val = e.target.value;
        label = e.target.value;
        dispatch(updateAxis({lowerAxis: val, upperAxis: currentUpperAxis, lowerAxisLabel: label, upperAxisLabel: currentUpperAxisLabel}));
    };
    const handleUpperAxisChange = (e) => {        
        let val;
        let label
        val = e.target.value;
        label = e.target.value;
        dispatch(updateAxis({lowerAxis: currentLowerAxis, upperAxis: val, lowerAxisLabel: currentLowerAxisLabel, upperAxisLabel: label}));
    };
    const swapAxis = (e) => {
        dispatch(updateAxis({lowerAxis: currentUpperAxis, upperAxis: currentLowerAxis, lowerAxisLabel: currentUpperAxisLabel, upperAxisLabel: currentLowerAxisLabel}));
    };
    
    const invertUpper = (e) => {
        dispatch(invertAxis({invertedLower: isLowerInverted, invertedUpper: !isUpperInverted}));
    }
    const invertLower = (e) => {
        dispatch(invertAxis({invertedLower: !isLowerInverted, invertedUpper: isUpperInverted}));
    }
    return (
        <>
            <div className="section section-controlbar">
            <div className="controlBarLineContainer">
                <div className="controlBarLineUpperAxis">
                    <label>Upper Axis:</label>
                    <select value={currentUpperAxis} onChange={handleUpperAxisChange}>
                    <option value={currentUpperAxis} key={currentUpperAxis}>{currentUpperAxisLabel}</option>
                    {filteredUpperHeaders.map(h => <option value={h} key={h}>{h}</option>)}
                    </select>
                </div>
                <div className="controlBarLineLowerAxis">
                    <label>Lower Axis:</label>
                    <select value={currentLowerAxis} onChange={handleLowerAxisChange}>
                    <option value={currentLowerAxis} key={currentLowerAxis}>{currentLowerAxisLabel}</option>
                    {filteredLowerHeaders.map(h => <option value={h} key={h}>{h}</option>)}
                    </select>
                </div>
                <div className="controlBarLineSwap">
                    <button onClick={swapAxis}> Swap</button>
                </div>
                <div className="controlBarLineInvertUpper"> 
                    <button onClick={invertUpper}> Invert Upper</button>
                </div>
                <div className="controlBarLineInvertLower">
                    <button onClick={invertLower}> Invert Lower</button>   
                </div>
            </div>
            </div>
        </>
    );
}

export default ControlBarParallelPlot;
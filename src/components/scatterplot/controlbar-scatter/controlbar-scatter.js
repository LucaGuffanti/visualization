
import { useSelector, useDispatch } from "react-redux";
import { updateAxis, updateColor } from "../../../redux/ScatterplotSlice";
import { catToLabelMap } from "../../util";

import './controlbar-scatter.css';

function ControlBarScatter() {
    const dispatch = useDispatch();
    
    const headers = ['Date','RentedBikeCount','Hour','Temperature','Humidity','WindSpeed','Visibility','DewPointTemperature','SolarRadiation','Rainfall','Snowfall'];
    const categoricalHeaders = ['Seasons','Holiday','FunctioningDay'];

    const currentScatterplotState = useSelector(state => state.scatterplot);
    const currentXAxis = currentScatterplotState.xAxis;
    const currentYAxis = currentScatterplotState.yAxis;
    const currentXAxisLabel = currentScatterplotState.xAxisLabel;
    const currentYAxisLabel = currentScatterplotState.yAxisLabel;
    const currentCategorical = currentScatterplotState.categorical;

    
    const filteredXHeaders = headers.filter(h => h !== currentXAxis);
    const filteredYHeaders = headers.filter(h => h !== currentYAxis);
    const filteredCategoricalHeaders = categoricalHeaders.filter(h => h !== currentCategorical);
    
    const handleXAxisChange = (e) => {        
        let val = e.target.value;
        let label = e.target.value;
        dispatch(updateAxis({xAxis: val, yAxis: currentYAxis, xAxisLabel: label, yAxisLabel: currentYAxisLabel, categorical: currentCategorical}));
    };
    const handleYAxisChange = (e) => {        
        let val = e.target.value;
        let label = e.target.value;
        
        dispatch(updateAxis({xAxis: currentXAxis, yAxis: val, xAxisLabel: currentXAxisLabel, yAxisLabel: label, categorical: currentCategorical}));
    };
    const handleColorChange = (e) => {
        dispatch(updateColor({
            categorical: e.target.value
            }));
    };
    
    
    return (
        <>
            <div className="section section-controlbar">
            <div className="controlBarScatterContainer">
                <div className="controlBarScatterXAxis">
                    <label>X Axis:</label>
                    <select value={currentXAxis} onChange={handleXAxisChange}>
                    <option value={currentXAxis} key={currentXAxis}>{currentXAxisLabel}</option>
                    {filteredXHeaders.map(h => <option value={h} key={h}>{h}</option>)}
                    </select>
                </div>
                <div className="controlBarScatterYAxis">
                    <label>Y Axis:</label>
                    <select value={currentYAxis} onChange={handleYAxisChange}>
                    <option value={currentYAxis} key={currentYAxis}>{currentYAxisLabel}</option>
                    {filteredYHeaders.map(h => <option value={h} key={h}>{h}</option>)}
                    </select>
                </div>
                <div className="controlBarScatterColor">
                    <label> Color Encoding:</label>
                    <select value={currentCategorical} onChange={handleColorChange}>
                    <option value={currentCategorical} key={currentCategorical}>{catToLabelMap[currentCategorical]}</option>
                    {filteredCategoricalHeaders.map(h => <option value={h} key={h}>{h}</option>)}
                    </select>
                </div>
            </div>
            </div>
        </>
    );
}

export default ControlBarScatter;
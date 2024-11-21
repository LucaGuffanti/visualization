import { createSlice } from "@reduxjs/toolkit";

export const ParallelPlotSlice = createSlice({
    name: "parallelplot",
    initialState: {
        lowerAxis: "Temperature",
        upperAxis: "Date",
        lowerAxisLabel: "Temperature",
        upperAxisLabel: "Date",
        invertedLower: false,
        invertedUpper: false
    },
    reducers: {
        updateAxis: (state, action) => {
            return {
                ...state,
                
                lowerAxis: action.payload.lowerAxis,
                upperAxis: action.payload.upperAxis,
                lowerAxisLabel: action.payload.lowerAxisLabel,
                upperAxisLabel: action.payload.upperAxisLabel
            };
        },
        invertAxis: (state, action) => {
            return {
                ...state,
                invertedUpper: action.payload.invertedUpper,
                invertedLower: action.payload.invertedLower
            };
        }
    }
});

export const { updateAxis, invertAxis } = ParallelPlotSlice.actions;
export default ParallelPlotSlice.reducer;

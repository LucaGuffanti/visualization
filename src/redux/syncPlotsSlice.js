import { createSlice } from "@reduxjs/toolkit";

export const syncPlotSlice = createSlice({
    name: 'syncPlot',
    initialState: {
        lowerParallelPlotPlotPlotSelection: null,
        lowerParallelPlotPlotAxis: null,
        upperParallelPlotSelection: null,
        upperParallelPlotAxis: null,

        useLowerSelection: false,
        useUpperSelection: false,

        xScatterplotSelection: null,
        xScatterplotAxis: null,
        yScatterplotSelection: null,
        yScatterplotAxis: null,

        updatedParallelPlotSelection: false,
        updatedScatterplotSelection: false
    },
    reducers: {
        updateScatterplotSelection: (state, action) => {

            return {...state,
                xScatterplotSelection: action.payload.xScatterplotSelection,
                xScatterplotAxis: action.payload.xScatterplotAxis,
                yScatterplotSelection: action.payload.yScatterplotSelection,
                yScatterplotAxis: action.payload.yScatterplotAxis,
                updatedScatterplotSelection: true,
                updatedParallelPlotSelection: false
            }
        },
        
        updateParallelPlotSelection: (state, action) => {
            return {...state,
                lowerParallelPlotSelection: action.payload.lowerParallelPlotSelection,
                lowerParallelPlotAxis: action.payload.lowerParallelPlotAxis,
                upperParallelPlotSelection: action.payload.upperParallelPlotSelection,
                upperParallelPlotAxis: action.payload.upperParallelPlotAxis,

                updatedParallelPlotSelection: true,
                updatedScatterplotSelection: false
            }
        }
    }
})

export const { updateScatterplotSelection, updateParallelPlotSelection } = syncPlotSlice.actions
export default syncPlotSlice.reducer; 
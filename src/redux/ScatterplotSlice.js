import { createSlice } from "@reduxjs/toolkit";

export const scatterplotSlice = createSlice({
    name: 'scatterplot',
    initialState: {
        xAxis: 'RentedBikeCount',
        yAxis: 'Temperature',
        xAxisLabel: 'RentedBikeCount',
        yAxisLabel: 'Temperature',
        categorical: 'Seasons'
    },
    reducers: {
        updateAxis: (state, action) => {
            return {...state,
                xAxis: action.payload.xAxis, 
                yAxis: action.payload.yAxis, 
                xAxisLabel: action.payload.xAxisLabel, 
                yAxisLabel: action.payload.yAxisLabel,
                categorical: action.payload.categorical
                }
        },
        
        updateColor: (state, action) => {
            return {...state,
                categorical: action.payload.categorical
                }
        }
    }
})

export const { updateAxis, updateColor } = scatterplotSlice.actions
export default scatterplotSlice.reducer; 
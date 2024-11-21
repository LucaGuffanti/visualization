import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import Papa from "papaparse"

// get the data in asyncThunk
export const getSeoulBikeData = createAsyncThunk('seoulBikeData/fetchData', async () => {
    const response = await fetch('data/SeoulBikeData.csv');
    const responseText = await response.text();
    console.log("loaded file length:" + responseText.length);
    const responseJson = Papa.parse(responseText,{header:true, dynamicTyping:true});
    
    const indexed =  responseJson.data.map((item,i)=>{return {...item,index:i}});
    
    // Eliminate the last element which is empty
    indexed.pop();

    // Add a date object that is a serializable version of the date
    
    return indexed.map(
        item=>{
            const dateStr = item.Date;
            const splitted = dateStr.split("/");
            const date = new Date(splitted[2],splitted[1]-1,splitted[0]).getTime(); 
            return {...item, DateObj: date}
        }
    );
    // when a result is returned, extraReducer below is triggered with the case setSeoulBikeData.fulfilled

})

export const dataSetSlice = createSlice({
  name: 'dataSet',
  initialState: [],
  reducers: {
      // add reducer if needed
  },
  extraReducers: builder => {
    builder.addCase(getSeoulBikeData.fulfilled, (state, action) => {
      // Add any fetched house to the array
      return action.payload
    })
  }
})

// Action creators are generated for each case reducer function
export const { updateSelectedItem } = dataSetSlice.actions

export default dataSetSlice.reducer
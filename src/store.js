import { configureStore } from '@reduxjs/toolkit';
import dataSetReducer from './redux/DataSetSlice';
import scatterplotReducer from './redux/ScatterplotSlice';
import parallelplotReducer from './redux/ParallelPlotSlice';
import syncPlotReducer from './redux/syncPlotsSlice';

export default configureStore({
  reducer: {
    dataSet: dataSetReducer,
    scatterplot: scatterplotReducer,
    parallelplot: parallelplotReducer,
    syncstate: syncPlotReducer

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable the SerializableStateInvariantMiddleware
    }),
});
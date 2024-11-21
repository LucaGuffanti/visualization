import './App.css';
import { useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { getSeoulBikeData } from './redux/DataSetSlice';
import ControlBarScatter from './components/scatterplot/controlbar-scatter/controlbar-scatter';  // ControlBar for the control bar
import ControlBarParallelPlot from './components/parallelplot/controlbar-parallelplot/controlbar-parallelplot';
// ScatterplotContainer for the scatter plot
import ScatterplotContainer from './components/scatterplot/ScatterplotContainer';
import ParallelPlotContainer from './components/parallelplot/parallelplotContainer';

// here import other dependencies

// a component is a piece of code which render a part of the user interface
function App() {
  const dispatch = useDispatch();

  // called once the component did mount
  useEffect(()=>{
    // initialize the data from file
    dispatch(getSeoulBikeData());
  },[])

  return (
    <div className="App">
        <div className='left-side'>
              <ControlBarScatter/>
              <ScatterplotContainer />
            {/* The right side will be empty, creating white space */}
        </div>
          <div className='right-side'>
              <ControlBarParallelPlot />
              <ParallelPlotContainer />
          </div>
    </div>
  );
}

export default App;
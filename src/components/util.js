/**
 * Checks if x is between x0 and x1
 * @param x 
 * @param x0 
 * @param x1 
 * @returns 
 */
export const between = (x, x0, x1) => {
    return (x >= x0 && x <= x1) || (x >= x1 && x <= x0);
}
        
/**
 * Map between categorical values and colors for the seasons
 */
export const seasonColorDictionary = {
    "Summer": "#ca0020",
    "Autumn": "#f4a582",
    "Winter": "#92c5de",
    "Spring": "#0571b0"
};

/**
 * Viridis colorscale used to highlight selections in the parallel plot
 */
export const parallelPlotColor = [
    '#440154',
    '#482878',
    '#3e4989',
    '#31688e',
    '#26828e',
    '#1f9e89',
    '#35b779',
    '#6ece58',
    '#b5de2b',
    '#fde725'
];

/**
 * Generate a linear space between x and y with howMany steps
 * @param x 
 * @param y 
 * @param howMany 
 * @returns 
 */
export const generateLinSpace = (x, y, howMany) => {
    let arr = [];
    let step = (y - x) / (howMany - 1);
    for (let i = 0; i < howMany; i++) {
        arr.push(x + i * step);
    }
    return arr;
}

/**
 * Map between categorical values and labels for the holidays
 */
export const catToLabelMap = {
    "Seasons": "Seasons",
    "Holiday": "Holiday",
    "FunctioningDay": "Functioning Day"
}
/**
 * Map between categorical values and colors for the seasons
 */
export const SeasonColor = {
    "Summer": "#ca0020",
    "Autumn": "#f4a582",
    "Winter": "#92c5de",
    "Spring": "#0571b0"
};

/**
 * Map between categorical values and colors for the holidays
 */
export const HolidayColor = {
    "Holiday": "#fde725",
    "No Holiday": "#440154"
};

/**
 * Map between categorical values and radii multipliers for the holidays
 */
export const HolidayResize = {
    "Holiday": 1.7,
    "No Holiday": 1
}

/**
 * Map between categorical values and colors for the functioning days
 */
export const FunctioningDayColor = {
    "No": "#ff8000",
    "Yes": "#219b9d"
};

/**
 * Map between attributes and admitted values for such attributes
 */
export const categoricalValues = {
    "Seasons" : ["Summer", "Autumn", "Winter", "Spring"],
    "Holiday" : ["Holiday", "No Holiday"],
    "FunctioningDay" : ["No", "Yes"]
}

/**
 * Map between categorical values and radii multipliers for the functioning days
 */
export const FunctioningDayResize = {
    "No": 1.7,
    "Yes": 1
}

/**
 * Opacity of the scatter plot points
 */
export const basicScatterOpacity = 0.2;
/**
 * Opacity of the scatter plot points when they are highlighted
 */
export const importantScatterOpacity = 1;
/**
 * Transition time for the plot animations
 */
export const transitionTime = 2000;


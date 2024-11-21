export const between = (x, x0, x1) => {
    return (x >= x0 && x <= x1) || (x >= x1 && x <= x0);
}
        
export const seasonColorDictionary = {
    "Summer": "#ca0020",
    "Autumn": "#f4a582",
    "Winter": "#92c5de",
    "Spring": "#0571b0"
};

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

export const generateLinSpace = (x, y, howMany) => {
    let arr = [];
    let step = (y - x) / (howMany - 1);
    for (let i = 0; i < howMany; i++) {
        arr.push(x + i * step);
    }
    return arr;
}

export const catToLabelMap = {
    "Seasons": "Seasons",
    "Holiday": "Holiday",
    "FunctioningDay": "Functioning Day"
}

export const SeasonColor = {
    "Summer": "#ca0020",
    "Autumn": "#f4a582",
    "Winter": "#92c5de",
    "Spring": "#0571b0"
};

export const HolidayColor = {
    "Holiday": "#f4a582",
    "No Holiday": "#0571b0"
};

export const HolidayResize = {
    "Holiday": 1.5,
    "No Holiday": 1
}

export const FunctioningDayColor = {
    "No": "#f4a582",
    "Yes": "#0571b0"
};

export const categoricalValues = {
    "Seasons" : ["Summer", "Autumn", "Winter", "Spring"],
    "Holiday" : ["Holiday", "No Holiday"],
    "FunctioningDay" : ["No", "Yes"]
}

export const FunctioningDayResize = {
    "No": 1.5,
    "Yes": 1
}

export const basicScatterOpacity = 0.2;
export const importantScatterOpacity = 0.7;
export const transitionTime = 2000;


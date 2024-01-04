const DUMMY_DATA = [
    {id: 'd1', value: 10, region: 'USA'},
    {id: 'd2', value: 11, region: 'India'},
    {id: 'd3', value: 12, region: 'China'},
    {id: 'd4', value: 9, region: 'Germany'}
]

const container  = d3.select('div')
    .classed('container', true)
    .style('border', '1px solid red');
 
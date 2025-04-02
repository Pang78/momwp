'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';

import {
  ChartType,
  ChartTemplate
} from './WizardChart';

interface WizardChartContentProps {
  data: Record<string, any>[];
  chartType: ChartType;
  chartTemplate: ChartTemplate;
  xAxisKey: string;
  yAxisKey: string;
  secondaryYAxisKey?: string;
  title?: string;
  colorPalette?: string[];
}

const WizardChartContent = ({
  data,
  chartType,
  chartTemplate,
  xAxisKey,
  yAxisKey,
  secondaryYAxisKey,
  title,
  colorPalette = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F']
}: WizardChartContentProps) => {
  // Determine if data contains valid information for visualization
  const hasValidData = data && data.length > 0 && xAxisKey && yAxisKey;
  
  // Common responsive container props
  const containerProps = {
    width: '100%',
    height: 400,
  };
  
  // Animation properties
  const animationProps = {
    isAnimationActive: true,
    animationBegin: 0,
    animationDuration: 1000,
    animationEasing: 'ease-out'
  };
  
  // Format tooltip values for better readability
  const formatTooltipValue = (value: any) => {
    if (typeof value === 'number') {
      // Format based on the magnitude of the number
      if (Math.abs(value) >= 1000000) {
        return `${(value / 1000000).toFixed(2)}M`;
      } else if (Math.abs(value) >= 1000) {
        return `${(value / 1000).toFixed(2)}K`;
      } else if (Number.isInteger(value)) {
        return value.toString();
      } else {
        return value.toFixed(2);
      }
    }
    return String(value);
  };
  
  // Show a message if there's no data available
  if (!hasValidData) {
    return (
      <div className="flex items-center justify-center h-[400px] w-full bg-gray-50 dark:bg-gray-900 rounded-md border">
        <p className="text-muted-foreground">No data available. Please select valid axes.</p>
      </div>
    );
  }

  // Return appropriate chart based on type and template
  switch (chartType) {
    case 'bar': {
      return (
        <ResponsiveContainer {...containerProps}>
          <BarChart 
            data={data} 
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => typeof value === 'string' && value.length > 15 ? `${value.substring(0, 15)}...` : value}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickFormatter={formatTooltipValue}
            />
            <Tooltip 
              formatter={(value: any) => [formatTooltipValue(value), yAxisKey]}
              labelFormatter={(label) => `${xAxisKey}: ${label}`}
              contentStyle={{ 
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                fontSize: '12px'
              }}
            />
            <Legend />
            
            {chartTemplate === 'stacked' ? (
              <>
                {Object.keys(data[0] || {})
                  .filter(key => key !== xAxisKey && key !== '_original' && typeof data[0][key] === 'number')
                  .map((key, index) => (
                    <Bar
                      key={key}
                      dataKey={key}
                      stackId="a"
                      fill={colorPalette[index % colorPalette.length]}
                      name={key}
                      {...animationProps}
                    />
                  ))
                }
              </>
            ) : chartTemplate === 'comparison' && secondaryYAxisKey ? (
              <>
                <Bar 
                  dataKey={yAxisKey} 
                  fill={colorPalette[0]} 
                  name={yAxisKey}
                  barSize={30}
                  {...animationProps}
                />
                <Bar 
                  dataKey={secondaryYAxisKey} 
                  fill={colorPalette[1]} 
                  name={secondaryYAxisKey}
                  barSize={30}
                  {...animationProps}
                />
              </>
            ) : chartTemplate === 'distribution' ? (
              <Bar
                dataKey={yAxisKey}
                name={yAxisKey}
                fill={colorPalette[0]}
                barSize={30}
                background={{ fill: '#f5f5f5' }}
                {...animationProps}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colorPalette[index % colorPalette.length]}
                  />
                ))}
              </Bar>
            ) : chartTemplate === 'time-series' ? (
              <>
                <Bar 
                  dataKey={yAxisKey} 
                  fill={colorPalette[0]} 
                  name={yAxisKey}
                  barSize={30}
                  {...animationProps}
                />
                <ReferenceLine 
                  y={data.reduce((sum, item) => sum + (Number(item[yAxisKey]) || 0), 0) / data.length} 
                  stroke="#ff7300" 
                  strokeDasharray="5 5" 
                  label={{ 
                    value: 'Average', 
                    fill: '#ff7300',
                    position: 'insideBottomRight'
                  }}
                />
              </>
            ) : (
              <Bar 
                dataKey={yAxisKey} 
                fill={colorPalette[0]} 
                name={yAxisKey}
                barSize={30}
                {...animationProps}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    case 'line': {
      return (
        <ResponsiveContainer {...containerProps}>
          <LineChart 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => typeof value === 'string' && value.length > 15 ? `${value.substring(0, 15)}...` : value}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickFormatter={formatTooltipValue}
            />
            <Tooltip 
              formatter={(value: any) => [formatTooltipValue(value), yAxisKey]}
              labelFormatter={(label) => `${xAxisKey}: ${label}`}
              contentStyle={{ 
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                fontSize: '12px'
              }}
            />
            <Legend />
            {chartTemplate === 'comparison' && secondaryYAxisKey ? (
              <>
                <Line
                  type="monotone"
                  dataKey={yAxisKey}
                  stroke={colorPalette[0]}
                  strokeWidth={2}
                  dot={{ stroke: colorPalette[0], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 8 }}
                  name={yAxisKey}
                  {...animationProps}
                />
                <Line
                  type="monotone"
                  dataKey={secondaryYAxisKey}
                  stroke={colorPalette[1]}
                  strokeWidth={2}
                  dot={{ stroke: colorPalette[1], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 8 }}
                  name={secondaryYAxisKey}
                  {...animationProps}
                />
              </>
            ) : chartTemplate === 'time-series' ? (
              <>
                <Line
                  type="monotone"
                  dataKey={yAxisKey}
                  stroke={colorPalette[0]}
                  strokeWidth={2}
                  dot={{ stroke: colorPalette[0], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 8 }}
                  name={yAxisKey}
                  {...animationProps}
                />
                <ReferenceLine 
                  y={data.reduce((sum, item) => sum + (Number(item[yAxisKey]) || 0), 0) / data.length}
                  label={{ 
                    value: 'Average', 
                    position: 'insideBottomRight',
                    fill: '#ff7300' 
                  }} 
                  stroke="#ff7300" 
                  strokeDasharray="3 3" 
                />
              </>
            ) : chartTemplate === 'curved' ? (
              <Line
                type="natural"
                dataKey={yAxisKey}
                stroke={colorPalette[0]}
                strokeWidth={2}
                dot={{ stroke: colorPalette[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8 }}
                name={yAxisKey}
                {...animationProps}
              />
            ) : chartTemplate === 'stepped' ? (
              <Line
                type="stepAfter"
                dataKey={yAxisKey}
                stroke={colorPalette[0]}
                strokeWidth={2}
                dot={{ stroke: colorPalette[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8 }}
                name={yAxisKey}
                {...animationProps}
              />
            ) : (
              <Line
                type="monotone"
                dataKey={yAxisKey}
                stroke={colorPalette[0]}
                strokeWidth={2}
                dot={{ stroke: colorPalette[0], strokeWidth: 2, r: 4 }}
                activeDot={{ r: 8 }}
                name={yAxisKey}
                {...animationProps}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    case 'pie': {
      // Process data for pie chart - to handle aggregation and ensure limited segments
      const pieData = React.useMemo(() => {
        // Group by the xAxis and aggregate yAxis values
        const aggregated: Record<string, number> = {};
        
        data.forEach((item: Record<string, any>) => {
          const key = String(item[xAxisKey] || 'Unknown');
          if (!aggregated[key]) {
            aggregated[key] = 0;
          }
          aggregated[key] += Number(item[yAxisKey]) || 0;
        });
        
        // Convert to array for the pie chart
        return Object.entries(aggregated)
          .map(([name, value]) => ({
            name,
            value
          }))
          // Limit number of slices for better visualization - show top N and group others
          .sort((a, b) => b.value - a.value)
          .slice(0, 10); // Show top 10 values only - can be adjusted
      }, [data, xAxisKey, yAxisKey]);
      
      if (chartTemplate === 'donut') {
        return (
          <ResponsiveContainer {...containerProps}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={150}
                paddingAngle={2}
                label={(props) => {
                  const { cx, cy, midAngle, innerRadius, outerRadius, name, percent } = props;
                  const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                  
                  // Only show label if the segment is big enough
                  if (percent < 0.05) return null;
                  
                  return (
                    <text 
                      x={x} 
                      y={y} 
                      fill={colorPalette[pieData.findIndex(d => d.name === name) % colorPalette.length]}
                      textAnchor={x > cx ? 'start' : 'end'} 
                      dominantBaseline="central"
                      fontSize={12}
                    >
                      {`${name} (${(percent * 100).toFixed(0)}%)`}
                    </text>
                  );
                }}
                labelLine={false}
                {...animationProps}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colorPalette[index % colorPalette.length]}
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [formatTooltipValue(value), yAxisKey]}
                contentStyle={{ 
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  fontSize: '12px'
                }}
              />
              <Legend 
                layout="vertical"
                verticalAlign="middle"
                align="right"
                iconSize={10}
                iconType="circle"
                formatter={(value) => {
                  return <span style={{ fontSize: 12 }}>{value}</span>;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      } else {
        return (
          <ResponsiveContainer {...containerProps}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                paddingAngle={1}
                label={(props) => {
                  const { cx, cy, midAngle, innerRadius, outerRadius, name, percent } = props;
                  const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                  
                  // Only show label if the segment is big enough
                  if (percent < 0.05) return null;
                  
                  return (
                    <text 
                      x={x} 
                      y={y} 
                      fill={colorPalette[pieData.findIndex(d => d.name === name) % colorPalette.length]}
                      textAnchor={x > cx ? 'start' : 'end'} 
                      dominantBaseline="central"
                      fontSize={12}
                    >
                      {`${name} (${(percent * 100).toFixed(0)}%)`}
                    </text>
                  );
                }}
                labelLine={false}
                {...animationProps}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colorPalette[index % colorPalette.length]}
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => [formatTooltipValue(value), yAxisKey]}
                contentStyle={{ 
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  fontSize: '12px'
                }}
              />
              <Legend 
                layout="vertical"
                verticalAlign="middle"
                align="right"
                iconSize={10}
                iconType="circle"
                formatter={(value) => {
                  return <span style={{ fontSize: 12 }}>{value}</span>;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      }
    }

    case 'scatter': {
      // Convert data for scatter plot (ensuring numeric X and Y values)
      const scatterData = React.useMemo(() => {
        return data.map(item => ({
          x: Number(item[xAxisKey]) || 0,
          y: Number(item[yAxisKey]) || 0,
          name: String(item[xAxisKey]),
          original: item
        }));
      }, [data, xAxisKey, yAxisKey]);
      
      return (
        <ResponsiveContainer {...containerProps}>
          <ScatterChart
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="x"
              type="number"
              name={xAxisKey}
              domain={['auto', 'auto']}
              label={{ value: xAxisKey, position: 'insideBottom', offset: -10 }}
              tick={{ fontSize: 12 }}
              tickFormatter={formatTooltipValue}
            />
            <YAxis
              dataKey="y"
              type="number"
              name={yAxisKey}
              domain={['auto', 'auto']}
              label={{ value: yAxisKey, angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12 }}
              tickFormatter={formatTooltipValue}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value: any, name: string) => {
                if (name === 'x') return [formatTooltipValue(value), xAxisKey];
                if (name === 'y') return [formatTooltipValue(value), yAxisKey];
                return [value, name];
              }}
              contentStyle={{ 
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                fontSize: '12px'
              }}
            />
            <Legend />
            {chartTemplate === 'correlation' ? (
              <>
                <Scatter
                  name={`${xAxisKey} vs ${yAxisKey}`}
                  data={scatterData}
                  fill={colorPalette[0]}
                  {...animationProps}
                >
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colorPalette[index % colorPalette.length]}
                    />
                  ))}
                </Scatter>
                
                {/* Add trend line (linear regression) */}
                {scatterData.length > 1 && (
                  <ReferenceLine
                    stroke="red"
                    strokeDasharray="3 3"
                    segment={(() => {
                      // Compute linear regression
                      const n = scatterData.length;
                      const sumX = scatterData.reduce((sum, item) => sum + item.x, 0);
                      const sumY = scatterData.reduce((sum, item) => sum + item.y, 0);
                      const sumXY = scatterData.reduce((sum, item) => sum + item.x * item.y, 0);
                      const sumXX = scatterData.reduce((sum, item) => sum + item.x * item.x, 0);
                      
                      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                      const intercept = (sumY - slope * sumX) / n;
                      
                      // Get min and max X values to draw the line
                      const minX = Math.min(...scatterData.map(item => item.x));
                      const maxX = Math.max(...scatterData.map(item => item.x));
                      
                      return [
                        { x: minX, y: slope * minX + intercept },
                        { x: maxX, y: slope * maxX + intercept }
                      ];
                    })()}
                  />
                )}
              </>
            ) : (
              <Scatter 
                name={yAxisKey} 
                data={scatterData} 
                fill={colorPalette[0]} 
                {...animationProps}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    case 'area': {
      return (
        <ResponsiveContainer {...containerProps}>
          <AreaChart 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <defs>
              {/* Create gradients for each color in the palette */}
              {colorPalette.map((color, index) => (
                <linearGradient key={`gradient-${index}`} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0.1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => typeof value === 'string' && value.length > 15 ? `${value.substring(0, 15)}...` : value}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickFormatter={formatTooltipValue}
            />
            <Tooltip 
              formatter={(value: any) => [formatTooltipValue(value), yAxisKey]}
              labelFormatter={(label) => `${xAxisKey}: ${label}`}
              contentStyle={{ 
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                fontSize: '12px'
              }}
            />
            <Legend 
              iconType="rect"
              formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>}
            />
            
            {chartTemplate === 'stacked' ? (
              <>
                {Object.keys(data[0] || {})
                  .filter(key => key !== xAxisKey && key !== '_original' && typeof data[0][key] === 'number')
                  .map((key, index) => (
                    <Area
                      key={key}
                      type="monotone"
                      dataKey={key}
                      name={key}
                      stackId="1"
                      stroke={colorPalette[index % colorPalette.length]}
                      fill={`url(#colorGradient${index % colorPalette.length})`}
                      {...animationProps}
                    />
                  ))
                }
              </>
            ) : chartTemplate === 'time-series' ? (
              <>
                <Area
                  type="monotone"
                  dataKey={yAxisKey}
                  name={yAxisKey}
                  stroke={colorPalette[0]}
                  fill={`url(#colorGradient0)`}
                  {...animationProps}
                />
                <ReferenceLine 
                  y={data.reduce((sum, item) => sum + (Number(item[yAxisKey]) || 0), 0) / data.length}
                  label={{ 
                    value: 'Average', 
                    position: 'insideBottomRight',
                    fill: '#ff7300' 
                  }} 
                  stroke="#ff7300" 
                  strokeDasharray="3 3" 
                />
              </>
            ) : (
              <Area
                type="monotone"
                dataKey={yAxisKey}
                name={yAxisKey}
                stroke={colorPalette[0]}
                fill={`url(#colorGradient0)`}
                {...animationProps}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    case 'radar': {
      return (
        <ResponsiveContainer {...containerProps}>
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius={150}
            data={data}
          >
            <PolarGrid stroke="#e5e5e5" />
            <PolarAngleAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => typeof value === 'string' && value.length > 10 ? `${value.substring(0, 10)}...` : value}
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 'auto']} 
              tick={{ fontSize: 10 }}
              tickFormatter={formatTooltipValue}
            />
            <Radar
              name={yAxisKey}
              dataKey={yAxisKey}
              stroke={colorPalette[0]}
              fill={colorPalette[0]}
              fillOpacity={0.6}
              {...animationProps}
            />
            {secondaryYAxisKey && (
              <Radar
                name={secondaryYAxisKey}
                dataKey={secondaryYAxisKey}
                stroke={colorPalette[1]}
                fill={colorPalette[1]}
                fillOpacity={0.6}
                {...animationProps}
              />
            )}
            <Legend 
              iconType="circle"
              formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>}
            />
            <Tooltip 
              formatter={(value: any) => [formatTooltipValue(value), yAxisKey]}
              contentStyle={{ 
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                fontSize: '12px'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      );
    }

    case 'composed': {
      return (
        <ResponsiveContainer {...containerProps}>
          <ComposedChart 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => typeof value === 'string' && value.length > 15 ? `${value.substring(0, 15)}...` : value}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickFormatter={formatTooltipValue}
            />
            <Tooltip 
              formatter={(value: any) => [formatTooltipValue(value), yAxisKey]}
              labelFormatter={(label) => `${xAxisKey}: ${label}`}
              contentStyle={{ 
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                fontSize: '12px'
              }}
            />
            <Legend 
              formatter={(value) => <span style={{ fontSize: 12 }}>{value}</span>}
            />
            {chartTemplate === 'comparison' ? (
              <>
                <Bar 
                  dataKey={yAxisKey} 
                  name={`${yAxisKey} (Bar)`}
                  barSize={20} 
                  fill={colorPalette[0]} 
                  {...animationProps}
                />
                <Line 
                  type="monotone" 
                  dataKey={secondaryYAxisKey} 
                  name={`${secondaryYAxisKey} (Line)`}
                  stroke={colorPalette[1]} 
                  strokeWidth={2}
                  dot={{ stroke: colorPalette[1], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 8 }}
                  {...animationProps}
                />
              </>
            ) : chartTemplate === 'time-series' ? (
              <>
                <Bar 
                  dataKey={yAxisKey} 
                  name={`${yAxisKey} (Bar)`}
                  barSize={20} 
                  fill={colorPalette[0]} 
                  {...animationProps}
                />
                <Line
                  type="monotone"
                  dataKey={yAxisKey}
                  name={`${yAxisKey} (Trend)`}
                  stroke={colorPalette[1]}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  {...animationProps}
                />
                <ReferenceLine 
                  y={data.reduce((sum, item) => sum + (Number(item[yAxisKey]) || 0), 0) / data.length}
                  label={{ 
                    value: 'Average', 
                    position: 'insideBottomRight',
                    fill: '#ff7300' 
                  }} 
                  stroke="#ff7300" 
                  strokeDasharray="3 3" 
                />
              </>
            ) : (
              <>
                <Bar 
                  dataKey={yAxisKey} 
                  name={`${yAxisKey} (Bar)`}
                  barSize={20} 
                  fill={colorPalette[0]} 
                  {...animationProps}
                />
                <Line 
                  type="monotone" 
                  dataKey={yAxisKey} 
                  name={`${yAxisKey} (Line)`}
                  stroke={colorPalette[1]} 
                  strokeWidth={2}
                  dot={{ stroke: colorPalette[1], strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 8 }}
                  {...animationProps}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      );
    }

    default:
      return (
        <div className="flex flex-col items-center justify-center h-[400px] w-full bg-gray-50 dark:bg-gray-900 rounded-md border space-y-4">
          <div className="text-muted-foreground text-lg">
            {chartType ? 
              `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} chart type is not yet supported` :
              "Please select a chart type"
            }
          </div>
          <p className="text-sm text-muted-foreground">
            Try selecting one of the available chart types: Bar, Line, Pie, Scatter, Area, Radar or Composed
          </p>
        </div>
      );
  }
};

export default WizardChartContent;
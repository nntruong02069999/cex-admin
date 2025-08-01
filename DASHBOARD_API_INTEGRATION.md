# Dashboard API Integration

This document explains the integration of the Dashboard component with the backend API.

## Overview

The Dashboard component has been updated to fetch real-time data from the backend API instead of using mock data. The integration includes proper error handling, loading states, data transformation, and a default 30-day date range.

## Files Modified

### 1. `src/services/dashboard.ts` (New)
- **Purpose**: Contains the API service function for fetching dashboard data
- **Function**: `getDashboardData(startTime?, endTime?)` - Fetches dashboard data with optional timestamp range filtering
- **Returns**: API response with dashboard data or error information

### 2. `src/components/dashboard/types.ts`
- **Updated**: Added `ApiDashboardResponse` interface to match the backend API response structure
- **Updated**: Modified `DashboardState` to include loading and error states
- **Updated**: Added profit field to `ChartDataType` interface

### 3. `src/components/dashboard/index.tsx`
- **Updated**: Replaced mock data with real API integration
- **Added**: Loading states and error handling
- **Added**: Data transformation logic to convert API response to component state
- **Added**: Automatic data fetching on component mount with 30-day default range
- **Added**: Date range filtering functionality with timestamp conversion

## API Response Format

The API endpoint expects to return data in the following format:

```json
{
  "code": 0,
  "message": "Success",
  "data": {
    "summaryDeposit": {
      "pending": number,
      "success": number,
      "failed": number
    },
    "summaryWithdraw": {
      "pending": number,
      "success": number,
      "rejected": number
    },
    "chartData": [
      {
        "name": "YYYY-MM-DD",
        "revenue": number,
        "expense": number,
        "profit": number
      }
    ],
    "newsDeposit": {
      "data": [
        {
          "id": number,
          "time": string,
          "userId": string,
          "amount": string,
          "type": string
        }
      ],
      "total": number
    },
    "newsWithdraw": {
      "data": [...],
      "total": number
    },
    "topUserDeposit": [
      {
        "id": number,
        "userId": string,
        "totalDeposit": string
      }
    ]
  }
}
```

## Key Features

### Default Date Range
- **30-day range**: Automatically sets start date to 30 days ago and end date to today
- **Automatic loading**: Fetches data with default range on component mount
- **Timestamp conversion**: Converts date picker selections to Unix timestamps for API

### Loading States
- **Full dashboard loading**: Displays a spinner overlay while fetching data
- **Error handling**: Shows error alerts if API calls fail
- **Graceful fallbacks**: Maintains data integrity during state transitions

### Data Transformation
- **Summary calculations**: Automatically calculates total revenue, expenses, and profit from chart data
- **Request mapping**: Maps API deposit/withdrawal data to component requirements
- **Format consistency**: Ensures data formats match component expectations

### Date Range Filtering
- **Real-time updates**: Fetches new data when date range changes
- **Timestamp conversion**: Converts date picker values to Unix timestamps for API
- **State synchronization**: Updates both display and internal state

## Usage

The Dashboard component automatically:
1. Sets a default 30-day date range (30 days ago to today)
2. Fetches data on mount with the default range
3. Shows loading states during API calls
4. Displays error messages for failed requests
5. Updates data when date range changes
6. Transforms API responses to component-compatible format

## API Endpoint

- **URL**: `/admin/dashboard/get-summary-all`
- **Method**: POST
- **Authentication**: Bearer token from localStorage
- **Parameters**: 
  - `startTime` (optional): Start timestamp in milliseconds (Unix timestamp)
  - `endTime` (optional): End timestamp in milliseconds (Unix timestamp)
- **Default Range**: If no parameters provided, uses 30 days ago to today

## Date Handling

### Default Behavior
```javascript
// Automatically calculated on component mount
const endDate = new Date();
const startDate = new Date();
startDate.setDate(startDate.getDate() - 30);
```

### Date Range Selection
```javascript
// When user selects dates, converts to timestamps
const startTime = dates[0].startOf('day').valueOf(); // Start of selected day
const endTime = dates[1].endOf('day').valueOf();     // End of selected day
```

## Error Handling

The integration includes comprehensive error handling:
- Network errors are caught and displayed to users
- API error responses are parsed and shown with appropriate messages
- Loading states are properly managed during error scenarios
- Fallback data prevents component crashes

## Future Enhancements

- **Pagination**: Implement pagination for transaction tables
- **Real-time updates**: Consider WebSocket integration for live data
- **Caching**: Add data caching to improve performance
- **User accounts**: Include user account statistics in the API response
- **Custom date ranges**: Add preset date range options (7 days, 90 days, etc.) 
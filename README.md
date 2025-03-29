# Data.gov.sg Explorer

A modern web application for searching, visualizing, and exploring datasets from data.gov.sg.

## Features

- 🔍 **Dataset Search**: Search through all available datasets on data.gov.sg
- 📊 **Data Visualization**: View data in tables, bar charts, line charts, and pie charts
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- 🔄 **Real-time Filtering**: Filter and search within datasets
- 💾 **Data Export**: Download data as CSV for further analysis

## Technologies

- **Framework**: Next.js with TypeScript
- **UI Library**: Tailwind CSS with Shadcn UI components
- **State Management**: Zustand
- **Data Visualization**: Recharts
- **Data Table**: TanStack Table
- **API Communication**: Axios

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/data-gov-sg-explorer.git
cd data-gov-sg-explorer

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Development

### Project Structure

```
/src
  /app                 # Next.js app directory
  /components          # React components
    /datasets          # Dataset-related components
    /visualizations    # Visualization components
  /lib                 # Utilities and API clients
    /api               # API clients
  /types               # TypeScript type definitions
```

### Environment Variables

No environment variables are required as the application uses public APIs.

## Deployment

This application can be easily deployed to Vercel:

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Deploy with one click

## License

MIT

## Acknowledgements

- [data.gov.sg](https://data.gov.sg) for providing the data and APIs
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
- [TanStack Table](https://tanstack.com/table)

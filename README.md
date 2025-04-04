# Game Score Tracker

A web application for tracking game scores.

## Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages. Here's how it works:

1. Push your changes to the `main` branch
2. The GitHub Actions workflow will automatically build and deploy the application to GitHub Pages
3. Your app will be available at `https://[your-username].github.io/game-score-tracker/`

### Manual Deployment

To manually deploy the application:

```bash
# Install dependencies
npm install

# Build the application
npm run deploy

# Push the 'out' directory to the gh-pages branch
npx gh-pages -d out

```


### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
``` 
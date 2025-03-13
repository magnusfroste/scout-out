# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c02ac9cd-325b-41bb-9a1b-ee8766efe98b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c02ac9cd-325b-41bb-9a1b-ee8766efe98b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Development Features

### Mock Data for Company Search

To reduce API costs during development and testing, the application includes a mock data system for company searches.

#### How to Enable Mock Data

1. Set the environment variable `VITE_USE_MOCK_DATA` to `true` in your `.env.development` file:
   ```
   VITE_USE_MOCK_DATA=true
   ```

2. The mock system will automatically be used when:
   - The application is running in development mode (`import.meta.env.DEV` is true)
   - The `VITE_USE_MOCK_DATA` environment variable is set to `true`

#### Available Mock Companies

The mock system includes pre-defined responses for the following companies:
- Apple
- Microsoft
- Tesla
- Google

For any other company name, a default mock response will be provided.

#### Testing Error Handling

To test error handling, include the word "error" in the company name (e.g., "Error Corp"). This will simulate a failed API response.

#### Customizing Mock Data

You can add or modify mock company data by editing the `src/mocks/companySearchMock.ts` file.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c02ac9cd-325b-41bb-9a1b-ee8766efe98b) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

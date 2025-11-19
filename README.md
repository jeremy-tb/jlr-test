# API Web App

A web application built with React and TypeScript that allows administrators to configure API endpoints and create dynamic forms for making API calls.

## Features

- **Admin Configuration Panel**: Define API endpoints, authentication, and input fields
- **Dynamic Form Generation**: Automatically generate forms based on admin configuration
- **Multiple Authentication Methods**: Support for Bearer tokens, Basic Auth, API Keys, and no authentication
- **Flexible Payload Building**: Create custom payload templates with field placeholders
- **Multiple Configurations**: Save and manage multiple API configurations
- **Response Display**: View API responses with syntax highlighting
- **Secure Storage**: Encrypted local storage for sensitive configuration data

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd jlr-test
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Development Mode

Run the application in development mode with hot-reloading:

```bash
npm run dev
```

This will start the Vite dev server and open the application in your browser at `http://localhost:5173`.

### Build for Production

Build the application for production deployment:

```bash
npm run build
```

This will create optimized static files in the `dist` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## How to Use

### 1. Create an API Configuration

1. Click "New Configuration" from the main screen
2. Fill in the API endpoint details:
   - **Endpoint URL**: The full URL of the API endpoint
   - **Method**: HTTP method (GET, POST, PUT, PATCH, DELETE)
3. Configure authentication:
   - **None**: No authentication
   - **Bearer Token**: Add a bearer token
   - **Basic Auth**: Username and password
   - **API Key**: Custom API key with header name

### 2. Define Input Fields

For each field you want users to input:
- **Field ID**: Unique identifier used in the API payload
- **Field Name**: Display name shown to users
- **Type**: Input type (text, number, email, password, textarea, select)
- **Placeholder**: Placeholder text for the input
- **Default Value**: Pre-filled value
- **Required**: Whether the field is mandatory
- **Options**: For select fields, provide comma-separated options

### 3. Advanced: Custom Payload Template

If your API requires a specific payload structure, use the payload template feature:

```json
{
  "data": {
    "user": {
      "name": "{{username}}",
      "email": "{{email}}"
    }
  }
}
```

Use `{{field_id}}` syntax to reference field values.

### 4. Use the Configuration

1. From the configuration list, click "Use" on any configuration
2. Fill in the form fields
3. Click "Send Request" to call the API
4. View the response below the form

### 5. Manage Configurations

- **Edit**: Modify an existing configuration
- **Delete**: Remove a configuration
- **Use**: Open the form for that configuration

## Project Structure

```
jlr-test/
├── src/               # React application
│   ├── components/    # React components
│   │   ├── AdminPanel.tsx
│   │   ├── AdminPanel.css
│   │   ├── DynamicForm.tsx
│   │   └── DynamicForm.css
│   ├── types.ts       # TypeScript type definitions
│   ├── storage.ts     # Local storage utilities
│   ├── api.ts         # API calling logic
│   ├── App.tsx        # Main App component
│   ├── App.css        # App styles
│   ├── main.tsx       # React entry point
│   └── index.css      # Global styles
├── index.html         # HTML template
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript config
├── tsconfig.node.json # TypeScript config (Vite)
└── vite.config.ts     # Vite configuration
```

## Technologies Used

- **React**: UI library for building the interface
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Axios**: HTTP client for API calls

## Security Considerations

- The application uses basic base64 encoding for browser local storage. For production use with sensitive data, implement stronger encryption
- Credentials are stored in the browser's local storage
- Always use HTTPS endpoints when possible
- Be cautious when sharing configurations that contain credentials
- Browser local storage can be cleared, so back up important configurations

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

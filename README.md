# ShareKaro

A secure, fast, and user-friendly platform for sharing text and files without the hassle of lengthy logins or sign-ups. ShareKaro enables instant sharing with custom URLs, password protection, and encryption.

## 🚀 Features

### Text Sharing
- **Encrypted Storage**: All text content is encrypted using AES-256-CBC encryption
- **Password Protection**: Lock your shared text with a passkey
- **Custom URLs**: Generate or customize your sharing URL with a 5-character key
- **Session-based Access**: Unlocked pages remain accessible for 2 minutes
- **Keyboard Shortcuts**: Save text using `Ctrl+S` (or `Cmd+S` on Mac)

### File Sharing
- **Drag & Drop Upload**: Intuitive file upload interface
- **GridFS Storage**: Efficient file storage using MongoDB GridFS
- **File Size Display**: Human-readable file size information
- **One-click Download**: Easy file retrieval
- **File Management**: Clear uploaded files when needed

### Security
- **AES-256-CBC Encryption**: Industry-standard encryption for sensitive data
- **Helmet.js**: Security headers protection
- **Content Security Policy**: XSS and injection attack prevention
- **Session Management**: Secure session handling with express-session

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **MongoDB** (local or cloud instance)
- **npm** (Node Package Manager)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Share-karo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```env
   URI=mongodb://localhost:27017/Share-Note
   # OR for MongoDB Atlas:
   # URI=mongodb+srv://username:password@cluster.mongodb.net/Share-Note
   
   encyptKey=your-encryption-key-here
   sessionKey=your-session-secret-key-here
   ```
   
   **Important**: 
   - Use a strong, random encryption key (at least 32 characters)
   - Use a strong, random session secret key
   - Never commit the `.env` file to version control

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system or use a cloud MongoDB instance.

5. **Run the application**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npx nodemon app.js
   ```

6. **Access the application**
   
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
Share-karo/
├── app.js                 # Main Express application file
├── functions.js           # Utility functions (encryption, key generation, etc.)
├── package.json           # Project dependencies
├── .env                   # Environment variables (not in repo)
├── .gitignore            # Git ignore file
├── public/
│   └── style.css         # Application styles
├── images/               # Static images
└── views/                # EJS templates
    ├── index.ejs         # Home page
    ├── get-started.ejs   # Get started page
    ├── about-devs.ejs    # About developers page
    ├── how-to-use.ejs    # Usage instructions
    ├── text-share.ejs    # Text sharing interface
    ├── file-share.ejs    # File sharing interface
    ├── unLock.ejs        # Password unlock page
    ├── 404-page-not-found.ejs  # 404 error page
    └── partials/         # Reusable components
        ├── head.ejs      # HTML head section
        ├── navbar.ejs    # Navigation bar
        ├── footer.ejs    # Footer component
        └── cards.ejs     # Card components
```

## 🔧 Configuration

### Database Setup

The application uses MongoDB with the following collections:
- **Data**: Stores encrypted text content
- **Lock**: Stores encrypted passwords for locked pages
- **FileDetails**: Stores file metadata
- **uploads** (GridFS bucket): Stores actual file data

### Port Configuration

By default, the application runs on port `3000`. To change this, modify the port number in `app.js`:
```javascript
app.listen(3000, () => console.log("Running on http://localhost:3000"));
```

## 🎯 Usage

### Sharing Text

1. Navigate to `/Text` or click "Get Started" and select text sharing
2. A random 5-character URL will be generated (e.g., `/Text/abc12`)
3. Enter your text content
4. Click "Save" to store the text
5. (Optional) Click "Lock" to protect the page with a password
6. Share the URL with others

### Sharing Files

1. Navigate to `/File` or click "Get Started" and select file sharing
2. A random 5-character URL will be generated (e.g., `/File/xyz45`)
3. Drag and drop a file or click to browse
4. Click "Upload" to store the file
5. Share the URL for others to download
6. Use "Clear File" to remove the uploaded file

### Unlocking Protected Content

1. When accessing a locked text page, enter the passkey
2. Upon successful authentication, the page remains unlocked for 2 minutes
3. After the session expires, re-enter the passkey to access

## 🔐 Security Features

- **Encryption**: All text and passwords are encrypted using AES-256-CBC
- **Secure Headers**: Helmet.js provides security headers
- **CSP**: Content Security Policy prevents XSS attacks
- **Session Security**: Secure session management with configurable expiration

## ⚠️ Important Notes

- **Data Retention**: This platform is designed for speed sharing, not long-term storage. Data may not be available after 30 days.
- **File Size Limit**: Currently supports files up to 20MB (configurable in `file-share.ejs`)
- **Session Duration**: Unlocked pages remain accessible for 2 minutes
- **No User Accounts**: The platform operates without user registration for quick sharing

## 🛡️ Security Best Practices

1. **Environment Variables**: Never commit `.env` files to version control
2. **Encryption Keys**: Use strong, randomly generated encryption keys
3. **HTTPS**: Deploy with HTTPS in production
4. **Rate Limiting**: Consider implementing rate limiting for production use
5. **Input Validation**: Always validate user inputs

## 🧑‍💻 Development

### Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, GridFS
- **Templating**: EJS
- **Security**: Helmet.js, crypto (Node.js)
- **File Upload**: Multer
- **Session**: express-session
- **Utilities**: Lodash

### Key Dependencies

```json
{
  "express": "^4.18.3",
  "mongodb": "^6.4.0",
  "mongoose": "^8.2.1",
  "ejs": "^3.1.9",
  "multer": "^1.4.5-lts.1",
  "helmet": "^7.1.0",
  "express-session": "^1.18.0",
  "crypto": "^1.0.1"
}
```

## 👥 Developers

- **Mithrajeeth Yadavar** - Backend Developer
  - Email: mithra86753@gmail.com
  - GitHub: [@mithrajeeth18](https://github.com/mithrajeeth18)
  - Twitter: [@Mithra_707](https://x.com/Mithra_707)
  - Instagram: [@mithra_707](https://www.instagram.com/mithra_707/)

- **Gandhar Bagde** - Full Stack Developer
  - Email: gandharbagde@gmail.com
  - GitHub: [@gandharrdotexe](https://github.com/gandharrdotexe)
  - Twitter: [@gandharbagde_](https://twitter.com/gandharbagde_)
  - Instagram: [@iamgandharrr._](https://www.instagram.com/iamgandharrr._/)
  - LinkedIn: [Gandhar Bagde](https://www.linkedin.com/in/gandhar-bagde-4406032a9)

## 📝 License

This project is open source and available for use and modification.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.



**Note**: This application is designed for quick sharing purposes. Always back up important data and do not rely on this platform for long-term data storage.

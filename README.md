# Rentify

Rentify is a web application for buying, selling, and renting properties. It allows sellers to list their properties and buyers to view and express interest in these properties. The application includes features for user authentication, property management, and property browsing.

## Features

### User Authentication
- **Registration**: Users can register as a seller or buyer.
- **Login**: Users can log in with their credentials.

### Seller Features
- **Add Property**: Sellers can list their properties with details such as title, description, location, price range, area, nearby facilities, and images.
- **View Properties**: Sellers can view the properties they have listed.
- **Edit Property**: Sellers can update the details of their listed properties.
- **Delete Property**: Sellers can delete their listed properties.

### Buyer Features
- **View Properties**: Buyers can view all listed properties.
- **Express Interest**: Buyers can express interest in a property, and the seller's details will be shown.
- **Like Property**: Buyers can like properties and the like count is tracked live.
- **Filters**: Buyers can apply filters based on property details.

### Additional Features
- **Pagination**: Property listings are paginated for better user experience.
- **Email Notifications**: When a buyer expresses interest in a property, both the buyer and the seller receive email notifications.

## Installation

### Prerequisites
- Node.js
- MongoDB

### Steps
1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd rentify
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Set up MongoDB:
    - Make sure MongoDB is running on your machine.
    - The application connects to MongoDB at `mongodb://localhost:27017/rentify`.

4. Set up environment variables:
    - Create a `.env` file in the root directory.
    - Add the following variables:
      ```env
      MONGO_URI=mongodb://localhost:27017/rentify
      EMAIL_USER=your-email@gmail.com
      EMAIL_PASS=your-email-password
      ```

5. Start the server:
    ```sh
    npm start
    ```

6. Start the client:
    ```sh
    cd client
    npm start
    ```

## Usage

### Running the Application
1. Open your browser and navigate to `http://localhost:3000`.
2. Register as a new user (seller or buyer).
3. Log in with your credentials.
4. If you are a seller, navigate to the seller dashboard to add, edit, or delete properties.
5. If you are a buyer, navigate to the buyer dashboard to view and express interest in properties.

## Project Structure

- `client`: Contains the React front-end code.
- `server.js`: Entry point for the Node.js back-end server.
- `models`: Contains Mongoose models for the application.
- `routes`: Contains route definitions for the API.
- `controllers`: Contains controller logic for handling requests.
- `middleware`: Contains middleware for the application.

## Screenshots

### Login
![Login](screenshots/login.png)

### Register
![Register](screenshots/register.png)

### Seller Dashboard
![Seller Dashboard](screenshots/seller-dashboard.png)

### Buyer Dashboard
![Buyer Dashboard](screenshots/buyer-dashboard.png)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [React](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Express](https://expressjs.com/)


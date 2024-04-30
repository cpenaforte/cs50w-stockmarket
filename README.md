# Capstone - Stockmarket

## Distinctiveness and Complexity
 - **Deep stock market system**:
     - Note that the **Project 2 is totally different**, specially in terms of the way the market flows. In this project, the stock market has 3 main Models (for simplicity):
        1. *Stock*: It is the main source of meaning of the app, it cannot be added or remove by a common user. Users can only trade shares of the stocks.
        2. *Offers*: Once an user wants to sell shares of a stock, he/she needs to place an offer with the quantity of shares and the price for each.
        3. *Operation*: If another user wantes to buy shares of a stock, one offer of another user must be chosen. It's important to mention that not all offers will be taken, the same as what happens in a real stock market.
 - **Real-Time portfolio evolution based on last operations**
 - **Multiple new tools used** (Docker, PostgreSQL, Vue 3, Chart.js, Material Icons, ...)
 - **State Management with Pinia** (for reducing number of requisitions to django json routes)
 - **Modals and Loading screens**
 - **Reusable components** (Thanks to Vue.js)

## Description of every parts of the JS code
 - **Services**: All necessary requisition functions are contained in these files
 - **Stores**: In these files, stores are created to hold main data from the requisitions and to update them only if necessary
 - **Layouts**: Vue components that define how the other components are placed on the screen, holding also components that appear in every page the user enters
 - **Pages**: The main part of the program, where specific grouped actions and informations are shown
 - **Components**: Reusable components that represent the small parts of the pages, similar to building blocks.
 - **Main File**: Necessary for applying Vue.js to the app.

## What you can do
 - See **Dashboard** page for insights on portfolio evolution
 - Use **Stocks** page to check stocks, check offers and buying stocks
 - Use **Portfolio** page to check bought shares of stocks, check their current prices, create a new offer for them and cancel an offer.
 
## Running
 1. Be sure you have Docker Compose installed locally
 2. Run `docker-compose up`

## First Use

### Create admin
 1. Run container and then run `docker-compose run app python manage.py createsuperuser`
 2. Type "admin" for username
 3. Type "admin@test.com" for email
 4. Type any password you want

### Create Default Stocks
 1. Go to http://localhost:8000/admin and login with the admin user created
 2. Create a few *Stocks*
 3. Create *UserStocks* using the admin and the *Stocks* created
 4. (Optional) Create *Offers* using the *UserStocks* created

## Using the app
 1. Go to http://localhost:8000 and click in *Login* in the top right
 2. Register a new user
 3. Login with the user created
const express = require('express');
const morgan = require('morgan');
const { errorHandlerMiddleware } = require ('./services/errorHandlingService');
const { logger } = require('./services/loggerService');
const { amqpConnect, injectExchangeService } = require('./services/amqpService');
const { mongoConnect } = require('./services/mongoService');
const { addRoutes } = require('./routes/api');
const { cleanCart, cleanCustomer } = require('./lib/tools');


const PORT = process.env.PORT || 3000;

startServer = async () => {
    // Create a new express application instance
    const app = express()

    // Connect to RabbitMQ service  
    amqpConnect()

    // Connect to MongoDB database
    mongoConnect()

    // middleware to add basic logging - Combined format is a standard Apache log output format
    app.use(morgan('combined'));

    // Middleware to parse incoming requests with JSON payloads
    app.use(express.json())

    
    // middleware to inject message-queue services
    app.use(injectExchangeService);

    // Handdle errors
    app.use(errorHandlerMiddleware)

    // Add router handler
    addRoutes(app)

    // Clean existant cart
    await cleanCart();

    // Clen existant customer
    await cleanCustomer();

    app.listen(PORT, () => {
        logger.info(`customer service listening on port ${PORT}`);
    })
}

module.exports = {
    startServer: startServer
}


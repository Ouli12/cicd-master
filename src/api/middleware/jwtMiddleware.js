require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_TOKEN = process.env.JWT_TOKEN;

/**
 * Let the backend verify the token validity from a protected request.
 * @param {*} req The request sent.
 * @param {*} res The response sent.
 * @param {*} next Say it's time to finish the request.
 */
exports.verify_token = (req, res, next) => {
    let token = req.headers['authorization'];

    if (typeof token !== 'undefined') {
        jwt.verify(token, JWT_TOKEN, (err) => {
            console.log('secret token ', JWT_TOKEN);
            if (err) {
                // Return status code + default name defined by error.
                // res.sendStatus(403);
                res.status(403);
                res.json({
                    message: "Forbidden access."
                });
            } else {
                // Give permission to continue the process
                next();
            }
        });
    } else {
        res.status(403);
        res.json({
            message: "Forbidden access."
        });
    }
}


const { validationResult } = require("express-validator");
module.exports = class ResponseUtill {
    /**
     *
     * @param error
     * @returns {{errors: *}|null}
     */
    static validationResponse(res, req) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.mapped() });
        }
        return null;
    }

    /**
     *
     * @param error
     * @returns {{code, data: null, message: string, status: boolean}}
     */
    static errorResponse(error) {
        let message = "Internal Server Error";
        if (error.status === 404) {
            message = "Not found";
        }
        return {
            status: false,
            code: error.status,
            message: message,
            data: null,
        };
    }

    /**
     *
     * @param status {boolean}
     * @param code {int}
     * @param message {string}
     * @param data {object}
     * @returns {{code, data, message, status}}
     */
    static successResponse(status, code, message, data) {
        return {
            status: status,
            code: code,
            message: message,
            data: data,
        };
    }
    static nextError(next, message) {
        next({
            status: 500,
            message: message,
        });
    }

    static getResultFormat = (res, next, result) => {
        if (!result) {
            this.nextError(next, "No Result Found");
        }
        if (result.code == null || result.code == undefined) {
            this.nextError(next, "No Code Found");
        }
        switch (result.code) {
            case 200:
                return res
                    .status(200)
                    .json(
                        this.successResponse(true, result.code, result.message, result.data)
                    );
            case 500:
                this.nextError(next, result.message);
                break;
            default:
                return res
                    .status(200)
                    .json(this.successResponse(false, result.code, result.message, null));
        }
    };
};
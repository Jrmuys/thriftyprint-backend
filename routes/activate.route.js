const express = require("express");
const router = express.Router();

const activate = require("../controller/activation.controller")

router.get(
    "/:str",
    async (req, res, next) => {
        console.log("Activating...")
        try {
            await activate.activateAccount(req.params.str)
            res.status(200).json({
                text: "Successfully activated!"
            })
        } catch (err) {
            res.status(500).json({
                text: "Internal server error",
                error: err
            })
        }
    }
)

module.exports = router;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/', userController_1.createUser);
router.get('/', authMiddleware_1.authMiddleware, userController_1.getUser);
exports.default = router;

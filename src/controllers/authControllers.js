import authService from "../services/authService.js";
import { registerSchema } from "../validators/authValidators.js";

class AuthController {
    async register(req, res, next) {
        try {
            const validation = registerSchema.safeParse(req.boby);

            
        } catch (error) {
            next(error);
        }
    }
}
import { IUser } from "../interfaces/user.interface";
import transporter from "../lib/mailer";
import prisma from "../lib/prisma";
import redis from "../lib/redis";
import { createError } from "../utils/createError";

class EmailService {
    async sendEmail(id: string): Promise<void> {
        const user: IUser = await prisma.user.findUnique({
            where: { id: id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                verifiedEmail: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (user.verifiedEmail) throw createError("E-mail já verificado.", 400);

        const verification = await redis.get(user.email);

        if (!verification) {
            throw createError("E-mail de verificação já encaminhado.", 400);
        }

        // Gera um número entre 100000 e 999999
        const code: number = Math.floor(100000 + Math.random() * 900000);

        // Armazena no redis por 5 minutos
        await redis.set(user.email, code, "EX", 300);

        transporter.sendMail({
            
        })
    }
}
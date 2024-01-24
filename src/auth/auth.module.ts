import { Module , forwardRef} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { RoleGuard } from './guards/role.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { JwtStrategy } from './guards/jwt.strategy';
import { UserModule } from 'src/user/user.module';


@Module({
    imports: [
        forwardRef(() => UserModule), // use forwardRef here
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                secret: config.get('JWT_SECRET'),
                signOptions: {
                    expiresIn: config.get('JWT_EXPIRATION_TIME')
                }
            })
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, RoleGuard , JwtAuthGuard, JwtStrategy ],
    exports: [AuthService]
})
export class AuthModule {}

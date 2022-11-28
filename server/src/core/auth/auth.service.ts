import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PasswordService } from '../password/password.service';
import { User } from '../user/entity/user.entity';
import { UpdateUser } from './auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private passwordService: PasswordService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string, isWx: boolean) {
    const user = await this.userService.findNameOne(username);
    if (!user) {
      throw new HttpException('用户名不存在', HttpStatus.BAD_REQUEST);
    }
    if (isWx && user.isWx) {
      return user;
    }
    const passwordEntity = await this.passwordService.findOne(username);
    if (user && passwordEntity.password === password) {
      return user;
    }
    throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
  }

  async login(user: User) {
    const { id, username } = user;
    return {
      token: this.jwtService.sign({ username, sub: id }),
      user,
    };
  }

  async update(body: UpdateUser) {
    const { username, password, oldPassword } = body;
    const passwordEntity = await this.passwordService.findOne(username);
    if (passwordEntity.password === oldPassword) {
      const updateEntity = await this.passwordService.update(username, {
        ...passwordEntity,
        password,
      });
      return updateEntity;
    }
    throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
  }
}

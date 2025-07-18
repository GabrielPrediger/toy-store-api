import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Por favor, forneça um e-mail válido.' })
  @IsNotEmpty({ message: 'O campo de e-mail não pode estar vazio.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'O campo de senha não pode estar vazio.' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'O campo de nome não pode estar vazio.' })
  name: string;
}

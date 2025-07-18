import { IsString, IsEmail, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsDateString(
    {},
    { message: 'A data de nascimento deve estar no formato YYYY-MM-DD.' },
  )
  @IsNotEmpty()
  birthDate: string;
}

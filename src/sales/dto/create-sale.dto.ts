import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';

export class CreateSaleDto {
  @IsNumber({}, { message: 'O valor da venda deve ser um número.' })
  @IsPositive({ message: 'O valor da venda deve ser um número positivo.' })
  @IsNotEmpty()
  value: number;

  @IsInt({ message: 'O ID do cliente deve ser um número inteiro.' })
  @IsNotEmpty()
  clientId: number;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'A data da venda deve estar no formato YYYY-MM-DD.' },
  )
  saleDate?: string;
}

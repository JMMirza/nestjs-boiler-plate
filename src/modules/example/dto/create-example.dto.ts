import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateExampleDto {
  @ApiProperty({ example: 'My example', description: 'Name of the example' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string;

  @ApiProperty({ example: 'Shows the module pattern', required: false })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;
}

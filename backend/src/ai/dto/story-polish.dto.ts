import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class StoryPolishDto {
  @ApiProperty({
    description: 'Raw story text from the artisan',
    example: 'This saree made by my grandmother technique passed down generations',
  })
  @IsString()
  @MinLength(10)
  rawStory: string;
}
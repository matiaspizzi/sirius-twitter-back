import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateCommentInputDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
    content!: string

  @IsOptional()
  @MaxLength(4)
    images?: string[]
    
  @IsNotEmpty()
  @IsString()
    parentId!: string
}
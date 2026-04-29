import { Controller, Post, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { DeleteCommentDto } from './dto/delete-comment.dto';

@Controller('posts')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':id/comments')
  create(
    @Param('id', ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(postId, dto);
  }

  @Delete(':postId/comments/:commentId')
  remove(
    @Param('postId', ParseIntPipe) postId: number,
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() dto: DeleteCommentDto,
  ) {
    return this.commentsService.remove(postId, commentId, dto);
  }
}

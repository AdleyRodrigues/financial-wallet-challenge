import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type RequestWithUser = {
  user: {
    id: string;
    email: string;
  };
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestWithUser['user'] => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
